import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import { checkRouterIntegrity } from './router-integrity';

test('passes when router entrypoints and profile wiring are present', () => {
  const root = createFixture({
    agents: [
      '# Router',
      'Read routing/engineering-task-routing.md.',
      'Read routing/doc-only-routing.md.',
      'Read integrations/superpowers.md.',
      'Read integrations/directed-development.md.',
      'Use profiles/engineering-runtime/ and profiles/doc-only/.',
    ].join('\n'),
    superpowers: [
      '# Superpowers Integration',
      'This repository does not vendor or rewrite it.',
      'Task routing classifies first.',
      'Superpowers executes inside the selected lane.',
      'Durable outputs should map back to doc-gov layers.',
    ].join('\n'),
  });

  const result = checkRouterIntegrity(root);

  assert.equal(result.ok, true);
  assert.deepEqual(result.issues, []);
});

test('fails when AGENTS does not point agents to routing files', () => {
  const root = createFixture({
    agents: '# Router\nRead README.md only.',
  });

  const result = checkRouterIntegrity(root);

  assert.equal(result.ok, false);
  assert.match(
    result.issues.map((issue) => issue.message).join('\n'),
    /AGENTS.md must mention routing\/engineering-task-routing.md/
  );
});

test('fails when Superpowers integration does not state routing first', () => {
  const root = createFixture({
    superpowers: '# Superpowers Integration\nUse Superpowers workflows.',
  });

  const result = checkRouterIntegrity(root);

  assert.equal(result.ok, false);
  assert.match(
    result.issues.map((issue) => issue.message).join('\n'),
    /Superpowers integration must state that task routing classifies first/
  );
});

function createFixture(overrides: { agents?: string; superpowers?: string } = {}): string {
  const root = mkdtempSync(join(tmpdir(), 'doc-gov-router-check-'));
  mkdirSync(join(root, 'routing'), { recursive: true });
  mkdirSync(join(root, 'integrations'), { recursive: true });
  mkdirSync(join(root, 'profiles/engineering-runtime'), { recursive: true });
  mkdirSync(join(root, 'profiles/doc-only'), { recursive: true });
  mkdirSync(join(root, 'starter/docs/reference/execution'), { recursive: true });

  writeFileSync(join(root, 'README.md'), 'routing/, profiles/, and integrations/superpowers.md are documented here.\n');
  writeFileSync(
    join(root, 'AGENTS.md'),
    overrides.agents ??
      [
        '# Router',
        'Read routing/engineering-task-routing.md.',
        'Read routing/doc-only-routing.md.',
        'Read integrations/superpowers.md.',
        'Read integrations/directed-development.md.',
        'Use profiles/engineering-runtime/ and profiles/doc-only/.',
      ].join('\n')
  );
  writeFileSync(join(root, 'routing/engineering-task-routing.md'), 'Read project router and current-work.md.\nUse matching Superpowers workflow if applicable.\n');
  writeFileSync(join(root, 'routing/doc-only-routing.md'), 'This route does not use Superpowers TDD or Directed Development by default.\n');
  writeFileSync(
    join(root, 'integrations/superpowers.md'),
    overrides.superpowers ??
      [
        '# Superpowers Integration',
        'This repository does not vendor or rewrite it.',
        'Task routing classifies first.',
        'Superpowers executes inside the selected lane.',
        'Durable outputs should map back to doc-gov layers.',
      ].join('\n')
  );
  writeFileSync(join(root, 'integrations/directed-development.md'), 'Directed Development is an optional workflow.\n');
  writeFileSync(join(root, 'profiles/engineering-runtime/manifest.yml'), 'routing: routing/engineering-task-routing.md\nsuperpowers: integrations/superpowers.md\n');
  writeFileSync(join(root, 'profiles/engineering-runtime/README.md'), 'Engineering profile.\n');
  writeFileSync(join(root, 'profiles/doc-only/manifest.yml'), 'routing: routing/doc-only-routing.md\nsuperpowers: false\n');
  writeFileSync(join(root, 'profiles/doc-only/README.md'), 'Doc-only profile.\n');
  writeFileSync(join(root, 'starter/AGENTS.template.md'), 'The target project must name its adopted profile and chosen routing file.\n');
  writeFileSync(join(root, 'starter/docs/reference/execution/current-work.md'), 'Current work index.\n');
  return root;
}
