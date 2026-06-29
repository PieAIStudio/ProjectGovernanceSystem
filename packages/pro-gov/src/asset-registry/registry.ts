import { existsSync, lstatSync } from 'node:fs';
import { isAbsolute, join, posix } from 'node:path';

export type AssetRegistryVisibility = 'public' | 'private' | 'third-party';
export type AssetRegistryFamily =
  | 'pie-skills'
  | 'npx-skills'
  | 'pie-rules'
  | 'pie-commands';
export type AssetRegistryKind = 'skill' | 'rule' | 'command';
export type AssetRegistrySourceKind = 'local' | 'local-pack' | 'npx';
export type AssetRegistryHost = 'codex' | 'claude-code' | 'gemini-cli' | 'antigravity';
export type AssetRegistrySkillPlacement = 'auto' | 'manual';

export interface AgentAssetRegistryEntry {
  id: string;
  title: string;
  family: AssetRegistryFamily;
  kind: AssetRegistryKind;
  visibility: AssetRegistryVisibility;
  sourceKind: AssetRegistrySourceKind;
  sourcePath: string;
  hosts: readonly AssetRegistryHost[];
  tags: readonly string[];
  defaultPlacement?: AssetRegistrySkillPlacement;
  publishable: boolean;
  origin: string;
  notes: string;
  promotion?: AgentAssetPromotionMetadata;
}

export interface AgentAssetPromotionMetadata {
  privateSourcePath: string;
  privateSourceHash: string;
  publicHash: string;
  sanitized: boolean;
  lastReviewed: string;
  reviewNotes: string;
}

export interface AgentAssetRegistry {
  schemaVersion: 1;
  assets: readonly AgentAssetRegistryEntry[];
}

export type AssetRegistryIssueType =
  | 'duplicate-id'
  | 'unsafe-source-path'
  | 'non-public-publishable'
  | 'unsupported-host'
  | 'unsupported-enum'
  | 'missing-source-path'
  | 'missing-skill-file'
  | 'unsupported-skill-placement'
  | 'internal-npx-compatibility-layer';

export interface AssetRegistryIssue {
  type: AssetRegistryIssueType;
  id: string;
  path?: string;
  message: string;
}

export interface AssetRegistryValidationOptions {
  agentAssetsDir?: string;
}

const supportedFamilies = new Set<AssetRegistryFamily>([
  'pie-skills',
  'npx-skills',
  'pie-rules',
  'pie-commands',
]);
const supportedKinds = new Set<AssetRegistryKind>(['skill', 'rule', 'command']);
const supportedVisibilities = new Set<AssetRegistryVisibility>([
  'public',
  'private',
  'third-party',
]);
const supportedSourceKinds = new Set<AssetRegistrySourceKind>(['local', 'local-pack', 'npx']);
const supportedSkillPlacements = new Set<AssetRegistrySkillPlacement>(['auto', 'manual']);
const supportedHosts = new Set<AssetRegistryHost>([
  'codex',
  'claude-code',
  'gemini-cli',
  'antigravity',
]);

export function validateAssetRegistry(
  registry: AgentAssetRegistry,
  options: AssetRegistryValidationOptions = {},
): AssetRegistryIssue[] {
  const issues: AssetRegistryIssue[] = [];
  const seenIds = new Set<string>();

  for (const asset of registry.assets) {
    if (seenIds.has(asset.id)) {
      issues.push({
        type: 'duplicate-id',
        id: asset.id,
        message: `Duplicate asset id: ${asset.id}`,
      });
    }
    seenIds.add(asset.id);

    if (!supportedFamilies.has(asset.family)) {
      issues.push({
        type: 'unsupported-enum',
        id: asset.id,
        message: `Unsupported asset family: ${asset.family}`,
      });
    }

    if (!supportedKinds.has(asset.kind)) {
      issues.push({
        type: 'unsupported-enum',
        id: asset.id,
        message: `Unsupported asset kind: ${asset.kind}`,
      });
    }

    if (!supportedVisibilities.has(asset.visibility)) {
      issues.push({
        type: 'unsupported-enum',
        id: asset.id,
        message: `Unsupported asset visibility: ${asset.visibility}`,
      });
    }

    if (!supportedSourceKinds.has(asset.sourceKind)) {
      issues.push({
        type: 'unsupported-enum',
        id: asset.id,
        message: `Unsupported asset source kind: ${asset.sourceKind}`,
      });
    }

    for (const host of asset.hosts) {
      if (!supportedHosts.has(host)) {
        issues.push({
          type: 'unsupported-host',
          id: asset.id,
          message: `Unsupported asset host: ${host}`,
        });
      }
    }

    if (
      asset.kind === 'skill' &&
      !supportedSkillPlacements.has(asset.defaultPlacement as AssetRegistrySkillPlacement)
    ) {
      issues.push({
        type: 'unsupported-skill-placement',
        id: asset.id,
        message: `Skill asset must declare defaultPlacement auto or manual: ${asset.id}`,
      });
    }

    if (!isSafeRegistrySourcePath(asset.sourcePath)) {
      issues.push({
        type: 'unsafe-source-path',
        id: asset.id,
        path: asset.sourcePath,
        message: `Asset source path escapes agent-assets: ${asset.sourcePath}`,
      });
    }

    if (asset.visibility !== 'public' && asset.publishable) {
      issues.push({
        type: 'non-public-publishable',
        id: asset.id,
        message: `Only public assets may be publishable: ${asset.id}`,
      });
    }

    if (options.agentAssetsDir && isSafeRegistrySourcePath(asset.sourcePath)) {
      const sourceAbsolutePath = join(options.agentAssetsDir, normalizeRegistrySourcePath(asset.sourcePath));
      if (!existsSync(sourceAbsolutePath)) {
        issues.push({
          type: 'missing-source-path',
          id: asset.id,
          path: asset.sourcePath,
          message: `Asset source path does not exist: ${asset.sourcePath}`,
        });
      } else if (asset.kind === 'skill' && !existsSync(join(sourceAbsolutePath, 'SKILL.md'))) {
        issues.push({
          type: 'missing-skill-file',
          id: asset.id,
          path: asset.sourcePath,
          message: `Skill asset is missing SKILL.md: ${asset.sourcePath}`,
        });
      }
    }
  }

  if (options.agentAssetsDir) {
    const npxCompatibilityLayer = join(options.agentAssetsDir, 'skills/npx-skills/skills');
    if (pathExistsEvenIfDanglingSymlink(npxCompatibilityLayer)) {
      issues.push({
        type: 'internal-npx-compatibility-layer',
        id: 'npx-skills',
        path: 'skills/npx-skills/skills',
        message: 'Do not create an internal npx compatibility symlink layer.',
      });
    }
  }

  return issues;
}

function isSafeRegistrySourcePath(sourcePath: string): boolean {
  if (!sourcePath || isAbsolute(sourcePath) || sourcePath.startsWith('/')) return false;
  const normalized = normalizeRegistrySourcePath(sourcePath);
  if (normalized === '.' || normalized.startsWith('../') || normalized === '..') return false;
  return !normalized.split('/').includes('..');
}

function normalizeRegistrySourcePath(sourcePath: string): string {
  return posix.normalize(sourcePath.replaceAll('\\', '/'));
}

function pathExistsEvenIfDanglingSymlink(path: string): boolean {
  try {
    lstatSync(path);
    return true;
  } catch {
    return false;
  }
}
