import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { buildManifest, manifestInSync } from './manifest';

test('manifest sync ignores generator_version patch drift', () => {
  const root = createManifestFixture();
  const manifest = buildManifest(root).replace(
    /^generator_version: .*$/m,
    'generator_version: doc-gov@0.2.0'
  );
  writeFileSync(join(root, 'docs/governance/MANIFEST.yml'), manifest);

  assert.equal(manifestInSync(root), true);
});

test('manifest generator_version follows package version', () => {
  const root = createManifestFixture();
  const packageJson = JSON.parse(
    readFileSync(new URL('../../package.json', import.meta.url), 'utf8')
  ) as { version: string };

  assert.match(
    buildManifest(root),
    new RegExp(`^generator_version: doc-gov@${packageJson.version}$`, 'm')
  );
});

function createManifestFixture(): string {
  const root = mkdtempSync(join(tmpdir(), 'doc-gov-manifest-'));
  mkdirSync(join(root, 'docs/governance'), { recursive: true });
  mkdirSync(join(root, 'docs/reference'), { recursive: true });
  writeFileSync(
    join(root, 'docs/reference/example.md'),
    [
      '---',
      'id: REF-EXAMPLE',
      'title: Example Reference',
      'type: reference',
      'status: stable',
      'canonical: true',
      'owner: human',
      'created: 2026-06-04',
      'last_reviewed: 2026-06-04',
      'domain: test',
      'tags:',
      '  - test',
      'pinned: false',
      'related: []',
      '---',
      '',
      '# Example Reference',
      '',
    ].join('\n')
  );
  return root;
}
