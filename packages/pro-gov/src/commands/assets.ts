import { listAssets } from '../assets';
import { loadAgentAssetBundles } from '../asset-bundles/bundles';
import { loadAgentAssetRegistry } from '../asset-registry/loader';
import { createAssetInstallPlan } from '../asset-targets/install-plan';
import { recommendBundlesForTarget } from '../asset-targets/recommend';
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
  if (subcommand === 'plan') {
    return runAssetsPlan(rest);
  }

  printUsage();
  return 1;
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
}

type TargetJsonParseResult =
  | { ok: true; value: TargetJsonOptions }
  | { ok: false; error: string };

type PlanParseResult =
  | { ok: true; value: PlanOptions }
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
      return { ok: false, error: `Unknown assets recommend option: ${arg}` };
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
      if (!isHost(host)) return { ok: false, error: 'Expected --host codex' };
      options.host = host;
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
  return value === 'codex';
}

function printUsage(): void {
  console.error('Usage:');
  console.error('  pro-gov assets list [--registry] [--json] [--visibility public|private|third-party|all]');
  console.error('  pro-gov assets recommend [--target <path>] [--json]');
  console.error('  pro-gov assets plan --bundle <bundle-id> [--bundle <bundle-id>] [--target <path>] [--host codex] [--json]');
}
