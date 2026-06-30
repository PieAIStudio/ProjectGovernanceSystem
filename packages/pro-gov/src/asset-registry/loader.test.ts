import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';

import {
  createAgentAssetLockEntries,
  hashAgentAssetContent,
  loadAgentAssetRegistry,
} from './loader';

const baseAsset = {
  id: 'pie-skills/example',
  title: 'Example',
  family: 'pie-skills',
  kind: 'skill',
  visibility: 'private',
  sourceKind: 'local',
  sourcePath: 'skills/pie-skills/example',
  hosts: ['codex'],
  tags: ['skill'],
  defaultPlacement: 'auto',
  publishable: false,
  origin: 'test',
  notes: 'test',
} as const;

test('loadAgentAssetRegistry loads and validates a registry from an agent-assets dir', () => {
  const agentAssetsDir = createTempAgentAssetsDir();
  mkdirSync(join(agentAssetsDir, 'skills/pie-skills/example'), { recursive: true });
  writeFileSync(join(agentAssetsDir, 'skills/pie-skills/example/SKILL.md'), '# Example\n');
  writeFileSync(
    join(agentAssetsDir, 'registry.json'),
    `${JSON.stringify({ schemaVersion: 1, assets: [baseAsset] }, null, 2)}\n`,
  );

  const loaded = loadAgentAssetRegistry({ agentAssetsDir });

  assert.equal(loaded.registry.assets.length, 1);
  assert.equal(loaded.registry.assets[0]?.id, 'pie-skills/example');
  assert.deepEqual(loaded.issues, []);
});

test('loadAgentAssetRegistry returns an empty registry when registry.json is absent', () => {
  const loaded = loadAgentAssetRegistry({ agentAssetsDir: createTempAgentAssetsDir() });

  assert.equal(loaded.registry.assets.length, 0);
  assert.deepEqual(loaded.issues, []);
});

test('hashAgentAssetContent produces stable content hashes and changes on content edits', () => {
  const agentAssetsDir = createTempAgentAssetsDir();
  mkdirSync(join(agentAssetsDir, 'skills/pie-skills/example/references'), { recursive: true });
  writeFileSync(join(agentAssetsDir, 'skills/pie-skills/example/SKILL.md'), '# Example\n');
  writeFileSync(join(agentAssetsDir, 'skills/pie-skills/example/references/a.md'), 'A\n');

  const firstHash = hashAgentAssetContent(baseAsset, agentAssetsDir);
  const secondHash = hashAgentAssetContent(baseAsset, agentAssetsDir);
  writeFileSync(join(agentAssetsDir, 'skills/pie-skills/example/references/a.md'), 'B\n');
  const editedHash = hashAgentAssetContent(baseAsset, agentAssetsDir);

  assert.equal(firstHash, secondHash);
  assert.notEqual(firstHash, editedHash);
});

test('hashAgentAssetContent ignores generated local cache noise', () => {
  const agentAssetsDir = createTempAgentAssetsDir();
  mkdirSync(join(agentAssetsDir, 'skills/pie-skills/example/scripts'), { recursive: true });
  writeFileSync(join(agentAssetsDir, 'skills/pie-skills/example/SKILL.md'), '# Example\n');
  writeFileSync(join(agentAssetsDir, 'skills/pie-skills/example/scripts/tool.py'), 'print("ok")\n');

  const cleanHash = hashAgentAssetContent(baseAsset, agentAssetsDir);

  mkdirSync(join(agentAssetsDir, 'skills/pie-skills/example/scripts/__pycache__'), { recursive: true });
  writeFileSync(join(agentAssetsDir, 'skills/pie-skills/example/scripts/__pycache__/tool.cpython-314.pyc'), 'cache\n');
  writeFileSync(join(agentAssetsDir, 'skills/pie-skills/example/.DS_Store'), 'finder\n');

  assert.equal(hashAgentAssetContent(baseAsset, agentAssetsDir), cleanHash);
});

test('createAgentAssetLockEntries creates sorted lock entries with hashes', () => {
  const agentAssetsDir = createTempAgentAssetsDir();
  mkdirSync(join(agentAssetsDir, 'skills/pie-skills/example'), { recursive: true });
  writeFileSync(join(agentAssetsDir, 'skills/pie-skills/example/SKILL.md'), '# Example\n');

  const entries = createAgentAssetLockEntries(
    {
      schemaVersion: 1,
      assets: [
        { ...baseAsset, id: 'pie-skills/z' },
        { ...baseAsset, id: 'pie-skills/a' },
      ],
    },
    agentAssetsDir,
  );

  assert.deepEqual(
    entries.map((entry) => entry.id),
    ['pie-skills/a', 'pie-skills/z'],
  );
  assert.match(entries[0]?.contentHash ?? '', /^sha256:[a-f0-9]{64}$/);
});

function createTempAgentAssetsDir(): string {
  return join(tmpdir(), `pro-gov-agent-assets-${Date.now()}-${Math.random().toString(16).slice(2)}`);
}
