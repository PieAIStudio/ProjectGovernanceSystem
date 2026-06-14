import { isAbsolute, posix } from 'node:path';

export type AssetRegistryVisibility = 'public' | 'private' | 'third-party';
export type AssetRegistryFamily =
  | 'pie-skills'
  | 'dokobot'
  | 'npx-skills'
  | 'pie-rules'
  | 'pie-commands';
export type AssetRegistryKind = 'skill' | 'rule' | 'command';
export type AssetRegistrySourceKind = 'local' | 'local-pack' | 'npx';
export type AssetRegistryHost = 'codex' | 'claude-code' | 'gemini-cli' | 'antigravity';

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
  publishable: boolean;
  origin: string;
  notes: string;
}

export interface AgentAssetRegistry {
  schemaVersion: 1;
  assets: readonly AgentAssetRegistryEntry[];
}

export type AssetRegistryIssueType =
  | 'duplicate-id'
  | 'unsafe-source-path'
  | 'non-public-publishable';

export interface AssetRegistryIssue {
  type: AssetRegistryIssueType;
  id: string;
  path?: string;
  message: string;
}

export function validateAssetRegistry(registry: AgentAssetRegistry): AssetRegistryIssue[] {
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
  }

  return issues;
}

function isSafeRegistrySourcePath(sourcePath: string): boolean {
  if (!sourcePath || isAbsolute(sourcePath) || sourcePath.startsWith('/')) return false;
  const normalized = posix.normalize(sourcePath.replaceAll('\\', '/'));
  if (normalized === '.' || normalized.startsWith('../') || normalized === '..') return false;
  return !normalized.split('/').includes('..');
}
