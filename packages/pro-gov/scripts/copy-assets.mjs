import { cpSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
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

rmSync(assetsRoot, { force: true, recursive: true });
for (const assetRoot of assetRoots) {
  cpSync(join(repoRoot, assetRoot), join(assetsRoot, assetRoot), {
    dereference: false,
    errorOnExist: false,
    force: true,
    recursive: true,
  });
}
