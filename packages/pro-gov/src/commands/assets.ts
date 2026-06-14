import { listAssets } from '../assets';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { loadAgentAssetBundles } from '../asset-bundles/bundles';
import { createNpxSkillsMaintenancePlan } from '../asset-npx/maintenance';
import { loadAgentAssetRegistry } from '../asset-registry/loader';
import { applyAssetInstallPlan } from '../asset-targets/apply';
import { checkInstalledAssets } from '../asset-targets/check';
import { createAssetInstallPlan } from '../asset-targets/install-plan';
import type { AssetInstallPlan } from '../asset-targets/install-plan';
import { discoverTargetSignals, recommendBundlesForTarget } from '../asset-targets/recommend';
import type {
  AgentAssetRegistryEntry,
  AssetRegistryHost,
  AssetRegistryVisibility,
} from '../asset-registry/registry';

type VisibilityFilter = AssetRegistryVisibility | 'all';

export function runAssets(args: string[]): number {
  const [subcommand, ...rest] = args;
  if (subcommand === 'list') {
    return runAssetsList(rest);
  }
  if (subcommand === 'recommend') {
    return runAssetsRecommend(rest);
  }
  if (subcommand === 'discover') {
    return runAssetsDiscover(rest);
  }
  if (subcommand === 'plan') {
    return runAssetsPlan(rest);
  }
  if (subcommand === 'apply') {
    return runAssetsApply(rest);
  }
  if (subcommand === 'check') {
    return runAssetsCheck(rest);
  }
  if (subcommand === 'npx') {
    return runAssetsNpx(rest);
  }

  printUsage();
  return 1;
}

function runAssetsNpx(args: string[]): number {
  const [operation, ...rest] = args;
  if (!operation || operation === '--help' || operation === '-h' || rest.includes('--help')) {
    printNpxUsage();
    return 0;
  }
  if (operation !== 'add' && operation !== 'update') {
    printNpxUsage();
    return 1;
  }

  const options = parseNpxOptions(operation, rest);
  if (!options.ok) {
    console.error(options.error);
    printNpxUsage();
    return 1;
  }

  try {
    const loaded = loadAgentAssetRegistry();
    const plan = createNpxSkillsMaintenancePlan({
      operation,
      npxRoot: options.value.npxRoot ?? `${loaded.agentAssetsDir}/skills/npx-skills`,
      source: options.value.source,
      skill: options.value.skill,
    });
    console.log(JSON.stringify(plan, null, 2));
    return 0;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return 1;
  }
}

function runAssetsApply(args: string[]): number {
  const options = parseApplyOptions(args);
  if (!options.ok) {
    console.error(options.error);
    printUsage();
    return 1;
  }

  try {
    const plan = JSON.parse(readFileSync(options.value.planPath, 'utf8')) as AssetInstallPlan;
    const result = applyAssetInstallPlan(plan);
    console.log(`applied-actions: ${result.appliedActions.length}`);
    return 0;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return 1;
  }
}

function runAssetsCheck(args: string[]): number {
  const options = parseTargetJsonOptions(args);
  if (!options.ok) {
    console.error(options.error);
    printUsage();
    return 1;
  }

  const loaded = loadAgentAssetRegistry();
  const result = checkInstalledAssets({
    targetDir: options.value.targetDir,
    agentAssetsDir: loaded.agentAssetsDir,
    registry: loaded.registry,
  });

  if (options.value.json) {
    console.log(JSON.stringify(result, null, 2));
  } else if (result.issues.length === 0) {
    console.log('assets check passed');
  } else {
    for (const issue of result.issues) {
      console.log(`${issue.type}: ${issue.message}`);
    }
  }

  return result.issues.length === 0 ? 0 : 1;
}

function runAssetsList(args: string[]): number {
  const options = parseListOptions(args);
  if (!options.ok) {
    console.error(options.error);
    printUsage();
    return 1;
  }

  if (options.value.registryMode) {
    return listRegistryAssets(options.value);
  }

  for (const asset of listAssets()) {
    console.log(asset.path);
  }
  return 0;
}

function runAssetsRecommend(args: string[]): number {
  const options = parseTargetJsonOptions(args);
  if (!options.ok) {
    console.error(options.error);
    printUsage();
    return 1;
  }

  const recommendations = recommendBundlesForTarget(options.value.targetDir);
  if (options.value.json) {
    console.log(JSON.stringify({ targetDir: options.value.targetDir, recommendations }, null, 2));
  } else {
    for (const recommendation of recommendations) {
      console.log(
        `${recommendation.bundleId}\t${recommendation.confidence}\t${recommendation.reasons.join('; ')}`,
      );
    }
  }
  return 0;
}

