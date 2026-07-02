import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

import { listAssets } from '../assets';

const REQUIRED_ASSETS = [
  'starter/AGENTS.template.md',
  'starter/docs/governance/ssot-v0.9.md',
  'starter/docs/governance/agents-routing/engineering-runtime-v0.9.md',
  'starter/docs/governance/agents-routing/doc-only-v0.9.md',
  'profiles/engineering-runtime/profile.md',
  'profiles/doc-only/profile.md',
] as const;

export function runDoctor(_args: string[]): number {
  const strictHooks = _args.includes('--strict-hooks');
  const assets = listAssets();
  const assetPaths = new Set(assets.map((asset) => asset.path));
  const missing = REQUIRED_ASSETS.filter((assetPath) => !assetPaths.has(assetPath));
  const hookIssues = strictHooks ? checkStrictHostHooks(process.cwd()) : [];

  console.log('pro-gov doctor');
  console.log(`assets: ${assets.length}`);

  if (missing.length > 0) {
    for (const assetPath of missing) {
      console.error(`missing packaged asset: ${assetPath}`);
    }
  } else {
    console.log('assets: required project-governance assets found');
  }

  console.log(checkDocGov());
  for (const issue of hookIssues) {
    console.error(issue);
  }
  if (strictHooks && hookIssues.length === 0) {
    console.log('host-hooks: PGS Compound Gate hooks wired');
  }

  return missing.length > 0 || hookIssues.length > 0 ? 1 : 0;
}

function checkDocGov(): string {
  const fromPath = spawnSync('doc-gov', ['--help'], {
    encoding: 'utf8',
    stdio: 'ignore',
  });

  if (!fromPath.error && fromPath.status === 0) {
    return 'doc-gov: available on PATH';
  }

  const dependencyCli = resolveDocGovDependencyCli();
  if (!dependencyCli) {
    return 'doc-gov: not found; install @pieai/doc-gov beside @pieai/pro-gov for validation.';
  }

  const fromDependency = spawnSync(process.execPath, [dependencyCli, '--help'], {
    encoding: 'utf8',
    stdio: 'ignore',
  });

  if (!fromDependency.error && fromDependency.status === 0) {
    return 'doc-gov: available via package dependency';
  }

  return `doc-gov: dependency found but returned status ${fromDependency.status ?? 'unknown'}`;
}

function resolveDocGovDependencyCli(): string | null {
  try {
    const require = createRequire(import.meta.url);
    const packageJsonPath = require.resolve('@pieai/doc-gov/package.json');
    const cliPath = join(dirname(packageJsonPath), 'dist/cli.js');
    return existsSync(cliPath) ? cliPath : null;
  } catch {
    return null;
  }
}

function checkStrictHostHooks(root: string): string[] {
  if (!isEngineeringRuntimeProject(root)) {
    return [];
  }

  const expected = [
    { path: '.codex/hooks.json', host: 'codex' },
    { path: '.claude/settings.json', host: 'claude-code' },
    { path: '.agents/hooks.json', host: 'antigravity' },
  ] as const;
  const issues: string[] = [];

  for (const entry of expected) {
    const absolutePath = join(root, entry.path);
    if (!existsSync(absolutePath)) {
      issues.push(`host-hooks: missing ${entry.path}`);
      continue;
    }

    const content = readFileSync(absolutePath, 'utf8');
    if (!content.includes('pro-gov host-hook') || !content.includes(`--host ${entry.host}`)) {
      issues.push(`host-hooks: ${entry.path} does not call pro-gov host-hook for ${entry.host}`);
    }
    if (entry.host === 'antigravity' && !content.includes('PGS_HOST_HOOK_DEBUG=1')) {
      issues.push(`host-hooks: ${entry.path} does not enable PGS_HOST_HOOK_DEBUG=1 for Antigravity diagnostics`);
    }
  }

  return issues;
}

function isEngineeringRuntimeProject(root: string): boolean {
  return existsSync(join(root, 'docs/governance/agents-routing/engineering-runtime-v0.9.md'));
}
