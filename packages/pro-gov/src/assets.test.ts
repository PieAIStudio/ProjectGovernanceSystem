import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { listAssets } from './assets';

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)));

test('asset inventory includes reusable project-governance assets', () => {
  const paths = listAssets().map((asset) => asset.path);

  assert.ok(paths.includes('starter/AGENTS.template.md'));
  assert.ok(paths.includes('starter/lefthook.template.yml'));
  assert.ok(paths.includes('profiles/engineering-runtime/profile.md'));
  assert.ok(paths.includes('profiles/doc-only/profile.md'));
  assert.ok(paths.includes('integrations/superpowers.md'));
  assert.ok(paths.includes('docs/reference/adoption/adoption-playbook.md'));
});

test('assets list prints packaged asset paths', () => {
  const result = spawnSync(process.execPath, [join(packageRoot, 'dist/cli.js'), 'assets', 'list'], {
    cwd: packageRoot,
    encoding: 'utf8',
  });

  assert.equal(result.status, 0);
  assert.match(result.stdout, /starter\/AGENTS\.template\.md/);
  assert.match(result.stdout, /profiles\/engineering-runtime\/profile\.md/);
  assert.match(result.stdout, /docs\/reference\/adoption\/adoption-playbook\.md/);
});