function runAssetsDiscover(args: string[]): number {
  const options = parseTargetJsonOptions(args);
  if (!options.ok) {
    console.error(options.error);
    printUsage();
    return 1;
  }

  const signals = discoverTargetSignals(options.value.targetDir);
  if (options.value.json) {
    console.log(JSON.stringify(signals, null, 2));
  } else {
    console.log(`target: ${signals.targetDir}`);
    console.log(`package-json: ${signals.hasPackageJson ? 'yes' : 'no'}`);
    console.log(`agent-entry: ${signals.hasAgentEntry ? 'yes' : 'no'}`);
    console.log(`frontend: ${signals.frontendSignals.join(', ') || 'none'}`);
    console.log(`research: ${signals.researchSignals.join(', ') || 'none'}`);
    console.log(`writing: ${signals.writingSignals.join(', ') || 'none'}`);
  }
  return 0;
}

function runAssetsPlan(args: string[]): number {
  const options = parsePlanOptions(args);
  if (!options.ok) {
    console.error(options.error);
    printUsage();
    return 1;
  }

  const loaded = loadAgentAssetRegistry();
  if (loaded.issues.length > 0) {
    for (const issue of loaded.issues) {
      console.error(`${issue.type}: ${issue.message}`);
    }
    return 1;
  }

  try {
    const plan = createAssetInstallPlan({
      targetDir: options.value.targetDir,
      agentAssetsDir: loaded.agentAssetsDir,
      registry: loaded.registry,
      bundles: loadAgentAssetBundles(loaded.agentAssetsDir),
      bundleIds: options.value.bundleIds,
      host: options.value.host,
    });

    if (options.value.json) {
      console.log(JSON.stringify(plan, null, 2));
    } else {
      console.log(`target: ${plan.targetDir}`);
      console.log(`host: ${plan.host}`);
      console.log(`bundles: ${plan.bundleIds.join(', ')}`);
      console.log(`assets: ${plan.assetIds.length}`);
      console.log(`actions: ${plan.actions.length}`);
      console.log('dry-run: true');
    }
    if (options.value.outPath) {
      mkdirSync(dirname(options.value.outPath), { recursive: true });
      writeFileSync(options.value.outPath, `${JSON.stringify(plan, null, 2)}\n`);
      if (!options.value.json) {
        console.log(`plan: ${options.value.outPath}`);
      }
    }
    return 0;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return 1;
  }
}

interface AssetListOptions {
  json: boolean;
  registryMode: boolean;
  visibility: VisibilityFilter;
}

type ParseResult =
  | { ok: true; value: AssetListOptions }
  | { ok: false; error: string };

interface TargetJsonOptions {
  targetDir: string;
  json: boolean;
}

interface PlanOptions extends TargetJsonOptions {
  bundleIds: string[];
  host: AssetRegistryHost;
  outPath?: string;
}

interface ApplyOptions {
  planPath: string;
}

type TargetJsonParseResult =
  | { ok: true; value: TargetJsonOptions }
  | { ok: false; error: string };

type PlanParseResult =
  | { ok: true; value: PlanOptions }
  | { ok: false; error: string };

type ApplyParseResult =
  | { ok: true; value: ApplyOptions }
  | { ok: false; error: string };

interface NpxOptions {
  npxRoot?: string;
  source?: string;
  skill?: string;
}

type NpxParseResult =
  | { ok: true; value: NpxOptions }
  | { ok: false; error: string };

function parseListOptions(args: string[]): ParseResult {
  const options: AssetListOptions = {
    json: false,
    registryMode: false,
    visibility: 'all',
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--json') {
      options.json = true;
      options.registryMode = true;
    } else if (arg === '--visibility') {
      const visibility = args[index + 1];
      if (!isVisibilityFilter(visibility)) {
        return { ok: false, error: 'Expected --visibility public|private|third-party|all' };
      }
      options.visibility = visibility;
      options.registryMode = true;
      index += 1;
    } else if (arg === '--registry') {
      options.registryMode = true;
    } else {
      return { ok: false, error: `Unknown assets list option: ${arg}` };
    }
  }

  return { ok: true, value: options };
}

function parseTargetJsonOptions(args: string[]): TargetJsonParseResult {
  const options: TargetJsonOptions = {
    targetDir: process.cwd(),
    json: false,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--target') {
      const targetDir = args[index + 1];
      if (!targetDir) return { ok: false, error: 'Expected --target <path>' };
      options.targetDir = targetDir;
      index += 1;
    } else if (arg === '--json') {
      options.json = true;
    } else {
      return { ok: false, error: `Unknown assets target option: ${arg}` };
    }
  }

  return { ok: true, value: options };
}

