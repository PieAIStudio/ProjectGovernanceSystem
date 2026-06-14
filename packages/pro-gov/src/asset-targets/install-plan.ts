import { basename, join } from 'node:path';

import { createAgentAssetLockEntries } from '../asset-registry/loader';
import type { AgentAssetRegistry, AgentAssetRegistryEntry, AssetRegistryHost } from '../asset-registry/registry';
import type { AgentAssetBundle } from '../asset-bundles/bundles';

export type AssetInstallAction =
  | {
      type: 'symlink';
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
  bundleIds: string[];
  assetIds: string[];
  actions: AssetInstallAction[];
}

export interface CreateAssetInstallPlanOptions {
  targetDir: string;
  agentAssetsDir: string;
  registry: AgentAssetRegistry;
  bundles: readonly AgentAssetBundle[];
  bundleIds: readonly string[];
  host: AssetRegistryHost;
}

export function createAssetInstallPlan(options: CreateAssetInstallPlanOptions): AssetInstallPlan {
  if (options.host !== 'codex') {
    throw new Error('Only the codex host adapter is implemented for asset install plans.');
  }

  const assetsById = new Map(options.registry.assets.map((asset) => [asset.id, asset]));
  const bundlesById = new Map(options.bundles.map((bundle) => [bundle.id, bundle]));
  const assetIds = resolveBundleAssetIds(options.bundleIds, bundlesById);
  const assets = assetIds.map((assetId) => {
    const asset = assetsById.get(assetId);
    if (!asset) throw new Error(`Unknown asset id in bundle: ${assetId}`);
    return asset;
  });
  const lockEntries = createAgentAssetLockEntries(options.registry, options.agentAssetsDir, assetIds);
  const manifest = {
    schemaVersion: 1,
    host: options.host,
    bundleIds: [...options.bundleIds],
    assetIds,
  };
  const lockfile = {
    schemaVersion: 1,
    host: options.host,
    bundleIds: [...options.bundleIds],
    assets: lockEntries,
  };

  return {
    schemaVersion: 1,
    dryRun: true,
    targetDir: options.targetDir,
    host: options.host,
    bundleIds: [...options.bundleIds],
    assetIds,
    actions: [
      ...assets.map((asset) => createSymlinkAction(asset, options.agentAssetsDir)),
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

function createSymlinkAction(
  asset: AgentAssetRegistryEntry,
  agentAssetsDir: string,
): AssetInstallAction {
  const sourcePath = join(agentAssetsDir, asset.sourcePath);
  return {
    type: 'symlink',
    assetId: asset.id,
    sourcePath,
    targetPath: resolveCodexTargetPath(asset),
  };
}

function resolveCodexTargetPath(asset: AgentAssetRegistryEntry): string {
  if (asset.kind === 'skill') {
    return `.agents/skills/${basename(asset.sourcePath)}`;
  }
  if (asset.kind === 'rule') {
    return `.pro-gov/agent-assets/rules/${basename(asset.sourcePath)}`;
  }
  return `.pro-gov/agent-assets/commands/${basename(asset.sourcePath)}`;
}
