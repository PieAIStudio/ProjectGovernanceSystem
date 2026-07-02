import { existsSync, lstatSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { AssetInstallPlan } from '../asset-targets/install-plan';

export type PortfolioAssetStateIssueType =
  | 'bundle-drift'
  | 'asset-set-drift'
  | 'asset-lock-drift'
  | 'orphaned-managed-symlink';

export interface PortfolioAssetStateIssue {
  type: PortfolioAssetStateIssueType;
  targetPath?: string;
  message: string;
}

export interface PortfolioAssetStateResult {
  issues: PortfolioAssetStateIssue[];
}

interface AssetManifest {
  bundleIds?: string[];
  assetIds?: string[];
}

interface AssetLockEntry {
  id: string;
  sourcePath: string;
  targetPath: string;
  contentHash: string;
}

interface AssetLockfile {
  host?: string;
  placement?: string;
  bundleIds?: string[];
  assets?: AssetLockEntry[];
}

export function comparePortfolioAssetState(options: {
  targetDir: string;
  expectedPlan: AssetInstallPlan;
}): PortfolioAssetStateResult {
  const expectedManifest = readPlanDocument<AssetManifest>(options.expectedPlan, '.pro-gov/assets.json');
  const expectedLock = readPlanDocument<AssetLockfile>(options.expectedPlan, '.pro-gov/assets.lock.json');
  const currentManifest = readJsonFile<AssetManifest>(join(options.targetDir, '.pro-gov/assets.json'));
  const currentLock = readJsonFile<AssetLockfile>(join(options.targetDir, '.pro-gov/assets.lock.json'));
  const issues: PortfolioAssetStateIssue[] = [];

  if (!sameStrings(currentManifest?.bundleIds, expectedManifest?.bundleIds)) {
    issues.push({
      type: 'bundle-drift',
      message: 'Target asset bundles do not match the portfolio manifest.',
    });
  }
  if (!sameStrings(currentManifest?.assetIds, expectedManifest?.assetIds)) {
    issues.push({
      type: 'asset-set-drift',
      message: 'Target asset ids do not match the current bundle definitions.',
    });
  }
  if (!sameLock(currentLock, expectedLock)) {
    issues.push({
      type: 'asset-lock-drift',
      message: 'Target asset lock does not match the current registry, placement, and content hashes.',
    });
  }

  const expectedTargets = new Set((expectedLock?.assets ?? []).map((entry) => entry.targetPath));
  for (const entry of currentLock?.assets ?? []) {
    if (expectedTargets.has(entry.targetPath)) continue;
    const targetAbsolutePath = join(options.targetDir, entry.targetPath);
    if (!pathIsSymlink(targetAbsolutePath)) continue;
    issues.push({
      type: 'orphaned-managed-symlink',
      targetPath: entry.targetPath,
      message: `Previously managed symlink is absent from the expected bundle state: ${entry.targetPath}`,
    });
  }

  return { issues };
}

function readPlanDocument<T>(plan: AssetInstallPlan, targetPath: string): T | undefined {
  const action = plan.actions.find(
    (candidate) => candidate.type === 'write-file' && candidate.targetPath === targetPath,
  );
  if (!action || action.type !== 'write-file') return undefined;
  try {
    return JSON.parse(action.content) as T;
  } catch {
    return undefined;
  }
}

function readJsonFile<T>(path: string): T | undefined {
  if (!existsSync(path)) return undefined;
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as T;
  } catch {
    return undefined;
  }
}

function sameStrings(left: string[] | undefined, right: string[] | undefined): boolean {
  return JSON.stringify([...(left ?? [])].sort()) === JSON.stringify([...(right ?? [])].sort());
}

function sameLock(left: AssetLockfile | undefined, right: AssetLockfile | undefined): boolean {
  return JSON.stringify(normalizeLock(left)) === JSON.stringify(normalizeLock(right));
}

function normalizeLock(lock: AssetLockfile | undefined): AssetLockfile {
  return {
    host: lock?.host,
    placement: lock?.placement,
    bundleIds: [...(lock?.bundleIds ?? [])].sort(),
    assets: [...(lock?.assets ?? [])].sort((a, b) => a.id.localeCompare(b.id)),
  };
}

function pathIsSymlink(path: string): boolean {
  try {
    return lstatSync(path).isSymbolicLink();
  } catch {
    return false;
  }
}
