import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { AgentAssetBundle } from '../asset-bundles/bundles';
import type { AgentAssetRegistry } from '../asset-registry/registry';
import { checkInstalledAssets } from '../asset-targets/check';
import { createAssetInstallPlan } from '../asset-targets/install-plan';
import { inspectHostTooling } from '../host-tooling/inventory';
import type { HostToolingInventoryResult } from '../host-tooling/inventory';
import { comparePortfolioAssetState } from './asset-state';
import type { PortfolioManifest, PortfolioTarget } from './manifest';
import type { AssetRegistryHost } from '../asset-registry/registry';

export interface PortfolioDoctorIssue {
  type: string;
  message: string;
  packageName?: string;
  targetPath?: string;
  check?: string;
}

export interface PortfolioDoctorTargetResult {
  id: string;
  path: string;
  profile?: string;
  packages: Record<string, { declared?: string; installed?: string; expected?: string }>;
  git: { isRepository: boolean; dirty: boolean; branch?: string };
  checks: Array<{ name: string; status: number | null }>;
  issues: PortfolioDoctorIssue[];
}

export interface PortfolioDoctorResult {
  ok: boolean;
  portfolioId: string;
  expectedPackageVersions: Record<string, string | undefined>;
  hostTooling: HostToolingInventoryResult;
  targets: PortfolioDoctorTargetResult[];
}

export function inspectPortfolio(options: {
  manifest: PortfolioManifest;
  targets: readonly PortfolioTarget[];
  agentAssetsDir: string;
  registry: AgentAssetRegistry;
  bundles: readonly AgentAssetBundle[];
}): PortfolioDoctorResult {
  const expectedPackageVersions = getExpectedPackageVersions();
  const hostTooling = inspectHostTooling(options.manifest.hostTooling ?? []);
  const targets = options.targets.map((target) => inspectTarget({
    target,
    agentAssetsDir: options.agentAssetsDir,
    registry: options.registry,
    bundles: options.bundles,
    expectedPackageVersions,
  }));
  return {
    ok: hostTooling.issues.length === 0 && targets.every((target) => target.issues.length === 0),
    portfolioId: options.manifest.portfolioId,
    expectedPackageVersions,
    hostTooling,
    targets,
  };
}

function inspectTarget(options: {
  target: PortfolioTarget;
  agentAssetsDir: string;
  registry: AgentAssetRegistry;
  bundles: readonly AgentAssetBundle[];
  expectedPackageVersions: Record<string, string | undefined>;
}): PortfolioDoctorTargetResult {
  const { target } = options;
  const issues: PortfolioDoctorIssue[] = [];
  const packageJson = readJson(join(target.path, 'package.json')) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  } | undefined;
  const packages: PortfolioDoctorTargetResult['packages'] = {};

  for (const packageName of ['@pieai/pro-gov', '@pieai/doc-gov']) {
    const declared = packageJson?.devDependencies?.[packageName] ?? packageJson?.dependencies?.[packageName];
    const installedPackage = readJson(join(target.path, 'node_modules', packageName, 'package.json')) as {
      version?: string;
    } | undefined;
    const installed = installedPackage?.version;
    const expected = options.expectedPackageVersions[packageName];
    packages[packageName] = { declared, installed, expected };
    if (!declared) {
      issues.push({
        type: 'package-declaration-missing',
        packageName,
        message: `Target does not declare ${packageName}.`,
      });
    }
    if (!installed || (expected && installed !== expected)) {
      issues.push({
        type: 'package-version-drift',
        packageName,
        message: `Target ${packageName} installed version is ${installed ?? 'missing'}; expected ${expected ?? 'unknown'}.`,
      });
    }
  }

  const checks = runTargetChecks(target);
  for (const check of checks) {
    if (check.status === 0) continue;
    issues.push({
      type: 'target-check-failed',
      check: check.name,
      message: `Target check failed: ${check.name} (${check.status ?? 'unavailable'}).`,
    });
  }

  const assetCheck = checkInstalledAssets({
    targetDir: target.path,
    agentAssetsDir: options.agentAssetsDir,
    registry: options.registry,
    strictRegistry: true,
  });
  issues.push(...assetCheck.issues.map((issue) => ({
    type: issue.type,
    targetPath: issue.targetPath,
    message: issue.message,
  })));

  try {
    const expectedPlan = createAssetInstallPlan({
      targetDir: target.path,
      agentAssetsDir: options.agentAssetsDir,
      registry: options.registry,
      bundles: options.bundles,
      bundleIds: target.assetBundles ?? [],
      host: readTargetAssetHost(target.path) ?? 'codex',
    });
    issues.push(...comparePortfolioAssetState({ targetDir: target.path, expectedPlan }).issues);
  } catch (error) {
    issues.push({
      type: 'asset-lock-drift',
      message: error instanceof Error ? error.message : String(error),
    });
    if (!existsSync(join(target.path, '.pro-gov/assets.json'))) {
      issues.push({ type: 'bundle-drift', message: 'Target asset manifest is missing.' });
    }
  }

  return {
    id: target.id,
    path: target.path,
    profile: target.profile,
    packages,
    git: inspectGit(target.path),
    checks,
    issues: deduplicateIssues(issues),
  };
}

