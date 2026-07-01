import { cpSync, mkdirSync, rmSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const repoRoot = join(packageRoot, '..', '..');
const assetsRoot = join(packageRoot, 'assets');
const lockDir = join(packageRoot, '.copy-assets.lock');

const assetRoots = [
  'starter',
  'profiles',
  'integrations',
  'docs/reference/adoption',
  'public-agent-assets',
];
const privateRoots = new Set(['agent-assets']);

for (const assetRoot of assetRoots) {
  if (privateRoots.has(assetRoot) || assetRoot.startsWith('agent-assets/')) {
    throw new Error(`Refusing to publish private asset root: ${assetRoot}`);
  }
}

withBuildLock(() => {
  rmSync(assetsRoot, { force: true, maxRetries: 5, recursive: true, retryDelay: 100 });
  for (const assetRoot of assetRoots) {
    cpSync(join(repoRoot, assetRoot), join(assetsRoot, assetRoot), {
      dereference: false,
      errorOnExist: false,
      filter: (source) => !isPlatformMetadata(basename(source)) && !isMaintainerOnlyAdoptionDoc(source),
      force: true,
      recursive: true,
    });
  }
});

function withBuildLock(work) {
  acquireBuildLock();
  try {
    work();
  } finally {
    rmSync(lockDir, { force: true, recursive: true });
  }
}

function acquireBuildLock() {
  const deadline = Date.now() + 60_000;
  while (true) {
    try {
      mkdirSync(lockDir);
      return;
    } catch (error) {
      if (!error || error.code !== 'EEXIST') throw error;
      if (Date.now() > deadline) {
        throw new Error(`Timed out waiting for asset copy lock: ${lockDir}`);
      }
      sleep(100);
    }
  }
}

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function isPlatformMetadata(name) {
  return name === '.DS_Store' || name === 'Thumbs.db' || name.startsWith('._');
}

function isMaintainerOnlyAdoptionDoc(source) {
  return [
    'docs/reference/adoption/downstream-project-registry.md',
    'docs/reference/adoption/public-release-checklist.md',
    'docs/reference/adoption/site-publication-brief.md',
  ].some((path) => source.endsWith(path));
}
