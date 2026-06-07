import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { writeManifest } from '../core/manifest';
import { runDoctor } from './doctor';

test('doctor passes a healthy project with installed guardrails', () => {
  const root = createDoctorProject({ installHooks: true, includeCi: true });

  withCwd(root, () => withMutedConsole(() => {
    assert.equal(runDoctor([]), 0);
  }));
});

test('doctor fails when lefthook is configured but not installed', () => {
  const root = createDoctorProject({ installHooks: false, includeCi: true });

  withCwd(root, () => withMutedConsole(() => {
    assert.equal(runDoctor([]), 1);
  }));
});

function createDoctorProject(options: { installHooks: boolean; includeCi: boolean }): string {
  const root = mkdtempSync(join(tmpdir(), 'doc-gov-doctor-'));
  mkdirSync(join(root, 'docs/governance/agents-routing'), { recursive: true });
  mkdirSync(join(root, 'docs/reference/execution'), { recursive: true });
  mkdirSync(join(root, 'docs/policy'), { recursive: true });

  writeFileSync(join(root, 'package.json'), '{ "name": "doctor-fixture" }\n');
  writeFileSync(join(root, 'README.md'), 'Human introduction.\n');
  writeFileSync(
    join(root, 'AGENTS.md'),
    [
      '# Doctor Fixture Router',
      '<!-- PGS-ROUTER:BEGIN v0.9 -->',
      'README.md is human-facing and is not the default AI startup path.',
      'Read docs/policy/**/*.md, including subdirectories and symlinked shared-rule files.',
      'Read docs/governance/boundary.md.',
      'Read docs/governance/ssot-v0.9.md.',
      'Read docs/governance/doc-agent-rules.md.',
      'Read docs/governance/doc-types.md.',
      'Read docs/governance/agents-routing/doc-only-v0.9.md.',
      'Read docs/reference/execution/current-work.md.',
      '<!-- PGS-ROUTER:END -->',
    ].join('\n')
  );
  writeFileSync(
    join(root, 'CLAUDE.md'),
    [
      '# Claude Adapter',
      'Read `AGENTS.md` first and follow it as the project router.',
      'Claude-specific workflow guidance may add tool usage details, but it must not replace `AGENTS.md`.',
    ].join('\n')
  );

  writeGovernedDoc(root, 'docs/governance/boundary.md', {
    id: 'POLICY-BOUNDARY',
    title: 'Boundary',
    body: 'Product artifacts outside governed docs stay outside docs/** by default.',
  });
  writeGovernedDoc(root, 'docs/governance/ssot-v0.9.md', {
    id: 'POLICY-SSOT',
    title: 'SSOT',
    body: 'Project Governance System does not automatically govern every Markdown file.',
  });
  writeGovernedDoc(root, 'docs/governance/doc-agent-rules.md', {
    id: 'POLICY-DOC-AGENT-RULES',
    title: 'Doc Agent Rules',
    body: 'Doc-gov governs `docs/**` by default.',
  });
  writeGovernedDoc(root, 'docs/governance/doc-types.md', {
    id: 'POLICY-DOC-TYPES',
    title: 'Doc Types',
    body: 'Markdown outside `docs/**` is not a governed doc by default.',
  });
  writeGovernedDoc(root, 'docs/governance/agents-routing/doc-only-v0.9.md', {
    id: 'POLICY-DOC-ONLY-ROUTING',
    title: 'Doc Only Routing',
    body: 'This route does not use Superpowers TDD or Directed Development by default.',
  });
  writeGovernedDoc(root, 'docs/reference/execution/current-work.md', {
    id: 'REF-CURRENT-WORK',
    title: 'Current Work',
    type: 'reference',
    body: 'Current work.',
  });

  writeManifest(root);

  writeFileSync(
    join(root, 'lefthook.yml'),
    [
      'pre-commit:',
      '  commands:',
      '    router:',
      '      run: pnpm doc-gov router-check',
      '    docs:',
      '      run: pnpm doc-gov check && pnpm doc-gov scan --check && pnpm doc-gov links && pnpm doc-gov audit',
      'commit-msg:',
      '  commands:',
      '    doc-gov-commit-msg:',
      '      run: pnpm doc-gov verify-commit-msg "{1}"',
    ].join('\n')
  );

  if (options.installHooks) {
    mkdirSync(join(root, '.git/hooks'), { recursive: true });
    writeFileSync(join(root, '.git/hooks/pre-commit'), 'lefthook run pre-commit "$@"\n');
    writeFileSync(join(root, '.git/hooks/commit-msg'), 'lefthook run commit-msg "$@"\n');
  }

  if (options.includeCi) {
    mkdirSync(join(root, '.github/workflows'), { recursive: true });
    writeFileSync(
      join(root, '.github/workflows/docs-check.yml'),
      [
        'name: docs-check',
        'jobs:',
        '  doc-gov:',
        '    steps:',
        '      - run: pnpm doc-gov router-check',
        '      - run: pnpm doc-gov check',
        '      - run: pnpm doc-gov scan --check',
        '      - run: pnpm doc-gov links',
        '      - run: pnpm doc-gov audit',
      ].join('\n')
    );
  }

  return root;
}

function writeGovernedDoc(
  root: string,
  path: string,
  values: { id: string; title: string; type?: 'policy' | 'reference'; body: string }
): void {
  const abs = join(root, path);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(
    abs,
    [
      '---',
      `id: ${values.id}`,
      `title: ${values.title}`,
      `type: ${values.type ?? 'policy'}`,
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
      `# ${values.title}`,
      '',
      values.body,
      '',
    ].join('\n')
  );
}

function withCwd(root: string, fn: () => void): void {
  const previous = process.cwd();
  try {
    process.chdir(root);
    fn();
  } finally {
    process.chdir(previous);
  }
}

function withMutedConsole(fn: () => void): void {
  const originalLog = console.log;
  const originalError = console.error;
  try {
    console.log = () => undefined;
    console.error = () => undefined;
    fn();
  } finally {
    console.log = originalLog;
    console.error = originalError;
  }
}