function parsePlanOptions(args: string[]): PlanParseResult {
  const options: PlanOptions = {
    targetDir: process.cwd(),
    json: false,
    bundleIds: [],
    host: 'codex',
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--target') {
      const targetDir = args[index + 1];
      if (!targetDir) return { ok: false, error: 'Expected --target <path>' };
      options.targetDir = targetDir;
      index += 1;
    } else if (arg === '--bundle') {
      const bundleId = args[index + 1];
      if (!bundleId) return { ok: false, error: 'Expected --bundle <bundle-id>' };
      options.bundleIds.push(bundleId);
      index += 1;
    } else if (arg === '--host') {
      const host = args[index + 1];
      if (!isHost(host)) {
        return {
          ok: false,
          error: 'Expected --host codex|claude-code|gemini-cli|antigravity',
        };
      }
      options.host = host;
      index += 1;
    } else if (arg === '--out') {
      const outPath = args[index + 1];
      if (!outPath) return { ok: false, error: 'Expected --out <path>' };
      options.outPath = outPath;
      index += 1;
    } else if (arg === '--json') {
      options.json = true;
    } else {
      return { ok: false, error: `Unknown assets plan option: ${arg}` };
    }
  }

  if (options.bundleIds.length === 0) {
    return { ok: false, error: 'Expected at least one --bundle <bundle-id>' };
  }

  return { ok: true, value: options };
}

function parseApplyOptions(args: string[]): ApplyParseResult {
  let planPath = '';

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--plan') {
      const value = args[index + 1];
      if (!value) return { ok: false, error: 'Expected --plan <path>' };
      planPath = value;
      index += 1;
    } else {
      return { ok: false, error: `Unknown assets apply option: ${arg}` };
    }
  }

  if (!planPath) return { ok: false, error: 'Expected --plan <path>' };
  return { ok: true, value: { planPath } };
}

function parseNpxOptions(operation: 'add' | 'update', args: string[]): NpxParseResult {
  const options: NpxOptions = {};
  const positional: string[] = [];
  let hasPlan = false;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--plan') {
      hasPlan = true;
    } else if (arg === '--root') {
      const npxRoot = args[index + 1];
      if (!npxRoot) return { ok: false, error: 'Expected --root <path>' };
      options.npxRoot = npxRoot;
      index += 1;
    } else if (arg === '--skill') {
      const skill = args[index + 1];
      if (!skill) return { ok: false, error: 'Expected --skill <name>' };
      options.skill = skill;
      index += 1;
    } else if (arg.startsWith('-')) {
      return { ok: false, error: `Unknown assets npx option: ${arg}` };
    } else {
      positional.push(arg);
    }
  }

  if (!hasPlan) return { ok: false, error: 'Expected --plan. Direct npx writes are not supported.' };
  if (operation === 'add') {
    const [source] = positional;
    if (!source) return { ok: false, error: 'Expected pro-gov assets npx add <source> --plan' };
    options.source = source;
  } else if (positional.length > 0) {
    return { ok: false, error: `Unexpected assets npx update argument: ${positional[0]}` };
  }

  return { ok: true, value: options };
}

function listRegistryAssets(options: AssetListOptions): number {
  const loaded = loadAgentAssetRegistry();
  if (loaded.issues.length > 0) {
    for (const issue of loaded.issues) {
      console.error(`${issue.type}: ${issue.message}`);
    }
    return 1;
  }

  const assets = filterAssetsByVisibility(loaded.registry.assets, options.visibility);

  if (options.json) {
    console.log(
      JSON.stringify(
        {
          count: assets.length,
          registryPath: loaded.registryPath,
          assets,
        },
        null,
        2,
      ),
    );
  } else {
    for (const asset of assets) {
      console.log(asset.id);
    }
  }

  return 0;
}

function filterAssetsByVisibility(
  assets: readonly AgentAssetRegistryEntry[],
  visibility: VisibilityFilter,
): AgentAssetRegistryEntry[] {
  if (visibility === 'all') return [...assets];
  return assets.filter((asset) => asset.visibility === visibility);
}

function isVisibilityFilter(value: string | undefined): value is VisibilityFilter {
  return value === 'public' || value === 'private' || value === 'third-party' || value === 'all';
}

function isHost(value: string | undefined): value is AssetRegistryHost {
  return (
    value === 'codex' ||
    value === 'claude-code' ||
    value === 'gemini-cli' ||
    value === 'antigravity'
  );
}

function printUsage(): void {
  console.error('Usage:');
  console.error('  pro-gov assets list [--registry] [--json] [--visibility public|private|third-party|all]');
  console.error('  pro-gov assets discover [--target <path>] [--json]');
  console.error('  pro-gov assets recommend [--target <path>] [--json]');
  console.error('  pro-gov assets plan --bundle <bundle-id> [--bundle <bundle-id>] [--target <path>] [--host codex|claude-code|gemini-cli|antigravity] [--out <path>] [--json]');
  console.error('  pro-gov assets apply --plan <path>');
  console.error('  pro-gov assets check [--target <path>] [--json]');
  console.error('  pro-gov assets npx add <source> [--skill <name>] --plan [--root <path>]');
  console.error('  pro-gov assets npx update [--skill <name>] --plan [--root <path>]');
}

function printNpxUsage(): void {
  console.log('Usage: pro-gov assets npx add <source> [--skill <name>] --plan [--root <path>]');
  console.log('Usage: pro-gov assets npx update [--skill <name>] --plan [--root <path>]');
  console.log('');
  console.log('Runs npx skills only in a temporary copy and prints a reviewable plan.');
}
