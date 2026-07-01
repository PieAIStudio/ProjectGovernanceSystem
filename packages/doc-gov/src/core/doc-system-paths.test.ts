import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { checkDocs } from './checker';
import { writeManifest } from './manifest';
import { loadTemplate } from './templates';

test('uses docs/governance for doc system rules, templates, and manifest', () => {
  const root = mkdtempSync(join(tmpdir(), 'doc-gov-doc-system-'));
  mkdirSync(join(root, 'docs/governance/templates'), { recursive: true });
  mkdirSync(join(root, 'docs/policy'), { recursive: true });

  writeFileSync(
    join(root, 'docs/governance/doc-agent-rules.md'),
    [
      '---',
      'id: POLICY-DOC-AGENT-RULES',
      'title: Documentation Agent Rules',
      'type: policy',
      'status: stable',
      'canonical: true',
      'owner: docs',
      'created: 2026-05-08',
      'last_reviewed: 2026-05-08',
      'domain: doc-gov',
      'tags:',
      '  - doc-gov',
      'pinned: false',
      'related: []',
      'supersedes: []',
      'superseded_by: null',
      '---',
      '',
      '# Documentation Agent Rules',
      '',
      'Keep documentation governance separate from project development policy.',
    ].join('\n')
  );
  writeFileSync(
    join(root, 'docs/policy/best-practice-for-this-project.md'),
    [
      '---',
      'id: POLICY-PROJECT-BEST-PRACTICE',
      'title: Best Practice for This Project',
      'type: policy',
      'status: stable',
      'canonical: true',
      'owner: project',
      'created: 2026-05-08',
      'last_reviewed: 2026-05-08',
      'domain: project-policy',
      'tags:',
      '  - project-policy',
      'pinned: false',
      'related: []',
      'supersedes: []',
      'superseded_by: null',
      '---',
      '',
      '# Best Practice for This Project',
      '',
      'Project-specific AI development rules live in docs/policy/.',
    ].join('\n')
  );
  writeFileSync(join(root, 'docs/governance/templates/plan.md'), '# Plan Template\n');

  const result = checkDocs(root);

  assert.equal(result.ok, true);
  assert.deepEqual(
    result.records.map((record) => record.path),
    [
      'docs/governance/doc-agent-rules.md',
      'docs/policy/best-practice-for-this-project.md',
    ]
  );

  assert.equal(loadTemplate(root, 'plan'), '# Plan Template\n');
  writeManifest(root);
  assert.equal(existsSync(join(root, 'docs/governance/MANIFEST.yml')), true);
});

test('rejects governed README files outside the repository root', () => {
  const root = mkdtempSync(join(tmpdir(), 'doc-gov-nested-readme-'));
  mkdirSync(join(root, 'docs/reference'), { recursive: true });
  writeFileSync(
    join(root, 'docs/reference/README.md'),
    [
      '---',
      'id: REF-NESTED-README',
      'title: Nested Readme',
      'type: reference',
      'status: stable',
      'canonical: true',
      'owner: docs',
      'created: 2026-05-08',
      'last_reviewed: 2026-05-08',
      'domain: docs',
      'tags:',
      '  - docs',
      'pinned: false',
      'related: []',
      'supersedes: []',
      'superseded_by: null',
      '---',
      '',
      '# Nested Readme',
    ].join('\n')
  );

  const result = checkDocs(root);

  assert.equal(result.ok, false);
  assert.match(
    result.issues.map((issue) => issue.message).join('\n'),
    /Keep README\.md as the root human introduction only/
  );
});

test('ignores Compound Engineering external artifacts under docs', () => {
  const root = mkdtempSync(join(tmpdir(), 'doc-gov-ce-artifacts-'));
  mkdirSync(join(root, 'docs/solutions/runtime-errors'), { recursive: true });
  mkdirSync(join(root, 'docs/brainstorms'), { recursive: true });
  mkdirSync(join(root, 'docs/pulse-reports'), { recursive: true });
  mkdirSync(join(root, 'docs/plans/active'), { recursive: true });
  mkdirSync(join(root, 'docs/plans/completed'), { recursive: true });
  mkdirSync(join(root, 'docs/reference'), { recursive: true });

  writeFileSync(
    join(root, 'docs/solutions/runtime-errors/example.md'),
    [
      '---',
      'module: runtime',
      'date: 2026-07-01',
      'problem_type: runtime_error',
      'component: tooling',
      'severity: medium',
      'symptoms:',
      '  - "Example CE-owned symptom"',
      'root_cause: config_error',
      'resolution_type: config_change',
      '---',
      '',
      '# CE Solution',
    ].join('\n')
  );
  writeFileSync(join(root, 'docs/brainstorms/example.md'), '# CE brainstorm without PGS frontmatter\n');
  writeFileSync(join(root, 'docs/pulse-reports/example.md'), '# CE pulse without PGS frontmatter\n');
  writeFileSync(
    join(root, 'docs/plans/2026-07-01-001-feat-ce-native-plan.md'),
    ['---', 'title: CE Native Plan', 'type: feature', 'date: 2026-07-01', '---', '# CE Plan'].join(
      '\n'
    )
  );
  writeFileSync(
    join(root, 'docs/reference/current.md'),
    [
      '---',
      'id: REF-CURRENT',
      'title: Current Reference',
      'type: reference',
      'status: stable',
      'canonical: true',
      'owner: docs',
      'created: 2026-07-01',
      'last_reviewed: 2026-07-01',
      'domain: docs',
      'tags:',
      '  - docs',
      'pinned: false',
      'related: []',
      'supersedes: []',
      'superseded_by: null',
      '---',
      '',
      '# Current Reference',
    ].join('\n')
  );

  const result = checkDocs(root);

  assert.equal(result.ok, true);
  assert.deepEqual(
    result.records.map((record) => record.path),
    ['docs/reference/current.md']
  );
});
