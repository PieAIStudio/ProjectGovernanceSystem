import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

import { validateAssetRegistry } from './registry';

const baseAsset = {
  id: 'screenwalk',
  title: 'Screenwalk',
  family: 'pie-skills',
  kind: 'skill',
  visibility: 'private',
  sourceKind: 'local',
  sourcePath: 'skills/pie-skills/screenwalk',
  hosts: ['codex'],
  tags: ['ui'],
  publishable: false,
  origin: 'OneDrive/MyProjectSkills/screenwalk',
  notes: 'Imported from Yuanfei custom skills.',
} as const;

test('validateAssetRegistry accepts a minimal safe registry', () => {
  const issues = validateAssetRegistry({
    schemaVersion: 1,
    assets: [baseAsset],
  });

  assert.deepEqual(issues, []);
});

test('validateAssetRegistry reports duplicate asset ids', () => {
  const issues = validateAssetRegistry({
    schemaVersion: 1,
    assets: [baseAsset, { ...baseAsset, title: 'Duplicate' }],
  });

  assert.ok(issues.some((issue) => issue.type === 'duplicate-id' && issue.id === 'screenwalk'));
});

test('validateAssetRegistry rejects source paths that escape agent-assets', () => {
  const issues = validateAssetRegistry({
    schemaVersion: 1,
    assets: [{ ...baseAsset, id: 'escaped', sourcePath: '../outside' }],
  });

  assert.ok(issues.some((issue) => issue.type === 'unsafe-source-path' && issue.id === 'escaped'));
});

test('validateAssetRegistry rejects publishable private and third-party assets', () => {
  const issues = validateAssetRegistry({
    schemaVersion: 1,
    assets: [
      { ...baseAsset, id: 'private-published', visibility: 'private', publishable: true },
      { ...baseAsset, id: 'third-party-published', visibility: 'third-party', publishable: true },
    ],
  });

  assert.deepEqual(
    issues
      .filter((issue) => issue.type === 'non-public-publishable')
      .map((issue) => issue.id)
      .sort(),
    ['private-published', 'third-party-published'],
  );
});

test('checked-in agent-assets registry is valid', () => {
  const registryPath = join(process.cwd(), '..', '..', 'agent-assets', 'registry.json');
  const registry = JSON.parse(readFileSync(registryPath, 'utf8'));

  assert.deepEqual(validateAssetRegistry(registry), []);
});
