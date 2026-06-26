import { existsSync } from 'node:fs';
import { isAbsolute, join, posix } from 'node:path';

import { hashAssetPathContent } from './loader';
import type { AgentAssetRegistry, AgentAssetRegistryEntry } from './registry';

export type PublicAssetPromotionIssueType =
  | 'missing-promotion'
  | 'unsafe-private-source-path'
  | 'unsafe-public-source-path'
  | 'missing-private-source'
  | 'missing-public-source'
  | 'source-drift'
  | 'public-drift';

export interface PublicAssetPromotionIssue {
  type: PublicAssetPromotionIssueType;
  id: string;
  path?: string;
  expected?: string;
  actual?: string;
  message: string;
}

export interface PublicAssetPromotionCheckResult {
  checked: number;
  issues: PublicAssetPromotionIssue[];
}

export interface PublicAssetPromotionCheckOptions {
  registry: AgentAssetRegistry;
  publicAgentAssetsDir: string;
  privateAgentAssetsDir: string;
}

export function checkPublicAssetPromotions(
  options: PublicAssetPromotionCheckOptions,
): PublicAssetPromotionCheckResult {
  const issues: PublicAssetPromotionIssue[] = [];
  let checked = 0;

  for (const asset of options.registry.assets) {
    if (!needsPromotionCheck(asset)) continue;
    checked += 1;

    if (!asset.promotion) {
      issues.push({
        type: 'missing-promotion',
        id: asset.id,
        message: `Public asset is missing promotion metadata: ${asset.id}`,
      });
      continue;
    }

    const publicPathResult = resolveSafePath(options.publicAgentAssetsDir, asset.sourcePath);
    if (!publicPathResult.ok) {
      issues.push({
        type: 'unsafe-public-source-path',
        id: asset.id,
        path: asset.sourcePath,
        message: `Public asset source path is unsafe: ${asset.sourcePath}`,
      });
      continue;
    }

    const privatePathResult = resolveSafePath(
      options.privateAgentAssetsDir,
      asset.promotion.privateSourcePath,
    );
    if (!privatePathResult.ok) {
      issues.push({
        type: 'unsafe-private-source-path',
        id: asset.id,
        path: asset.promotion.privateSourcePath,
        message: `Private promotion source path is unsafe: ${asset.promotion.privateSourcePath}`,
      });
      continue;
    }

    if (!existsSync(privatePathResult.path)) {
      issues.push({
        type: 'missing-private-source',
        id: asset.id,
        path: asset.promotion.privateSourcePath,
        message: `Private promotion source does not exist: ${asset.promotion.privateSourcePath}`,
      });
    } else {
      const actualPrivateHash = hashAssetPathContent(privatePathResult.path);
      if (actualPrivateHash !== asset.promotion.privateSourceHash) {
        issues.push({
          type: 'source-drift',
          id: asset.id,
          path: asset.promotion.privateSourcePath,
          expected: asset.promotion.privateSourceHash,
          actual: actualPrivateHash,
          message: `Private source changed after public promotion: ${asset.id}`,
        });
      }
    }

    if (!existsSync(publicPathResult.path)) {
      issues.push({
        type: 'missing-public-source',
        id: asset.id,
        path: asset.sourcePath,
        message: `Public promoted asset does not exist: ${asset.sourcePath}`,
      });
    } else {
      const actualPublicHash = hashAssetPathContent(publicPathResult.path);
      if (actualPublicHash !== asset.promotion.publicHash) {
        issues.push({
          type: 'public-drift',
          id: asset.id,
          path: asset.sourcePath,
          expected: asset.promotion.publicHash,
          actual: actualPublicHash,
          message: `Public promoted asset changed after review: ${asset.id}`,
        });
      }
    }
  }

  return { checked, issues };
}

function needsPromotionCheck(asset: AgentAssetRegistryEntry): boolean {
  return asset.visibility === 'public' && asset.publishable;
}

function resolveSafePath(root: string, sourcePath: string): { ok: true; path: string } | { ok: false } {
  if (!sourcePath || isAbsolute(sourcePath) || sourcePath.startsWith('/')) return { ok: false };
  const normalized = posix.normalize(sourcePath.replaceAll('\\', '/'));
  if (normalized === '.' || normalized === '..' || normalized.startsWith('../')) {
    return { ok: false };
  }
  if (normalized.split('/').includes('..')) return { ok: false };
  return { ok: true, path: join(root, normalized) };
}
