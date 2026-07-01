import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { listAssets } from './assets';
import { loadAgentAssetBundles } from './asset-bundles/bundles';
import { hashAssetPathContent, loadAgentAssetRegistry } from './asset-registry/loader';

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const loadedAgentAssets = loadAgentAssetRegistry();
const agentAssetRegistry = loadedAgentAssets.registry as {
  assets: ReadonlyArray<{ id: string; visibility: string }>;
};
const agentAssetBundles = loadAgentAssetBundles(loadedAgentAssets.agentAssetsDir);
const availableBundleIds = new Set(agentAssetBundles.map((bundle) => bundle.id));
const hasBaseGovernanceBundle = availableBundleIds.has('base-governance');
const hasProjectLensBundle = availableBundleIds.has('project-lens');

test('asset inventory includes reusable project-governance assets', () => {
  const paths = listAssets().map((asset) => asset.path);

  assert.ok(paths.includes('starter/AGENTS.template.md'));
  assert.equal(paths.includes('starter/.gemini/settings.json'), false);
  assert.ok(paths.includes('starter/lefthook.template.yml'));
  assert.ok(paths.includes('profiles/engineering-runtime/profile.md'));
  assert.ok(paths.includes('profiles/doc-only/profile.md'));
  assert.ok(paths.includes('integrations/superpowers.md'));
  assert.ok(paths.includes('docs/reference/adoption/adoption-playbook.md'));
});

test('package asset copy excludes private and third-party agent asset bodies', () => {
  const packageJson = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8')) as {
    files: string[];
  };
  const packagedPaths = listAssets().map((asset) => asset.path);

  assert.equal(packageJson.files.includes('agent-assets'), false);
  assert.equal(existsSync(join(packageRoot, 'assets/agent-assets')), false);
  assert.equal(existsSync(join(packageRoot, 'assets/skills')), false);
  assert.equal(existsSync(join(packageRoot, 'assets/docs/reference/adoption')), true);
  assert.equal(packagedPaths.some((path) => path.endsWith('/.DS_Store')), false);
  assert.equal(packagedPaths.some((path) => path.endsWith('/Thumbs.db')), false);
  assert.equal(packagedPaths.some((path) => /\/\._[^/]+$/.test(path)), false);
});

test('packed package dependencies use registry-installable ranges', () => {
  const targetDir = mkdtempSync(join(tmpdir(), 'pro-gov-pack-'));
  const tarballPath = join(targetDir, 'pro-gov.tgz');

  try {
    const pack = spawnSync('pnpm', ['pack', '--out', tarballPath], {
      cwd: packageRoot,
      encoding: 'utf8',
    });
    assert.equal(pack.status, 0, pack.stderr || pack.stdout);

    const extract = spawnSync('tar', ['-xOf', tarballPath, 'package/package.json'], {
      encoding: 'utf8',
    });
    assert.equal(extract.status, 0, extract.stderr || extract.stdout);

    const packageJson = JSON.parse(extract.stdout) as { dependencies?: Record<string, string> };
    const docGovRange = packageJson.dependencies?.['@pieai/doc-gov'];

    assert.equal(docGovRange?.startsWith('workspace:'), false);
    assert.match(docGovRange ?? '', /^\^\d+\.\d+\.\d+$/);
  } finally {
    rmSync(targetDir, { recursive: true, force: true });
  }
});

