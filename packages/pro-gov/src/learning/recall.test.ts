import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';

import { recallLearnings } from './recall';

test('recallLearnings ranks matching solution records ahead of unrelated records', () => {
  const root = createTempRepo();
  mkdirSync(join(root, 'docs/solutions/workflow-issues'), { recursive: true });
  writeFileSync(
    join(root, 'docs/solutions/workflow-issues/portfolio-release.md'),
    [
      '---',
      'title: Publish PGS before syncing portfolio targets',
      'tags: [portfolio-governance, release, trusted-publishing, downstream-sync]',
      '---',
      '',
      '# Publish PGS before syncing portfolio targets',
      '',
      'Run GitHub Actions Trusted Publishing before syncing downstream repositories.',
    ].join('\n'),
  );
  writeFileSync(
    join(root, 'docs/solutions/workflow-issues/browser-polish.md'),
    [
      '---',
      'title: Browser polish after visual QA',
      'tags: [frontend, browser, qa]',
      '---',
      '',
      '# Browser polish after visual QA',
      '',
      'Run browser screenshots before final UI reporting.',
    ].join('\n'),
  );

  const result = recallLearnings(root, {
    query: 'portfolio npm release downstream sync',
    limit: 2,
  });

  assert.equal(result.query, 'portfolio npm release downstream sync');
  assert.equal(result.hits[0]?.relativePath, 'docs/solutions/workflow-issues/portfolio-release.md');
  assert.equal(result.hits[0]?.title, 'Publish PGS before syncing portfolio targets');
  assert.match(result.hits[0]?.summary ?? '', /Trusted Publishing/);
  assert.ok((result.hits[0]?.score ?? 0) > (result.hits[1]?.score ?? 0));
});

test('recallLearnings includes CONCEPTS.md as a low-friction vocabulary source', () => {
  const root = createTempRepo();
  writeFileSync(
    join(root, 'CONCEPTS.md'),
    [
      '# Concepts',
      '',
      '### Compound Gate',
      'The post-work decision point where an engineering agent records reusable learning.',
    ].join('\n'),
  );

  const result = recallLearnings(root, {
    query: 'compound gate learning',
    limit: 3,
  });

  assert.equal(result.hits.length, 1);
  assert.equal(result.hits[0]?.relativePath, 'CONCEPTS.md');
  assert.equal(result.hits[0]?.title, 'Concepts');
  assert.match(result.hits[0]?.summary ?? '', /post-work decision point/);
});

function createTempRepo(): string {
  const root = join(tmpdir(), `pro-gov-recall-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  mkdirSync(root, { recursive: true });
  return root;
}
