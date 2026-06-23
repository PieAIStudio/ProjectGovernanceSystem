import {
  existsSync,
  readdirSync,
  readFileSync,
  realpathSync,
} from 'node:fs';
import type { Dirent } from 'node:fs';
import { basename, join, relative } from 'node:path';

export type AssetSourceFamily =
  | 'pie-skills'
  | 'npx-skills'
  | 'pie-rules'
  | 'pie-commands';

export type AgentAssetKind = 'skill' | 'rule' | 'command';

export type InventoryIssueType =
  | 'dangling-symlink'
  | 'duplicate-name'
  | 'missing-skill-md'
  | 'missing-npx-lock'
  | 'npx-lock-missing-skill-dir'
  | 'npx-skill-dir-missing-lock';

export interface AgentAssetSourceConfig {
  projectSkillsRoot?: string;
  globalSkillsRoot?: string;
  npxRoot?: string;
  ruleRoots?: string[];
  commandRoots?: string[];
}

export interface AgentAssetInventoryItem {
  name: string;
  family: AssetSourceFamily;
  kind: AgentAssetKind;
  absolutePath: string;
  relativePath: string;
}

export interface AgentAssetInventoryIssue {
  type: InventoryIssueType;
  family?: AssetSourceFamily;
  name?: string;
  path: string;
  message: string;
}

export interface AgentAssetInventoryReport {
  assets: AgentAssetInventoryItem[];
  issues: AgentAssetInventoryIssue[];
  counts: Record<AssetSourceFamily, number>;
}

interface NpxLock {
  skills?: Record<string, unknown>;
}

const emptyCounts: Record<AssetSourceFamily, number> = {
  'pie-skills': 0,
  'npx-skills': 0,
  'pie-rules': 0,
  'pie-commands': 0,
};

const skippedSkillRootNames = new Set([
  '.agents',
  '.claude',
  '.gemini',
  '_npx_skills',
  '_packages',
  '_shared',
  'node_modules',
  'skills',
]);

export function scanAgentAssetSources(config: AgentAssetSourceConfig): AgentAssetInventoryReport {
  const assets: AgentAssetInventoryItem[] = [];
  const issues: AgentAssetInventoryIssue[] = [];

  const addAsset = (item: AgentAssetInventoryItem): void => {
    assets.push(item);
  };

  const skillRoots = [
    { root: config.projectSkillsRoot, family: 'pie-skills' as const },
    { root: config.globalSkillsRoot, family: 'pie-skills' as const },
  ];

  for (const source of skillRoots) {
    if (!source.root || !existsSync(source.root)) continue;
    collectDanglingSymlinks(source.root, source.family, issues, { skipSkillRootEntries: true });
    for (const entry of safeReadDir(source.root)) {
      if (!entry.isDirectory()) continue;
      if (shouldSkipSkillEntry(entry.name)) continue;
      const absolutePath = join(source.root, entry.name);
      const skillPath = join(absolutePath, 'SKILL.md');
      if (!existsSync(skillPath)) {
        issues.push({
          type: 'missing-skill-md',
          family: source.family,
          name: entry.name,
          path: absolutePath,
          message: `Skill directory is missing SKILL.md: ${entry.name}`,
        });
        continue;
      }
      addAsset(makeAsset(entry.name, source.family, 'skill', absolutePath, source.root));
    }
  }

  if (config.npxRoot && existsSync(config.npxRoot)) {
    collectDanglingSymlinks(config.npxRoot, 'npx-skills', issues);
    const npxSkillsRoot = join(config.npxRoot, '.agents', 'skills');
    const lockPath = join(config.npxRoot, 'skills-lock.json');
    const lockedSkillNames = readNpxLockedSkillNames(lockPath, issues);
    const installedSkillNames = new Set<string>();

    if (existsSync(npxSkillsRoot)) {
      for (const entry of safeReadDir(npxSkillsRoot)) {
        if (!entry.isDirectory()) continue;
        const absolutePath = join(npxSkillsRoot, entry.name);
        if (!existsSync(join(absolutePath, 'SKILL.md'))) {
          issues.push({
            type: 'missing-skill-md',
            family: 'npx-skills',
            name: entry.name,
            path: absolutePath,
            message: `Npx skill directory is missing SKILL.md: ${entry.name}`,
          });
          continue;
        }
        installedSkillNames.add(entry.name);
        addAsset(makeAsset(entry.name, 'npx-skills', 'skill', absolutePath, config.npxRoot));
      }
    }

    for (const skillName of lockedSkillNames) {
      if (!installedSkillNames.has(skillName)) {
        issues.push({
          type: 'npx-lock-missing-skill-dir',
          family: 'npx-skills',
          name: skillName,
          path: join(npxSkillsRoot, skillName),
          message: `skills-lock.json tracks a skill that is not installed: ${skillName}`,
        });
      }
    }

    for (const skillName of installedSkillNames) {
      if (!lockedSkillNames.has(skillName)) {
        issues.push({
          type: 'npx-skill-dir-missing-lock',
          family: 'npx-skills',
          name: skillName,
          path: join(npxSkillsRoot, skillName),
          message: `Installed npx skill is missing from skills-lock.json: ${skillName}`,
        });
      }
    }
  }

  collectMarkdownAssets(config.ruleRoots ?? [], 'pie-rules', 'rule', assets, issues);
  collectMarkdownAssets(config.commandRoots ?? [], 'pie-commands', 'command', assets, issues);
  collectDuplicateIssues(assets, issues);

  const counts = { ...emptyCounts };
  for (const asset of assets) {
    counts[asset.family] += 1;
  }

  return {
    assets: assets.sort(compareAssets),
    issues: issues.sort(compareIssues),
    counts,
  };
}

