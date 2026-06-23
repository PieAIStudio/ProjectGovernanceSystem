import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { listAssets } from './assets';
import { loadAgentAssetBundles } from './asset-bundles/bundles';
import { loadAgentAssetRegistry } from './asset-registry/loader';

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
  assert.ok(paths.includes('starter/.gemini/settings.json'));
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

test('assets discover treats Gemini CLI AGENTS config as an agent adapter', () => {
  const targetDir = createTempTargetDir();
  mkdirSync(join(targetDir, '.gemini'), { recursive: true });
  writeFileSync(
    join(targetDir, '.gemini/settings.json'),
    `${JSON.stringify({ context: { fileName: ['AGENTS.md'] } }, null, 2)}\n`,
  );

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

test('assets plan --out writes a plan artifact for a non-Codex host without applying it', { skip: !hasProjectLensBundle }, () => {
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

  assert.equal(result.status, 0);
  const parsed = JSON.parse(readFileSync(outPath, 'utf8'));
  assert.equal(parsed.host, 'claude-code');
  assert.ok(
    parsed.actions.some(
      (action: { type: string; targetPath: string }) =>
        action.type === 'symlink' && action.targetPath === '.claude/skills/project-architecture-lens',
    ),
  );
  assert.equal(existsSync(join(targetDir, '.claude')), false);
  assert.equal(existsSync(join(targetDir, '.pro-gov')), false);
});

test('assets apply and check complete a managed install flow', { skip: !hasProjectLensBundle }, () => {
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
      'project-lens',
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
  assert.equal(existsSync(join(targetDir, '.agents/skills/project-architecture-lens')), true);

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
  assert.deepEqual(parsed.aiConfigFiles, ['.gemini/settings.json']);
});

test('lens report writes a markdown evidence report', () => {
  const targetDir = createTempTargetDir();
  const reportPath = join(targetDir, 'reports/lens.md');
  writeFileSync(join(targetDir, 'GEMINI.md'), '# Gemini\n');

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
  assert.match(markdown, /GEMINI\.md/);
  assert.match(markdown, /AI Config Adapters/);
  assert.match(markdown, /## Review Notes/);
});

function createTempTargetDir(): string {
  const targetDir = join(tmpdir(), `pro-gov-cli-target-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  mkdirSync(targetDir, { recursive: true });
  return targetDir;
}
