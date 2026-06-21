import { existsSync, readdirSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface ProGovAsset {
  path: string;
  absolutePath: string;
}

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const sourceRoot = join(packageRoot, '..', '..');
const packagedAssetsRoot = join(packageRoot, 'assets');

const assetRoots = [
  'starter',
  'profiles',
  'integrations',
  'docs/reference/adoption',
] as const;

export function listAssets(): ProGovAsset[] {
  const root = existsSync(packagedAssetsRoot) ? packagedAssetsRoot : sourceRoot;
  return assetRoots
    .flatMap((assetRoot) => {
      const absoluteRoot = join(root, assetRoot);
      if (!existsSync(absoluteRoot)) return [];
      return listFiles(absoluteRoot).map((absolutePath) => ({
        absolutePath,
        path: toUnixPath(relative(root, absolutePath)),
      }));
    })
    .sort((a, b) => a.path.localeCompare(b.path));
}

export function isValidProfile(profile: string): profile is 'engineering-runtime' | 'doc-only' {
  return profile === 'engineering-runtime' || profile === 'doc-only';
}

function listFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (isPlatformMetadata(entry.name)) continue;
    const absolutePath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFiles(absolutePath));
    } else if (entry.isFile()) {
      files.push(absolutePath);
    }
  }
  return files.sort();
}

function toUnixPath(path: string): string {
  return path.replaceAll('\\', '/');
}

function isPlatformMetadata(name: string): boolean {
  return name === '.DS_Store' || name === 'Thumbs.db' || name.startsWith('._');
}
