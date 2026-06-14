import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';

import { scanProjectLensTarget } from './scan';

test('scanProjectLensTarget returns a read-only local evidence packet', () => {
  const targetDir = createTempTargetDir();
  writeFileSync(
    join(targetDir, 'package.json'),
    JSON.stringify({
      scripts: { test: 'node --test' },
      dependencies: { react: '^19.0.0' },
    }),
  );
  writeFileSync(join(targetDir, 'AGENTS.md'), '# Agents\n');
  mkdirSync(join(targetDir, 'docs/research'), { recursive: true });
  writeFileSync(join(targetDir, 'docs/research/note.md'), '# Research\n');
  mkdirSync(join(targetDir, 'src'), { recursive: true });
  writeFileSync(join(targetDir, 'src/large.ts'), `${'x'.repeat(1024)}\n`);

  const report = scanProjectLensTarget(targetDir, { largeFileBytes: 100 });

  assert.equal(report.targetDir, targetDir);
  assert.deepEqual(report.aiEntryFiles, ['AGENTS.md']);
  assert.deepEqual(report.packageJson?.scripts, ['test']);
  assert.deepEqual(report.packageJson?.dependencies, ['react']);
  assert.equal(report.docs.hasDocsDirectory, true);
  assert.equal(report.docs.markdownFileCount, 2);
  assert.ok(report.largeFiles.some((file) => file.path === 'src/large.ts'));
});

function createTempTargetDir(): string {
  const targetDir = join(tmpdir(), `pro-gov-lens-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  mkdirSync(targetDir, { recursive: true });
  return targetDir;
}