function collectMarkdownAssets(
  roots: string[],
  family: Extract<AssetSourceFamily, 'pie-rules' | 'pie-commands'>,
  kind: Extract<AgentAssetKind, 'rule' | 'command'>,
  assets: AgentAssetInventoryItem[],
  issues: AgentAssetInventoryIssue[],
): void {
  for (const root of roots) {
    if (!existsSync(root)) continue;
    collectDanglingSymlinks(root, family, issues);
    for (const path of listMarkdownFiles(root)) {
      assets.push(makeAsset(basename(path, '.md'), family, kind, path, root));
    }
  }
}

function listMarkdownFiles(root: string): string[] {
  const files: string[] = [];
  for (const entry of safeReadDir(root)) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    const absolutePath = join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...listMarkdownFiles(absolutePath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(absolutePath);
    }
  }
  return files.sort();
}

function collectDanglingSymlinks(
  root: string,
  family: AssetSourceFamily,
  issues: AgentAssetInventoryIssue[],
  options: { skipSkillRootEntries?: boolean } = {},
): void {
  for (const entry of safeReadDir(root)) {
    if (options.skipSkillRootEntries && shouldSkipSkillEntry(entry.name)) continue;
    const absolutePath = join(root, entry.name);
    if (entry.isSymbolicLink()) {
      try {
        realpathSync(absolutePath);
      } catch {
        issues.push({
          type: 'dangling-symlink',
          family,
          name: entry.name,
          path: absolutePath,
          message: `Dangling symlink: ${absolutePath}`,
        });
      }
      continue;
    }
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      collectDanglingSymlinks(absolutePath, family, issues, options);
    }
  }
}

function collectDuplicateIssues(
  assets: AgentAssetInventoryItem[],
  issues: AgentAssetInventoryIssue[],
): void {
  const byKey = new Map<string, AgentAssetInventoryItem[]>();
  for (const asset of assets) {
    const key = `${asset.kind}:${asset.name}`;
    byKey.set(key, [...(byKey.get(key) ?? []), asset]);
  }

  for (const items of byKey.values()) {
    if (items.length < 2) continue;
    const first = items[0];
    issues.push({
      type: 'duplicate-name',
      family: first.family,
      name: first.name,
      path: first.absolutePath,
      message: `Duplicate ${first.kind} name across sources: ${first.name}`,
    });
  }
}

function readNpxLockedSkillNames(
  lockPath: string,
  issues: AgentAssetInventoryIssue[],
): Set<string> {
  if (!existsSync(lockPath)) {
    issues.push({
      type: 'missing-npx-lock',
      family: 'npx-skills',
      path: lockPath,
      message: 'Missing npx skills-lock.json',
    });
    return new Set();
  }

  try {
    const parsed = JSON.parse(readFileSync(lockPath, 'utf8')) as NpxLock;
    return new Set(Object.keys(parsed.skills ?? {}));
  } catch {
    issues.push({
      type: 'missing-npx-lock',
      family: 'npx-skills',
      path: lockPath,
      message: 'Unreadable npx skills-lock.json',
    });
    return new Set();
  }
}

function makeAsset(
  name: string,
  family: AssetSourceFamily,
  kind: AgentAssetKind,
  absolutePath: string,
  root: string,
): AgentAssetInventoryItem {
  return {
    name,
    family,
    kind,
    absolutePath,
    relativePath: toUnixPath(relative(root, absolutePath)),
  };
}

function shouldSkipSkillEntry(name: string): boolean {
  return name.startsWith('.') || name.startsWith('_') || skippedSkillRootNames.has(name);
}

function safeReadDir(path: string): Dirent<string>[] {
  try {
    return readdirSync(path, { withFileTypes: true });
  } catch {
    return [];
  }
}

function compareAssets(a: AgentAssetInventoryItem, b: AgentAssetInventoryItem): number {
  return `${a.family}:${a.kind}:${a.name}`.localeCompare(`${b.family}:${b.kind}:${b.name}`);
}

function compareIssues(a: AgentAssetInventoryIssue, b: AgentAssetInventoryIssue): number {
  return `${a.type}:${a.name ?? ''}:${a.path}`.localeCompare(`${b.type}:${b.name ?? ''}:${b.path}`);
}

function toUnixPath(path: string): string {
  return path.replaceAll('\\', '/');
}
