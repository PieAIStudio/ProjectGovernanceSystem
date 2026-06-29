import { existsSync, lstatSync, readFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';

import { createAgentAssetLockEntries } from '../asset-registry/loader';
import type {
  AgentAssetRegistry,
  AgentAssetRegistryEntry,
  AssetRegistryHost,
  AssetRegistrySkillPlacement,
} from '../asset-registry/registry';
import type { AgentAssetBundle } from '../asset-bundles/bundles';

export type AssetInstallAction =
  | {
      type: 'create-dir';
      targetPath: string;
    }
  | {
      type: 'symlink';
      assetId: string;
      sourcePath: string;
      targetPath: string;
    }
  | {
      type: 'update-symlink';
      assetId: string;
      sourcePath: string;
      targetPath: string;
    }
  | {
      type: 'write-file';
      targetPath: string;
      content: string;
    };

export interface AssetInstallPlan {
  schemaVersion: 1;
  dryRun: true;
  targetDir: string;
  host: AssetRegistryHost;
  placement: AssetInstallPlacement;
  bundleIds: string[];
  assetIds: string[];
  actions: AssetInstallAction[];
}

export type AssetSkillPlacement = 'auto' | 'manual';
export type AssetInstallPlacement = AssetSkillPlacement | 'registry';

export interface CreateAssetInstallPlanOptions {
  targetDir: string;
  agentAssetsDir: string;
  registry: AgentAssetRegistry;
  bundles: readonly AgentAssetBundle[];
  bundleIds: readonly string[];
  host: AssetRegistryHost;
  placement?: AssetSkillPlacement;
}

export function createAssetInstallPlan(options: CreateAssetInstallPlanOptions): AssetInstallPlan {
  const placement: AssetInstallPlacement = options.placement ?? 'registry';
  const assetsById = new Map(options.registry.assets.map((asset) => [asset.id, asset]));
  const bundlesById = new Map(options.bundles.map((bundle) => [bundle.id, bundle]));
  const assetIds = resolveBundleAssetIds(options.bundleIds, bundlesById);
  const assets = assetIds.map((assetId) => {
    const asset = assetsById.get(assetId);
    if (!asset) throw new Error(`Unknown asset id in bundle: ${assetId}`);
    if (asset.kind === 'skill' && !asset.hosts.includes(options.host)) {
      throw new Error(`Asset ${assetId} does not support host ${options.host}`);
    }
    return asset;
  });
  const lockEntries = createAgentAssetLockEntries(options.registry, options.agentAssetsDir, assetIds);
  const managedTargets = readManagedTargets(options.targetDir);
  const assetActions = assets.map((asset) =>
    createAssetAction(asset, options.agentAssetsDir, options.targetDir, options.host, placement, managedTargets),
  );
  const manifest = {
    schemaVersion: 1,
    host: options.host,
    placement,
    bundleIds: [...options.bundleIds],
    assetIds,
  };
  const lockfile = {
    schemaVersion: 1,
    host: options.host,
    placement,
    bundleIds: [...options.bundleIds],
    assets: lockEntries.map((entry) => {
      const action = assetActions.find((candidate) => 'assetId' in candidate && candidate.assetId === entry.id);
      return {
        ...entry,
        targetPath: action && 'targetPath' in action ? action.targetPath : '',
      };
    }),
  };
  const writeActions: AssetInstallAction[] = [
    {
      type: 'write-file',
      targetPath: '.pro-gov/assets.json',
      content: `${JSON.stringify(manifest, null, 2)}\n`,
    },
    {
      type: 'write-file',
      targetPath: '.pro-gov/assets.lock.json',
      content: `${JSON.stringify(lockfile, null, 2)}\n`,
    },
  ];

  return {
    schemaVersion: 1,
    dryRun: true,
    targetDir: options.targetDir,
    host: options.host,
    placement,
    bundleIds: [...options.bundleIds],
    assetIds,
    actions: [...createDirectoryActions([...assetActions, ...writeActions]), ...assetActions, ...writeActions],
  };
}

function resolveBundleAssetIds(
  bundleIds: readonly string[],
  bundlesById: ReadonlyMap<string, AgentAssetBundle>,
): string[] {
  const ids = new Set<string>();
  for (const bundleId of bundleIds) {
    const bundle = bundlesById.get(bundleId);
    if (!bundle) throw new Error(`Unknown bundle id: ${bundleId}`);
    for (const assetId of bundle.assets) {
      ids.add(assetId);
    }
  }
  return [...ids].sort();
}

function createAssetAction(
  asset: AgentAssetRegistryEntry,
  agentAssetsDir: string,
  targetDir: string,
  host: AssetRegistryHost,
  placement: AssetInstallPlacement,
  managedTargets: ReadonlySet<string>,
): AssetInstallAction {
  if (asset.kind === 'skill' && asset.defaultScope === 'user') {
    throw new Error(
      `User-scoped asset ${asset.id} must be linked at the user level, not installed into a project target.`,
    );
  }

  const sourcePath = join(agentAssetsDir, asset.sourcePath);
  const targetPath = resolveHostTargetPath(asset, host, placement);
  const targetAbsolutePath = join(targetDir, targetPath);
  const targetExists = pathExistsEvenIfDanglingSymlink(targetAbsolutePath);

  if (targetExists) {
    const stats = lstatSync(targetAbsolutePath);
    if (stats.isSymbolicLink() && managedTargets.has(targetPath)) {
      return {
        type: 'update-symlink',
        assetId: asset.id,
        sourcePath,
        targetPath,
      };
    }
    throw new Error(`Refusing to overwrite unmanaged target: ${targetPath}`);
  }

  return {
    type: 'symlink',
    assetId: asset.id,
    sourcePath,
    targetPath,
  };
}

function resolveHostTargetPath(
  asset: AgentAssetRegistryEntry,
  host: AssetRegistryHost,
  placement: AssetInstallPlacement,
): string {
  if (asset.kind === 'skill') {
    const effectivePlacement = resolveSkillPlacement(asset, placement);
    if (host === 'claude-code') {
      if (placement === 'manual') {
        throw new Error('Manual skill placement is only supported for .agents hosts');
      }
      return `.claude/skills/${basename(asset.sourcePath)}`;
    }
    if (effectivePlacement === 'manual') {
      return `.agents/manual-skills/${basename(asset.sourcePath)}`;
    }
    return `.agents/skills/${basename(asset.sourcePath)}`;
  }
  if (asset.kind === 'rule') {
    return `.pro-gov/agent-assets/rules/${basename(asset.sourcePath)}`;
  }
  return `.pro-gov/agent-assets/commands/${basename(asset.sourcePath)}`;
}

function resolveSkillPlacement(
  asset: AgentAssetRegistryEntry,
  placement: AssetInstallPlacement,
): AssetRegistrySkillPlacement {
  if (placement !== 'registry') return placement;
  return asset.defaultPlacement ?? 'auto';
}

function createDirectoryActions(actions: readonly AssetInstallAction[]): AssetInstallAction[] {
  const directories = new Set<string>();
  for (const action of actions) {
    if (action.type === 'create-dir') continue;
    const directory = dirname(action.targetPath);
    if (directory !== '.') directories.add(directory);
  }
  return [...directories].sort().map((targetPath) => ({ type: 'create-dir', targetPath }));
}

function readManagedTargets(targetDir: string): ReadonlySet<string> {
  const lockfilePath = join(targetDir, '.pro-gov/assets.lock.json');
  if (!existsSync(lockfilePath)) return new Set();
  try {
    const lockfile = JSON.parse(readFileSync(lockfilePath, 'utf8')) as {
      assets?: Array<{ targetPath?: string }>;
    };
    return new Set((lockfile.assets ?? []).map((asset) => asset.targetPath).filter(Boolean) as string[]);
  } catch {
    return new Set();
  }
}

function pathExistsEvenIfDanglingSymlink(path: string): boolean {
  try {
    lstatSync(path);
    return true;
  } catch {
    return false;
  }
}
