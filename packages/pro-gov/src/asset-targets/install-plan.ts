import { existsSync, lstatSync, readFileSync, readlinkSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';

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
      type: 'remove-symlink';
      assetId: string;
      expectedSourcePath: string;
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
  const managedEntries = readManagedEntries(options.targetDir);
  const managedTargets = new Set(managedEntries.map((entry) => entry.targetPath));
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
  const expectedTargetPaths = new Set(
    assetActions
      .filter((action) => 'assetId' in action)
      .map((action) => action.targetPath),
  );
  const removalActions = createRemovalActions(
    options.targetDir,
    options.agentAssetsDir,
    managedEntries,
    expectedTargetPaths,
  );

  return {
    schemaVersion: 1,
    dryRun: true,
    targetDir: options.targetDir,
    host: options.host,
    placement,
    bundleIds: [...options.bundleIds],
    assetIds,
    actions: [
      ...createDirectoryActions([...assetActions, ...writeActions]),
      ...removalActions,
      ...assetActions,
      ...writeActions,
    ],
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

interface ManagedLockEntry {
  id: string;
  sourcePath: string;
  targetPath: string;
}

function readManagedEntries(targetDir: string): ManagedLockEntry[] {
  const lockfilePath = join(targetDir, '.pro-gov/assets.lock.json');
  if (!existsSync(lockfilePath)) return [];
  try {
    const lockfile = JSON.parse(readFileSync(lockfilePath, 'utf8')) as {
      assets?: Array<Partial<ManagedLockEntry>>;
    };
    return (lockfile.assets ?? []).filter(
      (entry): entry is ManagedLockEntry =>
        typeof entry.id === 'string' &&
        typeof entry.sourcePath === 'string' &&
        typeof entry.targetPath === 'string',
    );
  } catch {
    return [];
  }
}

function createRemovalActions(
  targetDir: string,
  agentAssetsDir: string,
  managedEntries: readonly ManagedLockEntry[],
  expectedTargetPaths: ReadonlySet<string>,
): AssetInstallAction[] {
  const actions: AssetInstallAction[] = [];
  for (const entry of managedEntries) {
    if (expectedTargetPaths.has(entry.targetPath)) continue;
    if (!isManagedAssetTargetPath(entry.targetPath)) {
      throw new Error(`Refusing to remove managed asset outside supported roots: ${entry.targetPath}`);
    }
    const targetAbsolutePath = join(targetDir, entry.targetPath);
    if (!pathExistsEvenIfDanglingSymlink(targetAbsolutePath)) continue;
    const stats = lstatSync(targetAbsolutePath);
    if (!stats.isSymbolicLink()) {
      throw new Error(`Refusing to remove path that is no longer a managed symlink: ${entry.targetPath}`);
    }
    const expectedSourcePath = join(agentAssetsDir, entry.sourcePath);
    const actualSourcePath = resolve(dirname(targetAbsolutePath), readlinkSync(targetAbsolutePath));
    if (actualSourcePath !== resolve(expectedSourcePath)) {
      throw new Error(`Refusing to remove managed symlink with changed target: ${entry.targetPath}`);
    }
    actions.push({
      type: 'remove-symlink',
      assetId: entry.id,
      expectedSourcePath,
      targetPath: entry.targetPath,
    });
  }
  return actions.sort((a, b) => a.targetPath.localeCompare(b.targetPath));
}

export function isManagedAssetTargetPath(path: string): boolean {
  return [
    '.agents/skills/',
    '.agents/manual-skills/',
    '.claude/skills/',
    '.pro-gov/agent-assets/rules/',
    '.pro-gov/agent-assets/commands/',
  ].some((prefix) => path.startsWith(prefix));
}

function pathExistsEvenIfDanglingSymlink(path: string): boolean {
  try {
    lstatSync(path);
    return true;
  } catch {
    return false;
  }
}
