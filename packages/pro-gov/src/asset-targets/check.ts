import { existsSync, lstatSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { hashAgentAssetContent } from '../asset-registry/loader';
import type { AgentAssetRegistry } from '../asset-registry/registry';

export type AssetCheckIssueType =
  | 'missing-lock'
  | 'missing-target'
  | 'unmanaged-conflict'
  | 'dangling-symlink'
  | 'missing-source'
  | 'hash-drift'
  | 'unknown-asset';

export interface AssetCheckIssue {
  type: AssetCheckIssueType;
  id?: string;
  targetPath?: string;
  message: string;
}

export interface AssetCheckResult {
  targetDir: string;
  issues: AssetCheckIssue[];
}

interface AssetLockfile {
  assets?: AssetLockEntry[];
}

interface AssetLockEntry {
  id: string;
  sourcePath: string;
  targetPath: string;
  contentHash: string;
}

export function checkInstalledAssets(options: {
  targetDir: string;
  agentAssetsDir: string;
  registry: AgentAssetRegistry;
}): AssetCheckResult {
  const lockfilePath = join(options.targetDir, '.pro-gov/assets.lock.json');
  if (!existsSync(lockfilePath)) {
    return {
      targetDir: options.targetDir,
      issues: [
        {
          type: 'missing-lock',
          message: 'Missing .pro-gov/assets.lock.json',
        },
      ],
    };
  }

  const registryById = new Map(options.registry.assets.map((asset) => [asset.id, asset]));
  const lockfile = JSON.parse(readFileSync(lockfilePath, 'utf8')) as AssetLockfile;
  const issues: AssetCheckIssue[] = [];

  for (const entry of lockfile.assets ?? []) {
    const asset = registryById.get(entry.id);
    const targetAbsolutePath = join(options.targetDir, entry.targetPath);
    const sourceAbsolutePath = join(options.agentAssetsDir, entry.sourcePath);

    if (!asset) {
      issues.push({
        type: 'unknown-asset',
        id: entry.id,
        targetPath: entry.targetPath,
        message: `Lockfile references unknown asset: ${entry.id}`,
      });
      continue;
    }

    if (!pathExistsEvenIfDanglingSymlink(targetAbsolutePath)) {
      issues.push({
        type: 'missing-target',
        id: entry.id,
        targetPath: entry.targetPath,
        message: `Managed target is missing: ${entry.targetPath}`,
      });
      continue;
    }

    const targetStats = lstatSync(targetAbsolutePath);
    if (!targetStats.isSymbolicLink()) {
      issues.push({
        type: 'unmanaged-conflict',
        id: entry.id,
        targetPath: entry.targetPath,
        message: `Managed target is not a symlink: ${entry.targetPath}`,
      });
      continue;
    }

    if (!existsSync(targetAbsolutePath)) {
      issues.push({
        type: 'dangling-symlink',
        id: entry.id,
        targetPath: entry.targetPath,
        message: `Managed symlink is dangling: ${entry.targetPath}`,
      });
      continue;
    }

    if (!existsSync(sourceAbsolutePath)) {
      issues.push({
        type: 'missing-source',
        id: entry.id,
        targetPath: entry.targetPath,
        message: `Managed asset source is missing: ${entry.sourcePath}`,
      });
      continue;
    }

    const currentHash = hashAgentAssetContent(asset, options.agentAssetsDir);
    if (currentHash !== entry.contentHash) {
      issues.push({
        type: 'hash-drift',
        id: entry.id,
        targetPath: entry.targetPath,
        message: `Managed asset hash drifted: ${entry.id}`,
      });
    }
  }

  return { targetDir: options.targetDir, issues };
}

function pathExistsEvenIfDanglingSymlink(path: string): boolean {
  try {
    lstatSync(path);
    return true;
  } catch {
    return false;
  }
}
