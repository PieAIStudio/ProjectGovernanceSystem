import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const sandbox = mkdtempSync(join(tmpdir(), 'pgs-packed-consumer-'));
const packDir = join(sandbox, 'packs');
const consumerDir = join(sandbox, 'consumer');
const docTarball = join(packDir, 'doc-gov.tgz');
const proTarball = join(packDir, 'pro-gov.tgz');

try {
  mkdirSync(packDir);
  mkdirSync(consumerDir);
  run('pnpm', ['--filter', '@pieai/doc-gov', 'pack', '--out', docTarball], repoRoot);
  run('pnpm', ['--filter', '@pieai/pro-gov', 'pack', '--out', proTarball], repoRoot);
  const packedProPackageJson = JSON.parse(run('tar', ['-xOf', proTarball, 'package/package.json'], repoRoot));
  assert(!JSON.stringify(packedProPackageJson).includes('workspace:'), 'workspace protocol leaked into packed pro-gov package.json');
  assert(
    packedProPackageJson.dependencies?.['@pieai/doc-gov'] === `^${packedProPackageJson.version}`,
    'packed pro-gov dependency on doc-gov does not match the package version',
  );

  writeFileSync(
    join(consumerDir, 'package.json'),
    `${JSON.stringify({ name: 'pgs-consumer-smoke', private: true, version: '1.0.0' }, null, 2)}\n`,
  );
  writeFileSync(join(consumerDir, 'README.md'), '# PGS Consumer Smoke\n');

  run('npm', ['install', '--ignore-scripts', docTarball, proTarball], consumerDir);
  const binDir = join(consumerDir, 'node_modules', '.bin');
  const proGov = join(binDir, 'pro-gov');
  const docGov = join(binDir, 'doc-gov');

  run(proGov, ['doctor'], consumerDir);
  run(proGov, ['assets', 'list', '--json'], consumerDir);
  run(proGov, ['init', '--profile', 'engineering-runtime', '--apply'], consumerDir);
  run(docGov, ['scan'], consumerDir);
  run(proGov, ['sync', '--check', '--profile', 'engineering-runtime'], consumerDir);
  const portfolioDir = join(consumerDir, '.pro-gov');
  mkdirSync(portfolioDir, { recursive: true });
  writeFileSync(
    join(portfolioDir, 'portfolio.json'),
    `${JSON.stringify(
      {
        schemaVersion: 1,
        portfolioId: 'example-org',
        targets: [
          {
            id: 'consumer-app',
            path: '..',
            profile: 'engineering-runtime',
            assetBundles: ['base-governance'],
          },
        ],
      },
      null,
      2,
    )}\n`,
  );
  run(proGov, ['portfolio', 'check', '--config', join(portfolioDir, 'portfolio.json'), '--json'], consumerDir);
  run(proGov, ['portfolio', 'plan', '--config', join(portfolioDir, 'portfolio.json'), '--target', 'consumer-app', '--json'], consumerDir);
  run(docGov, ['router-check'], consumerDir);
  run(docGov, ['check'], consumerDir);
  run(docGov, ['scan', '--check'], consumerDir);
  run(docGov, ['links'], consumerDir);
  run(docGov, ['audit'], consumerDir);
  run(docGov, ['doctor'], consumerDir);

  assert(!existsSync(join(consumerDir, 'docs/governance/agents-routing/doc-only-v0.9.md')), 'unselected profile was installed');
  assert(!existsSync(join(consumerDir, 'node_modules/@pieai/pro-gov/assets/agent-assets')), 'private asset root was packaged');
  assert(!existsSync(join(consumerDir, 'node_modules/@pieai/pro-gov/assets/docs/reference/adoption/public-release-checklist.md')), 'maintainer release checklist was packaged');
  assert(!existsSync(join(consumerDir, 'node_modules/@pieai/pro-gov/assets/docs/reference/adoption/site-publication-brief.md')), 'maintainer site brief was packaged');

  const installedText = listFiles(join(consumerDir, 'node_modules', '@pieai'))
    .filter((path) => statSync(path).isFile())
    .map((path) => readFileSync(path, 'utf8'))
    .join('\n');
  assert(!/\/Users\/yuanfei\/PieAI\//.test(installedText), 'machine-local PieAI path leaked into package');
  assert(!/\bPieHQ\b/.test(installedText), 'private control-plane name leaked into package');
  assert(!/\b(Yuanfei|OwnMySpace|Non-Heroes|TuringPact)\b/.test(installedText), 'private instance name leaked into package');

  console.log('packed consumer smoke passed');
} finally {
  rmSync(sandbox, { recursive: true, force: true });
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(
      [`Command failed: ${command} ${args.join(' ')}`, result.stdout, result.stderr]
        .filter(Boolean)
        .join('\n'),
    );
  }
  return result.stdout;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function listFiles(root) {
  const files = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) files.push(...listFiles(path));
    else files.push(path);
  }
  return files;
}