test('packed package does not expose private portfolio or retired Gemini assets', () => {
  const targetDir = mkdtempSync(join(tmpdir(), 'pro-gov-private-leak-'));
  const tarballPath = join(targetDir, 'pro-gov.tgz');

  try {
    const pack = spawnSync('pnpm', ['pack', '--out', tarballPath], {
      cwd: packageRoot,
      encoding: 'utf8',
    });
    assert.equal(pack.status, 0, pack.stderr || pack.stdout);

    const list = spawnSync('tar', ['-tzf', tarballPath], { encoding: 'utf8' });
    assert.equal(list.status, 0, list.stderr || list.stdout);
    assert.doesNotMatch(list.stdout, /downstream-project-registry\.md/);
    assert.doesNotMatch(list.stdout, /public-release-checklist\.md/);
    assert.doesNotMatch(list.stdout, /site-publication-brief\.md/);
    assert.doesNotMatch(list.stdout, /GEMINI\.md/);
    assert.doesNotMatch(list.stdout, /\.gemini\//);

    const extractDir = join(targetDir, 'extract');
    mkdirSync(extractDir);
    const extract = spawnSync('tar', ['-xzf', tarballPath, '-C', extractDir], { encoding: 'utf8' });
    assert.equal(extract.status, 0, extract.stderr || extract.stdout);

    const packedText = listFiles(join(extractDir, 'package'))
      .filter((path) => statSync(path).isFile())
      .map((path) => readFileSync(path, 'utf8'))
      .join('\n');

    assert.doesNotMatch(packedText, /\/Users\/yuanfei\/PieAI\//);
    assert.doesNotMatch(packedText, /\bPieHQ\b/);
    assert.doesNotMatch(packedText, /\bYuanfei\b/);
    assert.doesNotMatch(packedText, /\bOwnMySpace\b/);
    assert.doesNotMatch(packedText, /\bNon-Heroes\b/);
    assert.doesNotMatch(packedText, /\bTuringPact\b/);
  } finally {
    rmSync(targetDir, { recursive: true, force: true });
  }
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

test('assets list --json prints the agent asset registry', () => {
  const result = spawnSync(
    process.execPath,
    [join(packageRoot, 'dist/cli.js'), 'assets', 'list', '--json'],
    {
      cwd: packageRoot,
      encoding: 'utf8',
    },
  );

  assert.equal(result.status, 0);
  const parsed = JSON.parse(result.stdout);
  assert.equal(parsed.count, agentAssetRegistry.assets.length);
  assert.deepEqual(
    parsed.assets.map((asset: { id: string }) => asset.id).sort(),
    agentAssetRegistry.assets.map((asset) => asset.id).sort(),
  );
});

test('assets list --visibility filters registry assets', () => {
  const result = spawnSync(
    process.execPath,
    [join(packageRoot, 'dist/cli.js'), 'assets', 'list', '--visibility', 'third-party', '--json'],
    {
      cwd: packageRoot,
      encoding: 'utf8',
    },
  );

  assert.equal(result.status, 0);
  const parsed = JSON.parse(result.stdout);
  assert.equal(
    parsed.count,
    agentAssetRegistry.assets.filter((asset) => asset.visibility === 'third-party').length,
  );
  assert.ok(
    parsed.assets.every((asset: { visibility: string }) => asset.visibility === 'third-party'),
  );
});

test('assets recommend --json recommends bundles from target signals', () => {
  const targetDir = createTempTargetDir();
  writeFileSync(join(targetDir, 'package.json'), JSON.stringify({ dependencies: { react: '^19.0.0' } }));

  const result = spawnSync(
    process.execPath,
    [join(packageRoot, 'dist/cli.js'), 'assets', 'recommend', '--target', targetDir, '--json'],
    {
      cwd: packageRoot,
      encoding: 'utf8',
    },
  );

  assert.equal(result.status, 0);
  const parsed = JSON.parse(result.stdout);
  assert.deepEqual(
    parsed.recommendations.map((recommendation: { bundleId: string }) => recommendation.bundleId),
    ['base-governance', 'frontend-app'],
  );
});

test('assets discover --json returns local target signals', () => {
  const targetDir = createTempTargetDir();
  mkdirSync(join(targetDir, 'docs/research'), { recursive: true });
  writeFileSync(join(targetDir, 'AGENTS.md'), '# Agents\n');
  writeFileSync(join(targetDir, 'README.md'), '# Research Notes\n');
  writeFileSync(join(targetDir, 'package.json'), JSON.stringify({ devDependencies: { vite: '^7.0.0' } }));

  const result = spawnSync(
    process.execPath,
    [join(packageRoot, 'dist/cli.js'), 'assets', 'discover', '--target', targetDir, '--json'],
    {
      cwd: packageRoot,
      encoding: 'utf8',
    },
  );

  assert.equal(result.status, 0);
  const parsed = JSON.parse(result.stdout);
  assert.equal(parsed.hasAgentEntry, true);
  assert.deepEqual(parsed.frontendSignals, ['vite']);
  assert.ok(parsed.researchSignals.includes('docs/research'));
});

test('assets discover ignores retired Gemini adapter files', () => {
  const targetDir = createTempTargetDir();
  mkdirSync(join(targetDir, '.gemini'), { recursive: true });
  writeFileSync(
    join(targetDir, '.gemini/settings.json'),
    `${JSON.stringify({ context: { fileName: ['AGENTS.md'] } }, null, 2)}\n`,
  );
  writeFileSync(join(targetDir, 'GEMINI.md'), '# Gemini\n');

  const result = spawnSync(
    process.execPath,
    [join(packageRoot, 'dist/cli.js'), 'assets', 'discover', '--target', targetDir, '--json'],
    {
      cwd: packageRoot,
      encoding: 'utf8',
    },
  );

  assert.equal(result.status, 0);
  const parsed = JSON.parse(result.stdout);
  assert.equal(parsed.hasAgentEntry, false);
});

test('assets plan --json creates a dry-run plan without writing target files', { skip: !hasBaseGovernanceBundle }, () => {
  const targetDir = createTempTargetDir();

  const result = spawnSync(
    process.execPath,
    [
      join(packageRoot, 'dist/cli.js'),
      'assets',
      'plan',
      '--target',
      targetDir,
      '--bundle',
      'base-governance',
      '--json',
    ],
    {
      cwd: packageRoot,
      encoding: 'utf8',
    },
  );

  assert.equal(result.status, 0);
  const parsed = JSON.parse(result.stdout);
  assert.equal(parsed.dryRun, true);
  assert.ok(parsed.actions.some((action: { targetPath: string }) => action.targetPath === '.pro-gov/assets.lock.json'));
  assert.equal(existsSync(join(targetDir, '.agents')), false);
  assert.equal(existsSync(join(targetDir, '.pro-gov')), false);
});

test('assets plan --placement manual targets codex manual skills', { skip: !hasBaseGovernanceBundle }, () => {
  const targetDir = createTempTargetDir();

  const result = spawnSync(
    process.execPath,
    [
      join(packageRoot, 'dist/cli.js'),
      'assets',
      'plan',
      '--target',
      targetDir,
      '--bundle',
      'base-governance',
      '--placement',
      'manual',
      '--json',
    ],
    {
      cwd: packageRoot,
      encoding: 'utf8',
    },
  );

  assert.equal(result.status, 0);
  const parsed = JSON.parse(result.stdout);
  assert.equal(parsed.placement, 'manual');
  assert.ok(
    parsed.actions.some(
      (action: { type: string; targetPath: string }) =>
        action.type === 'symlink' && action.targetPath === '.agents/manual-skills/doc-cross-validator',
    ),
  );
});

test('assets plan rejects user-scoped Project Lens skills for project targets', { skip: !hasProjectLensBundle }, () => {
  const targetDir = createTempTargetDir();
  const outPath = join(targetDir, 'asset-plan.json');

  const result = spawnSync(
    process.execPath,
    [
      join(packageRoot, 'dist/cli.js'),
      'assets',
      'plan',
      '--target',
      targetDir,
      '--bundle',
      'project-lens',
      '--host',
      'claude-code',
      '--out',
      outPath,
    ],
    {
      cwd: packageRoot,
      encoding: 'utf8',
    },
  );

  assert.equal(result.status, 1);
  assert.match(result.stderr, /User-scoped asset pie-skills\/project-architecture-lens/);
  assert.equal(existsSync(outPath), false);
  assert.equal(existsSync(join(targetDir, '.pro-gov')), false);
});

test('assets apply and check complete a managed install flow', () => {
  const targetDir = createTempTargetDir();
  const outPath = join(targetDir, 'asset-plan.json');

  const planResult = spawnSync(
    process.execPath,
    [
      join(packageRoot, 'dist/cli.js'),
      'assets',
      'plan',
      '--target',
      targetDir,
      '--bundle',
      'base-governance',
      '--out',
      outPath,
    ],
    {
      cwd: packageRoot,
      encoding: 'utf8',
    },
  );
  assert.equal(planResult.status, 0);

  const applyResult = spawnSync(
    process.execPath,
    [join(packageRoot, 'dist/cli.js'), 'assets', 'apply', '--plan', outPath],
    {
      cwd: packageRoot,
      encoding: 'utf8',
    },
  );
  assert.equal(applyResult.status, 0);
  assert.equal(existsSync(join(targetDir, '.agents/skills/doc-cross-validator')), true);

  const checkResult = spawnSync(
    process.execPath,
    [join(packageRoot, 'dist/cli.js'), 'assets', 'check', '--target', targetDir, '--json'],
    {
      cwd: packageRoot,
      encoding: 'utf8',
    },
  );
  assert.equal(checkResult.status, 0);
  const parsed = JSON.parse(checkResult.stdout);
  assert.deepEqual(parsed.issues, []);
});

test('assets check --strict-registry reports unknown locked assets', () => {
  const targetDir = createTempTargetDir();
  const sourcePath = join(loadedAgentAssets.agentAssetsDir, 'skills/pie-skills/doc-cross-validator');
  mkdirSync(join(targetDir, '.agents/skills'), { recursive: true });
  mkdirSync(join(targetDir, '.pro-gov'), { recursive: true });
  symlinkSync(sourcePath, join(targetDir, '.agents/skills/unknown-private-skill'));
  writeFileSync(
    join(targetDir, '.pro-gov/assets.lock.json'),
    `${JSON.stringify(
      {
        schemaVersion: 1,
        host: 'codex',
        placement: 'registry',
        bundleIds: ['private-test'],
        assets: [
          {
            id: 'private-skills/unknown-private-skill',
            sourcePath: 'skills/private-skills/unknown-private-skill',
            targetPath: '.agents/skills/unknown-private-skill',
            contentHash: hashAssetPathContent(sourcePath),
          },
        ],
      },
      null,
      2,
    )}\n`,
  );

  const result = spawnSync(
    process.execPath,
    [join(packageRoot, 'dist/cli.js'), 'assets', 'check', '--target', targetDir, '--strict-registry', '--json'],
    {
      cwd: packageRoot,
      encoding: 'utf8',
    },
  );

  assert.equal(result.status, 1, result.stderr || result.stdout);
  const parsed = JSON.parse(result.stdout);
  assert.ok(parsed.issues.some((issue: { type: string }) => issue.type === 'unknown-asset'));
});

test('assets npx update --help does not touch or validate the npx root', () => {
  const result = spawnSync(
    process.execPath,
    [
      join(packageRoot, 'dist/cli.js'),
      'assets',
      'npx',
      'update',
      '--help',
      '--root',
      '/definitely/missing/npx-root',
    ],
    {
      cwd: packageRoot,
      encoding: 'utf8',
    },
  );

  assert.equal(result.status, 0);
  assert.match(result.stdout, /pro-gov assets npx/);
});

test('assets public-check verifies promoted public assets against private sources', () => {
  const rootDir = createTempTargetDir();
  const privateRoot = join(rootDir, 'agent-assets');
  const publicRoot = join(rootDir, 'public-agent-assets');
  mkdirSync(join(privateRoot, 'skills/pie-skills/example'), { recursive: true });
  mkdirSync(join(publicRoot, 'skills/pie-skills/example'), { recursive: true });
  writeFileSync(join(privateRoot, 'skills/pie-skills/example/SKILL.md'), '# Private\n');
  writeFileSync(join(publicRoot, 'skills/pie-skills/example/SKILL.md'), '# Public\n');
  const privateHash = hashAssetPathContent(join(privateRoot, 'skills/pie-skills/example'));
  const publicHash = hashAssetPathContent(join(publicRoot, 'skills/pie-skills/example'));
  writeFileSync(
    join(publicRoot, 'registry.json'),
    `${JSON.stringify(
      {
        schemaVersion: 1,
        assets: [
          {
            id: 'pie-skills/example',
            title: 'Example',
            family: 'pie-skills',
            kind: 'skill',
            visibility: 'public',
            sourceKind: 'local',
            sourcePath: 'skills/pie-skills/example',
            hosts: ['codex'],
            tags: ['skill'],
            defaultPlacement: 'auto',
            publishable: true,
            origin: 'Promoted from private source.',
            notes: 'Public reviewed copy.',
            promotion: {
              privateSourcePath: 'skills/pie-skills/example',
              privateSourceHash: privateHash,
              publicHash,
              sanitized: true,
              lastReviewed: '2026-06-25',
              reviewNotes: 'Removed maintainer-only details.',
            },
          },
        ],
      },
      null,
      2,
    )}\n`,
  );

  const result = spawnSync(
    process.execPath,
    [
      join(packageRoot, 'dist/cli.js'),
      'assets',
      'public-check',
      '--public-root',
      publicRoot,
      '--private-root',
      privateRoot,
      '--json',
    ],
    {
      cwd: packageRoot,
      encoding: 'utf8',
    },
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const parsed = JSON.parse(result.stdout);
  assert.equal(parsed.checked, 1);
  assert.deepEqual(parsed.issues, []);
});

test('lens scan --json returns a local evidence packet', () => {
  const targetDir = createTempTargetDir();
  writeFileSync(join(targetDir, 'package.json'), JSON.stringify({ scripts: { test: 'node --test' } }));
  writeFileSync(join(targetDir, 'AGENTS.md'), '# Agents\n');

  const result = spawnSync(
    process.execPath,
    [join(packageRoot, 'dist/cli.js'), 'lens', 'scan', '--target', targetDir, '--json'],
    {
      cwd: packageRoot,
      encoding: 'utf8',
    },
  );

  assert.equal(result.status, 0);
  const parsed = JSON.parse(result.stdout);
  assert.deepEqual(parsed.aiEntryFiles, ['AGENTS.md']);
  assert.deepEqual(parsed.aiConfigFiles, []);
  assert.deepEqual(parsed.packageJson.scripts, ['test']);
});

test('lens inspect --format json returns the same local evidence shape', () => {
  const targetDir = createTempTargetDir();
  writeFileSync(join(targetDir, 'CLAUDE.md'), '# Claude\n');
  mkdirSync(join(targetDir, '.gemini'), { recursive: true });
  writeFileSync(join(targetDir, '.gemini/settings.json'), '{"context":{"fileName":["AGENTS.md"]}}\n');
  writeFileSync(join(targetDir, 'GEMINI.md'), '# Gemini\n');

  const result = spawnSync(
    process.execPath,
    [join(packageRoot, 'dist/cli.js'), 'lens', 'inspect', '--target', targetDir, '--format', 'json'],
    {
      cwd: packageRoot,
      encoding: 'utf8',
    },
  );

  assert.equal(result.status, 0);
  const parsed = JSON.parse(result.stdout);
  assert.deepEqual(parsed.aiEntryFiles, ['CLAUDE.md']);
  assert.deepEqual(parsed.aiConfigFiles, []);
});

test('lens report writes a markdown evidence report', () => {
  const targetDir = createTempTargetDir();
  const reportPath = join(targetDir, 'reports/lens.md');
  writeFileSync(join(targetDir, 'AGENTS.md'), '# Agents\n');

  const result = spawnSync(
    process.execPath,
    [
      join(packageRoot, 'dist/cli.js'),
      'lens',
      'report',
      '--target',
      targetDir,
      '--out',
      reportPath,
    ],
    {
      cwd: packageRoot,
      encoding: 'utf8',
    },
  );

  assert.equal(result.status, 0);
  const markdown = readFileSync(reportPath, 'utf8');
  assert.match(markdown, /# Project Lens Evidence Report/);
  assert.match(markdown, /AGENTS\.md/);
  assert.doesNotMatch(markdown, /GEMINI\.md/);
  assert.match(markdown, /AI Config Adapters/);
  assert.match(markdown, /## Review Notes/);
});

test('lens audit init creates a raw-first audit package contract', () => {
  const targetDir = createTempTargetDir();
  const auditDir = join(targetDir, 'audits/ownmyspace/2026-07-01');
  writeFileSync(join(targetDir, 'AGENTS.md'), '# Agents\n');

  const result = spawnSync(
    process.execPath,
    [
      join(packageRoot, 'dist/cli.js'),
      'lens',
      'audit',
      'init',
      '--target',
      targetDir,
      '--out',
      auditDir,
    ],
    {
      cwd: packageRoot,
      encoding: 'utf8',
    },
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(existsSync(join(auditDir, 'audit.contract.json')), true);
  assert.equal(existsSync(join(auditDir, 'manifest.md')), true);
  assert.equal(existsSync(join(auditDir, 'raw/project-lens/architecture-lens.md')), true);
  assert.equal(existsSync(join(auditDir, 'raw/project-lens/truth-surface-audit.md')), true);
  assert.equal(existsSync(join(auditDir, 'raw/project-lens/technology-strategy.md')), true);
  assert.equal(existsSync(join(auditDir, 'raw/ponytail/ponytail-audit.md')), true);
  assert.equal(existsSync(join(auditDir, 'raw/ponytail/ponytail-debt.md')), true);
  assert.equal(existsSync(join(auditDir, 'raw/ponytail/ponytail-gain.md')), true);
  assert.equal(existsSync(join(auditDir, 'synthesis/decision-index.md')), true);
  assert.equal(existsSync(join(auditDir, 'synthesis/handoff-for-implementation-ai.md')), true);

  const contract = JSON.parse(readFileSync(join(auditDir, 'audit.contract.json'), 'utf8')) as {
    version: number;
    target: { path: string };
    requiredArtifacts: string[];
  };
  assert.equal(contract.version, 1);
  assert.equal(contract.target.path, targetDir);
  assert.ok(contract.requiredArtifacts.includes('raw/ponytail/ponytail-audit.md'));
  assert.ok(contract.requiredArtifacts.includes('raw/project-lens/architecture-lens.md'));

  const manifestTemplate = readFileSync(join(auditDir, 'manifest.md'), 'utf8');
  assert.match(manifestTemplate, /^Read-only boundary: <replace with evidence>$/m);
  assert.match(manifestTemplate, /^Agent execution record: <replace with evidence>$/m);
  assert.match(manifestTemplate, /^Subagent trace: <replace with evidence>$/m);
  assert.match(manifestTemplate, /^Audit run mode: <replace with fresh>$/m);
  assert.match(manifestTemplate, /^Audit run mode: <replace with reuse>$/m);
  assert.doesNotMatch(manifestTemplate, /^Audit run mode: fresh$/m);
  assert.doesNotMatch(manifestTemplate, /^Audit run mode: reuse$/m);
  assert.doesNotMatch(manifestTemplate, /^- Read-only boundary:/m);

  const commandsTemplate = readFileSync(join(auditDir, 'raw/target/commands.md'), 'utf8');
  assert.match(commandsTemplate, /^Project Lens method source: <replace with evidence>$/m);
  assert.match(commandsTemplate, /^Ponytail method source: <replace with evidence>$/m);
  assert.doesNotMatch(commandsTemplate, /^- Project Lens method source:/m);
});

test('lens audit check fails when required raw artifacts are missing', () => {
  const targetDir = createTempTargetDir();
  const auditDir = join(targetDir, 'audits/ownmyspace/2026-07-01');

  const init = spawnSync(
    process.execPath,
    [join(packageRoot, 'dist/cli.js'), 'lens', 'audit', 'init', '--target', targetDir, '--out', auditDir],
    {
      cwd: packageRoot,
      encoding: 'utf8',
    },
  );
  assert.equal(init.status, 0, init.stderr || init.stdout);
  rmSync(join(auditDir, 'raw/ponytail/ponytail-audit.md'));

  const result = spawnSync(
    process.execPath,
    [join(packageRoot, 'dist/cli.js'), 'lens', 'audit', 'check', '--dir', auditDir, '--json'],
    {
      cwd: packageRoot,
      encoding: 'utf8',
    },
  );

  assert.equal(result.status, 1);
  const parsed = JSON.parse(result.stdout) as {
    ok: boolean;
    issues: Array<{ type: string; path: string; message?: string }>;
  };
  assert.equal(parsed.ok, false);
  assert.ok(
    parsed.issues.some(
      (issue) => issue.type === 'missing-required-artifact' && issue.path === 'raw/ponytail/ponytail-audit.md',
    ),
  );
});

test('lens audit check fails pending template artifacts', () => {
  const targetDir = createTempTargetDir();
  const auditDir = join(targetDir, 'audits/ownmyspace/2026-07-01');

  const init = spawnSync(
    process.execPath,
    [join(packageRoot, 'dist/cli.js'), 'lens', 'audit', 'init', '--target', targetDir, '--out', auditDir],
    {
      cwd: packageRoot,
      encoding: 'utf8',
    },
  );
  assert.equal(init.status, 0, init.stderr || init.stdout);

  const result = spawnSync(
    process.execPath,
    [join(packageRoot, 'dist/cli.js'), 'lens', 'audit', 'check', '--dir', auditDir, '--json'],
    {
      cwd: packageRoot,
      encoding: 'utf8',
    },
  );

  assert.equal(result.status, 1);
  const parsed = JSON.parse(result.stdout) as {
    ok: boolean;
    issues: Array<{ type: string; path: string; message?: string }>;
  };
  assert.equal(parsed.ok, false);
  assert.ok(
    parsed.issues.some(
      (issue) => issue.type === 'artifact-not-complete' && issue.path === 'raw/ponytail/ponytail-audit.md',
    ),
  );
});

test('lens audit check fails complete markers left on untouched templates', () => {
  const targetDir = createTempTargetDir();
  const auditDir = join(targetDir, 'audits/ownmyspace/2026-07-01');

  const init = spawnSync(
    process.execPath,
    [join(packageRoot, 'dist/cli.js'), 'lens', 'audit', 'init', '--target', targetDir, '--out', auditDir],
    {
      cwd: packageRoot,
      encoding: 'utf8',
    },
  );
  assert.equal(init.status, 0, init.stderr || init.stdout);

  const contract = JSON.parse(readFileSync(join(auditDir, 'audit.contract.json'), 'utf8')) as {
    requiredArtifacts: string[];
  };
  for (const artifactPath of contract.requiredArtifacts) {
    const absolutePath = join(auditDir, artifactPath);
    const content = readFileSync(absolutePath, 'utf8').replace('status: pending', 'status: complete');
    writeFileSync(absolutePath, content);
  }

  const result = spawnSync(
    process.execPath,
    [join(packageRoot, 'dist/cli.js'), 'lens', 'audit', 'check', '--dir', auditDir, '--json'],
    {
      cwd: packageRoot,
      encoding: 'utf8',
    },
  );

  assert.equal(result.status, 1);
  const parsed = JSON.parse(result.stdout) as { ok: boolean; issues: Array<{ type: string; path: string }> };
  assert.equal(parsed.ok, false);
  assert.ok(
    parsed.issues.some(
      (issue) => issue.type === 'artifact-template-not-replaced' && issue.path === 'raw/ponytail/ponytail-audit.md',
    ),
  );
});

test('lens audit check fails when the contract omits required artifacts', () => {
  const targetDir = createTempTargetDir();
  const auditDir = join(targetDir, 'audits/ownmyspace/2026-07-01');

  const init = spawnSync(
    process.execPath,
    [join(packageRoot, 'dist/cli.js'), 'lens', 'audit', 'init', '--target', targetDir, '--out', auditDir],
    {
      cwd: packageRoot,
      encoding: 'utf8',
    },
  );
  assert.equal(init.status, 0, init.stderr || init.stdout);

  const contractPath = join(auditDir, 'audit.contract.json');
  const contract = JSON.parse(readFileSync(contractPath, 'utf8')) as { requiredArtifacts: string[] };
  contract.requiredArtifacts = [];
  writeFileSync(contractPath, `${JSON.stringify(contract, null, 2)}\n`);

  const result = spawnSync(
    process.execPath,
    [join(packageRoot, 'dist/cli.js'), 'lens', 'audit', 'check', '--dir', auditDir, '--json'],
    {
      cwd: packageRoot,
      encoding: 'utf8',
    },
  );

  assert.equal(result.status, 1);
  const parsed = JSON.parse(result.stdout) as { ok: boolean; issues: Array<{ type: string; path: string }> };
  assert.equal(parsed.ok, false);
  assert.ok(
    parsed.issues.some((issue) => issue.type === 'invalid-contract' && issue.path === 'audit.contract.json'),
  );
});

test('lens audit check fails when provenance guardrails are missing', () => {
  const targetDir = createTempTargetDir();
  const auditDir = join(targetDir, 'audits/ownmyspace/2026-07-01');

  const init = spawnSync(
    process.execPath,
    [join(packageRoot, 'dist/cli.js'), 'lens', 'audit', 'init', '--target', targetDir, '--out', auditDir],
    {
      cwd: packageRoot,
      encoding: 'utf8',
    },
  );
  assert.equal(init.status, 0, init.stderr || init.stdout);

  markAuditArtifactsComplete(auditDir, 'Evidence: completed raw artifact.');

  const result = spawnSync(
    process.execPath,
    [join(packageRoot, 'dist/cli.js'), 'lens', 'audit', 'check', '--dir', auditDir, '--json'],
    {
      cwd: packageRoot,
      encoding: 'utf8',
    },
  );

  assert.equal(result.status, 1);
  const parsed = JSON.parse(result.stdout) as {
    ok: boolean;
    issues: Array<{ type: string; path: string; message?: string }>;
  };
  assert.equal(parsed.ok, false);
  assert.ok(parsed.issues.some((issue) => issue.type === 'audit-method-not-recorded' && issue.path === 'manifest.md'));
  assert.ok(
    parsed.issues.some(
      (issue) => issue.message === 'Missing required audit method record: Subagent trace:',
    ),
  );
  assert.ok(
    parsed.issues.some((issue) => issue.type === 'audit-method-not-recorded' && issue.path === 'raw/target/commands.md'),
  );
  assert.ok(
    parsed.issues.some(
      (issue) => issue.type === 'audit-method-not-recorded' && issue.path === 'synthesis/decision-index.md',
    ),
  );
});

test('lens audit check --mode fresh rejects reused evidence without fresh run records', () => {
  const targetDir = createTempTargetDir();
  const auditDir = join(targetDir, 'audits/ownmyspace/2026-07-01');

  const init = spawnSync(
    process.execPath,
    [join(packageRoot, 'dist/cli.js'), 'lens', 'audit', 'init', '--target', targetDir, '--out', auditDir],
    {
      cwd: packageRoot,
      encoding: 'utf8',
    },
  );
  assert.equal(init.status, 0, init.stderr || init.stdout);

  markAuditArtifactsComplete(auditDir, completeAuditBody());

  const result = spawnSync(
    process.execPath,
    [join(packageRoot, 'dist/cli.js'), 'lens', 'audit', 'check', '--dir', auditDir, '--mode', 'fresh', '--json'],
    {
      cwd: packageRoot,
      encoding: 'utf8',
    },
  );

  assert.equal(result.status, 1);
  const parsed = JSON.parse(result.stdout) as {
    ok: boolean;
    issues: Array<{ type: string; path: string; message?: string }>;
  };
  assert.equal(parsed.ok, false);
  assert.ok(
    parsed.issues.some(
      (issue) => issue.message === 'Missing required audit method record: Fresh run evidence:',
    ),
  );
});

test('lens audit check passes when required artifacts are marked complete', () => {
  const targetDir = createTempTargetDir();
  const auditDir = join(targetDir, 'audits/ownmyspace/2026-07-01');

  const init = spawnSync(
    process.execPath,
    [join(packageRoot, 'dist/cli.js'), 'lens', 'audit', 'init', '--target', targetDir, '--out', auditDir],
    {
      cwd: packageRoot,
      encoding: 'utf8',
    },
  );
  assert.equal(init.status, 0, init.stderr || init.stdout);

  markAuditArtifactsComplete(auditDir, completeAuditBody());

  const result = spawnSync(
    process.execPath,
    [join(packageRoot, 'dist/cli.js'), 'lens', 'audit', 'check', '--dir', auditDir, '--json'],
    {
      cwd: packageRoot,
      encoding: 'utf8',
    },
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const parsed = JSON.parse(result.stdout) as { ok: boolean; issues: unknown[] };
  assert.equal(parsed.ok, true);
  assert.deepEqual(parsed.issues, []);
});

test('lens audit check --mode fresh passes with current-run evidence records', () => {
  const targetDir = createTempTargetDir();
  const auditDir = join(targetDir, 'audits/ownmyspace/2026-07-01');

  const init = spawnSync(
    process.execPath,
    [join(packageRoot, 'dist/cli.js'), 'lens', 'audit', 'init', '--target', targetDir, '--out', auditDir],
    {
      cwd: packageRoot,
      encoding: 'utf8',
    },
  );
  assert.equal(init.status, 0, init.stderr || init.stdout);

  markAuditArtifactsComplete(
    auditDir,
    [
      completeAuditBody(),
      'Audit run mode: fresh',
      'Current session id: 019f1c94-example',
      'Fresh run evidence: raw Project Lens and Ponytail passes were created in this session; no existing audit package was reused.',
    ].join('\n'),
  );

  const result = spawnSync(
    process.execPath,
    [join(packageRoot, 'dist/cli.js'), 'lens', 'audit', 'check', '--dir', auditDir, '--mode', 'fresh', '--json'],
    {
      cwd: packageRoot,
      encoding: 'utf8',
    },
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const parsed = JSON.parse(result.stdout) as { ok: boolean; issues: unknown[] };
  assert.equal(parsed.ok, true);
  assert.deepEqual(parsed.issues, []);
});

test('lens audit check --mode reuse passes only with reuse records', () => {
  const targetDir = createTempTargetDir();
  const auditDir = join(targetDir, 'audits/ownmyspace/2026-07-01');

  const init = spawnSync(
    process.execPath,
    [join(packageRoot, 'dist/cli.js'), 'lens', 'audit', 'init', '--target', targetDir, '--out', auditDir],
    {
      cwd: packageRoot,
      encoding: 'utf8',
    },
  );
  assert.equal(init.status, 0, init.stderr || init.stdout);

  markAuditArtifactsComplete(
    auditDir,
    [
      completeAuditBody(),
      'Audit run mode: reuse',
      'Reuse source audit: audits/ownmyspace/2026-07-01',
      'Reuse justification: same target commit, target worktree clean, and package check passed.',
      'No new subagents were run: true; this was a reuse verification, not a fresh audit.',
    ].join('\n'),
  );

  const result = spawnSync(
    process.execPath,
    [join(packageRoot, 'dist/cli.js'), 'lens', 'audit', 'check', '--dir', auditDir, '--mode', 'reuse', '--json'],
    {
      cwd: packageRoot,
      encoding: 'utf8',
    },
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const parsed = JSON.parse(result.stdout) as { ok: boolean; issues: unknown[] };
  assert.equal(parsed.ok, true);
  assert.deepEqual(parsed.issues, []);
});

function completeAuditBody(): string {
  return [
    'Evidence: completed raw artifact.',
    'Read-only boundary: target repository was not modified; audit package was written in PGS.',
    'Agent execution record: subagents used for architecture, technology, and Ponytail passes.',
    'Subagent trace: architecture=completed raw/project-lens/architecture-lens.md; technology=completed raw/project-lens/technology-strategy.md; ponytail=completed raw/ponytail/ponytail-audit.md.',
    'Project Lens method source: project-architecture-lens skill plus pro-gov lens inspect.',
    'Ponytail method source: ponytail-audit, ponytail-debt, and ponytail-gain skills.',
    'Target repository final status: clean worktree verified.',
    'Audit package final status: pro-gov lens audit check passed.',
  ].join('\n');
}

function markAuditArtifactsComplete(auditDir: string, replacementBody: string): void {
  const contract = JSON.parse(readFileSync(join(auditDir, 'audit.contract.json'), 'utf8')) as {
    requiredArtifacts: string[];
  };
  for (const artifactPath of contract.requiredArtifacts) {
    const absolutePath = join(auditDir, artifactPath);
    const content = readFileSync(absolutePath, 'utf8')
      .replace('status: pending', 'status: complete')
      .replace('Replace this template with the raw audit output for this producer.', replacementBody);
    writeFileSync(absolutePath, content);
  }
}

function createTempTargetDir(): string {
  const targetDir = join(tmpdir(), `pro-gov-cli-target-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  mkdirSync(targetDir, { recursive: true });
  return targetDir;
}

function listFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const absolutePath = join(dir, entry);
    if (statSync(absolutePath).isDirectory()) {
      files.push(...listFiles(absolutePath));
    } else {
      files.push(absolutePath);
    }
  }
  return files.sort();
}