function readTargetAssetHost(targetDir: string): AssetRegistryHost | undefined {
  const lockfile = readJson(join(targetDir, '.pro-gov/assets.lock.json')) as { host?: unknown } | undefined;
  return isAssetRegistryHost(lockfile?.host) ? lockfile.host : undefined;
}

function isAssetRegistryHost(value: unknown): value is AssetRegistryHost {
  return value === 'codex' || value === 'claude-code' || value === 'gemini-cli' || value === 'antigravity';
}

function runTargetChecks(target: PortfolioTarget): Array<{ name: string; status: number | null }> {
  const proGovCli = join(target.path, 'node_modules/@pieai/pro-gov/dist/cli.js');
  const docGovCli = join(target.path, 'node_modules/@pieai/doc-gov/dist/cli.js');
  const commands = [
    {
      name: 'pro-gov doctor',
      cli: proGovCli,
      args: target.profile === 'engineering-runtime' ? ['doctor', '--strict-hooks'] : ['doctor'],
    },
    { name: 'doc-gov router-check', cli: docGovCli, args: ['router-check'] },
    { name: 'doc-gov scan --check', cli: docGovCli, args: ['scan', '--check'] },
  ];
  return commands.map((command) => {
    if (!existsSync(command.cli)) return { name: command.name, status: null };
    const result = spawnSync(process.execPath, [command.cli, ...command.args], {
      cwd: target.path,
      encoding: 'utf8',
      timeout: 30_000,
    });
    return { name: command.name, status: result.status };
  });
}

function inspectGit(path: string): PortfolioDoctorTargetResult['git'] {
  const inside = spawnSync('git', ['rev-parse', '--is-inside-work-tree'], {
    cwd: path,
    encoding: 'utf8',
  });
  if (inside.status !== 0) return { isRepository: false, dirty: false };
  const status = spawnSync('git', ['status', '--porcelain'], { cwd: path, encoding: 'utf8' });
  const branch = spawnSync('git', ['branch', '--show-current'], { cwd: path, encoding: 'utf8' });
  return {
    isRepository: true,
    dirty: status.stdout.trim().length > 0,
    branch: branch.stdout.trim() || undefined,
  };
}

function getExpectedPackageVersions(): Record<string, string | undefined> {
  const proGovPackage = readJson(findOwnPackageJson()) as { version?: string } | undefined;
  let docGovVersion: string | undefined;
  try {
    const require = createRequire(import.meta.url);
    const docGovPackage = readJson(require.resolve('@pieai/doc-gov/package.json')) as { version?: string } | undefined;
    docGovVersion = docGovPackage?.version;
  } catch {
    docGovVersion = undefined;
  }
  return {
    '@pieai/pro-gov': proGovPackage?.version,
    '@pieai/doc-gov': docGovVersion,
  };
}

function findOwnPackageJson(): string {
  let current = dirname(fileURLToPath(import.meta.url));
  for (let depth = 0; depth < 5; depth += 1) {
    const candidate = join(current, 'package.json');
    if (existsSync(candidate)) return candidate;
    current = dirname(current);
  }
  return '';
}

function readJson(path: string): unknown {
  if (!path || !existsSync(path)) return undefined;
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as unknown;
  } catch {
    return undefined;
  }
}

function deduplicateIssues(issues: readonly PortfolioDoctorIssue[]): PortfolioDoctorIssue[] {
  const seen = new Set<string>();
  return issues.filter((issue) => {
    const key = `${issue.type}\0${issue.packageName ?? ''}\0${issue.targetPath ?? ''}\0${issue.check ?? ''}\0${issue.message}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
