import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { AgentAssetRegistry, AgentAssetRegistryEntry } from './registry';
import { validateAssetRegistry, type AssetRegistryIssue } from './registry';

export interface LoadedAgentAssetRegistry {
  registry: AgentAssetRegistry;
  agentAssetsDir: string;
  registryPath: string;
  issues: AssetRegistryIssue[];
}

export interface LoadAgentAssetRegistryOptions {
  agentAssetsDir?: string;
}

export interface AgentAssetLockEntry {
  id: string;
  sourcePath: string;
  contentHash: string;
}

export function loadAgentAssetRegistry(
  options: LoadAgentAssetRegistryOptions = {},
): LoadedAgentAssetRegistry {
  const agentAssetsDir = options.agentAssetsDir ?? findDefaultAgentAssetsDir();
  const registryPath = join(agentAssetsDir, 'registry.json');

  if (!existsSync(registryPath)) {
    return {
      registry: { schemaVersion: 1, assets: [] },
      agentAssetsDir,
      registryPath,
      issues: [],
    };
  }

  const registry = JSON.parse(readFileSync(registryPath, 'utf8')) as AgentAssetRegistry;
  return {
    registry,
    agentAssetsDir,
    registryPath,
    issues: validateAssetRegistry(registry, { agentAssetsDir }),
  };
}

export function createAgentAssetLockEntries(
  registry: AgentAssetRegistry,
  agentAssetsDir: string,
  assetIds?: readonly string[],
): AgentAssetLockEntry[] {
  const wantedIds = assetIds ? new Set(assetIds) : undefined;
  return registry.assets
    .filter((asset) => !wantedIds || wantedIds.has(asset.id))
    .map((asset) => ({
      id: asset.id,
      sourcePath: asset.sourcePath,
      contentHash: hashAgentAssetContent(asset, agentAssetsDir),
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

export function hashAgentAssetContent(
  asset: AgentAssetRegistryEntry,
  agentAssetsDir: string,
): string {
  const sourceAbsolutePath = join(agentAssetsDir, asset.sourcePath);
  const hash = createHash('sha256');

  for (const filePath of listFiles(sourceAbsolutePath)) {
    const relativePath = toUnixPath(relative(sourceAbsolutePath, filePath));
    hash.update(relativePath);
    hash.update('\0');
    hash.update(readFileSync(filePath));
    hash.update('\0');
  }

  return `sha256:${hash.digest('hex')}`;
}

function findDefaultAgentAssetsDir(): string {
  const packageRoot = findPackageRoot(dirname(fileURLToPath(import.meta.url)));
  const repoRoot = join(packageRoot, '..', '..');
  const candidates = [
    join(packageRoot, 'assets/agent-assets'),
    join(repoRoot, 'agent-assets'),
    join(packageRoot, 'assets/public-agent-assets'),
    join(repoRoot, 'public-agent-assets'),
  ];
  return candidates.find((candidate) => existsSync(join(candidate, 'registry.json'))) ?? candidates[0];
}

function findPackageRoot(startDir: string): string {
  let current = startDir;

  while (current !== dirname(current)) {
    const packageJsonPath = join(current, 'package.json');
    if (existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as { name?: string };
        if (packageJson.name === '@pieai/pro-gov') return current;
      } catch {
        // Keep walking; malformed package.json will be reported by other tooling.
      }
    }
    current = dirname(current);
  }

  return startDir;
}

function listFiles(absolutePath: string): string[] {
  const stats = statSync(absolutePath);
  if (stats.isFile()) return [absolutePath];

  const files: string[] = [];
  for (const entry of readdirSync(absolutePath, { withFileTypes: true })) {
    const entryPath = join(absolutePath, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFiles(entryPath));
    } else if (entry.isFile()) {
      files.push(entryPath);
    }
  }

  return files.sort();
}

function toUnixPath(path: string): string {
  return path.replaceAll('\\', '/');
}
