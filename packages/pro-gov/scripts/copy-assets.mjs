import { cpSync, rmSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const repoRoot = join(packageRoot, '..', '..');
const assetsRoot = join(packageRoot, 'assets');

const assetRoots = [
  'starter',
  'profiles',
  'integrations',
  'docs/reference/adoption',
];
const privateRoots = new Set(['agent-assets']);

for (const assetRoot of assetRoots) {
  if (privateRoots.has(assetRoot) || assetRoot.startsWith('agent-assets/')) {
    throw new Error(`Refusing to publish private asset root: ${assetRoot}`);
  }
}

rmSync(assetsRoot, { force: true, recursive: true });
for (const assetRoot of assetRoots) {
  cpSync(join(repoRoot, assetRoot), join(assetsRoot, assetRoot), {
    dereference: false,
    errorOnExist: false,
    filter: (source) => !isPlatformMetadata(basename(source)),
    force: true,
    recursive: true,
  });
}

function isPlatformMetadata(name) {
  return name === '.DS_Store' || name === 'Thumbs.db' || name.startsWith('._');
}
