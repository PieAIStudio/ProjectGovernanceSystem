import { existsSync, lstatSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';

import { hashAgentAssetContent } from '../asset-registry/loader';
import type { AgentAssetRegistry, AgentAssetRegistryEntry } from '../asset-registry/registry';

export type AssetCheckIssueType =
  | 'missing-lock'
  | 'missing-target'
  | 'unmanaged-conflict'
  | 'dangling-symlink'
  | 'missing-source'
  | 'hash-drift'
  | 'unknown-asset'
  | 'unsupported-host-folder'
  | 'duplicate-skill-placement'
  | 'skill-placement-drift'
  | 'user-scoped-asset-in-project-lock';

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
  host?: string;
  placement?: string;
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

    if (asset.kind === 'skill' && asset.defaultScope === 'user') {
      issues.push({
        type: 'user-scoped-asset-in-project-lock',
        id: entry.id,
        targetPath: entry.targetPath,
        message: `User-scoped skill is still locked into this project; move it to the user skill roots: ${entry.id}`,
      });
    }

    const hostFolderIssue = checkHostFolder(lockfile.host, asset.kind, entry.targetPath, entry.id);
    if (hostFolderIssue) {
      issues.push(hostFolderIssue);
    }

    const placementDriftIssue = checkRegistryPlacement(lockfile, asset, entry.targetPath);
    if (placementDriftIssue) {
      issues.push(placementDriftIssue);
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

  issues.push(...checkDuplicateSkillPlacements(options.targetDir, options.registry));

  return { targetDir: options.targetDir, issues };
}

function checkRegistryPlacement(
  lockfile: AssetLockfile,
  asset: AgentAssetRegistryEntry,
  targetPath: string,
): AssetCheckIssue | undefined {
  if (lockfile.placement !== 'registry') return undefined;
  if (asset.kind !== 'skill') return undefined;
  const expectedPath = expectedRegistrySkillTargetPath(lockfile.host, asset.sourcePath, asset.defaultPlacement);
  if (!expectedPath || targetPath === expectedPath) return undefined;
  return {
    type: 'skill-placement-drift',
    id: asset.id,
    targetPath,
    message: `Managed skill target ${targetPath} does not match registry placement; expected ${expectedPath}`,
  };
}

function checkDuplicateSkillPlacements(
  targetDir: string,
  registry: AgentAssetRegistry,
): AssetCheckIssue[] {
  const issues: AssetCheckIssue[] = [];
  for (const asset of registry.assets) {
    if (asset.kind !== 'skill') continue;
    const skillName = basename(asset.sourcePath);
    const autoPath = `.agents/skills/${skillName}`;
    const manualPath = `.agents/manual-skills/${skillName}`;
    if (
      pathExistsEvenIfDanglingSymlink(join(targetDir, autoPath)) &&
      pathExistsEvenIfDanglingSymlink(join(targetDir, manualPath))
    ) {
      issues.push({
        type: 'duplicate-skill-placement',
        id: asset.id,
        targetPath: `${autoPath} + ${manualPath}`,
        message: `Skill is linked in both auto and manual locations: ${skillName}`,
      });
    }
  }
  return issues;
}

function checkHostFolder(
  host: string | undefined,
  kind: string,
  targetPath: string,
  id: string,
): AssetCheckIssue | undefined {
  if (kind !== 'skill') return undefined;

  const expectedPrefixes = expectedSkillTargetPrefixes(host);
  if (!expectedPrefixes) {
    return {
      type: 'unsupported-host-folder',
      id,
      targetPath,
      message: `Lockfile host is unsupported for managed skill target: ${host ?? 'missing'}`,
    };
  }

  if (!expectedPrefixes.some((prefix) => targetPath.startsWith(prefix))) {
    return {
      type: 'unsupported-host-folder',
      id,
      targetPath,
      message: `Managed skill target ${targetPath} does not match host ${host}; expected ${expectedPrefixes.join(' or ')}`,
    };
  }

  return undefined;
}

function expectedSkillTargetPrefixes(host: string | undefined): string[] | undefined {
  if (host === 'claude-code') return ['.claude/skills/'];
  if (host === 'codex' || host === 'gemini-cli' || host === 'antigravity') {
    return ['.agents/skills/', '.agents/manual-skills/'];
  }
  return undefined;
}

function expectedRegistrySkillTargetPath(
  host: string | undefined,
  sourcePath: string,
  placement: string | undefined,
): string | undefined {
  const skillName = basename(sourcePath);
  if (host === 'claude-code') {
    return placement === 'manual' ? undefined : `.claude/skills/${skillName}`;
  }
  if (host === 'codex' || host === 'gemini-cli' || host === 'antigravity') {
    return placement === 'manual'
      ? `.agents/manual-skills/${skillName}`
      : `.agents/skills/${skillName}`;
  }
  return undefined;
}

function pathExistsEvenIfDanglingSymlink(path: string): boolean {
  try {
    lstatSync(path);
    return true;
  } catch {
    return false;
  }
}
