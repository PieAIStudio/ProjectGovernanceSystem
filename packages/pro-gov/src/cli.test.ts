import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)));

test('built CLI help prints the pro-gov command list', () => {
  const result = spawnSync(process.execPath, [join(packageRoot, 'dist/cli.js'), '--help'], {
    cwd: packageRoot,
    encoding: 'utf8',
  });

  assert.equal(result.status, 0);
  assert.match(result.stdout, /pro-gov/);
  assert.match(result.stdout, /assets list/);
  assert.match(result.stdout, /sync --check/);
});

test('built CLI doctor resolves the bundled doc-gov dependency', () => {
  const result = spawnSync(process.execPath, [join(packageRoot, 'dist/cli.js'), 'doctor'], {
    cwd: packageRoot,
    encoding: 'utf8',
    env: { ...process.env, PATH: '/usr/bin:/bin:/usr/sbin:/sbin' },
  });

  assert.equal(result.status, 0);
  assert.match(result.stdout, /doc-gov: available/);
});
