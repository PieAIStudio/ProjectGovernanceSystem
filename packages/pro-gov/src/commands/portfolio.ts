import { loadAgentAssetBundles } from '../asset-bundles/bundles';
import { loadAgentAssetRegistry } from '../asset-registry/loader';
import { createAssetInstallPlan } from '../asset-targets/install-plan';
import { getDefaultPortfolioTargets, loadPortfolioManifest } from '../portfolio/manifest';
import type { AssetRegistryHost } from '../asset-registry/registry';

export function runPortfolio(args: string[]): number {
  const [subcommand, ...rest] = args;
  if (subcommand === 'check') return runPortfolioCheck(rest);
  if (subcommand === 'plan') return runPortfolioPlan(rest);
  printUsage();
  return 1;
}

function runPortfolioCheck(args: string[]): number {
  const options = parsePortfolioOptions(args);
  if (!options.ok) {
    console.error(options.error);
    printUsage();
    return 1;
  }

  const loaded = loadPortfolioManifest(options.value.configPath);
  const targetIds = getDefaultPortfolioTargets(loaded.manifest).map((target) => target.id);
  if (options.value.json) {
    console.log(
      JSON.stringify(
        {
          ok: loaded.issues.length === 0,
          configPath: loaded.configPath,
          portfolioId: loaded.manifest?.portfolioId,
          targetIds,
          issues: loaded.issues,
        },
        null,
        2,
      ),
    );
  } else if (loaded.issues.length === 0) {
    console.log(`portfolio check passed (${targetIds.length} targets)`);
  } else {
    for (const issue of loaded.issues) {
      console.log(`${issue.type}: ${issue.message}`);
    }
  }

  return loaded.issues.length === 0 ? 0 : 1;
}

function runPortfolioPlan(args: string[]): number {
  const options = parsePortfolioOptions(args);
  if (!options.ok) {
    console.error(options.error);
    printUsage();
    return 1;
  }

  const loaded = loadPortfolioManifest(options.value.configPath);
  if (loaded.issues.length > 0 || !loaded.manifest) {
    for (const issue of loaded.issues) {
      console.error(`${issue.type}: ${issue.message}`);
    }
    return 1;
  }

  const targets = getDefaultPortfolioTargets(loaded.manifest).filter(
    (target) => !options.value.targetId || options.value.targetId === 'all' || target.id === options.value.targetId,
  );
  if (targets.length === 0) {
    console.error(`Unknown portfolio target: ${options.value.targetId}`);
    return 1;
  }

  const loadedAssets = loadAgentAssetRegistry();
  if (loadedAssets.issues.length > 0) {
    for (const issue of loadedAssets.issues) {
      console.error(`${issue.type}: ${issue.message}`);
    }
    return 1;
  }
  const bundles = loadAgentAssetBundles(loadedAssets.agentAssetsDir);

  try {
    const plans = targets.map((target) => {
      const bundleIds = target.assetBundles ?? [];
      if (bundleIds.length === 0) {
        throw new Error(`Portfolio target ${target.id} has no assetBundles`);
      }
      return {
        id: target.id,
        path: target.path,
        plan: createAssetInstallPlan({
          targetDir: target.path,
          agentAssetsDir: loadedAssets.agentAssetsDir,
          registry: loadedAssets.registry,
          bundles,
          bundleIds,
          host: options.value.host,
        }),
      };
    });

    if (options.value.json) {
      console.log(
        JSON.stringify(
          {
            configPath: loaded.configPath,
            portfolioId: loaded.manifest.portfolioId,
            targets: plans,
          },
          null,
          2,
        ),
      );
    } else {
      console.log(`portfolio plan targets: ${plans.length}`);
      for (const target of plans) {
        console.log(`${target.id}\t${target.plan.actions.length} actions\tdry-run`);
      }
    }
    return 0;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return 1;
  }
}

interface PortfolioOptions {
  configPath: string;
  targetId?: string;
  host: AssetRegistryHost;
  json: boolean;
}

type PortfolioParseResult =
  | { ok: true; value: PortfolioOptions }
  | { ok: false; error: string };

function parsePortfolioOptions(args: string[]): PortfolioParseResult {
  const options: PortfolioOptions = {
    configPath: '',
    host: 'codex',
    json: false,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--config') {
      const configPath = args[index + 1];
      if (!configPath) return { ok: false, error: 'Expected --config <path>' };
      options.configPath = configPath;
      index += 1;
    } else if (arg === '--target') {
      const targetId = args[index + 1];
      if (!targetId) return { ok: false, error: 'Expected --target <id|all>' };
      options.targetId = targetId;
      index += 1;
    } else if (arg === '--host') {
      const host = args[index + 1];
      if (!isHost(host)) return { ok: false, error: 'Expected --host codex|claude-code' };
      options.host = host;
      index += 1;
    } else if (arg === '--json') {
      options.json = true;
    } else {
      return { ok: false, error: `Unknown portfolio option: ${arg}` };
    }
  }

  if (!options.configPath) return { ok: false, error: 'Expected --config <path>' };
  return { ok: true, value: options };
}

function isHost(value: string | undefined): value is AssetRegistryHost {
  return value === 'codex' || value === 'claude-code' || value === 'gemini-cli' || value === 'antigravity';
}

function printUsage(): void {
  console.error('Usage:');
  console.error('  pro-gov portfolio check --config <path> [--json]');
  console.error('  pro-gov portfolio plan --config <path> [--target <id|all>] [--host codex|claude-code|gemini-cli|antigravity] [--json]');
}
