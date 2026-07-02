import { spawnSync } from 'node:child_process';

import type { PortfolioHostTooling } from '../portfolio/manifest';

export type HostToolingIssueType =
  | 'host-tooling-command-failed'
  | 'host-tooling-missing'
  | 'host-tooling-disabled';

export interface HostToolingIssue {
  type: HostToolingIssueType;
  host: PortfolioHostTooling['host'];
  pluginId?: string;
  message: string;
}

export interface HostPluginState {
  id: string;
  version?: string;
  enabled: boolean;
}

export interface HostToolingState {
  host: PortfolioHostTooling['host'];
  plugins: HostPluginState[];
}

export interface HostToolingInventoryResult {
  hosts: HostToolingState[];
  issues: HostToolingIssue[];
}

export interface HostToolingCommandInput {
  host: PortfolioHostTooling['host'];
  command: string[];
}

export type HostToolingCommandRunner = (input: HostToolingCommandInput) => {
  status: number | null;
  stdout: string;
  stderr: string;
};

export function inspectHostTooling(
  requirements: readonly PortfolioHostTooling[],
  runner: HostToolingCommandRunner = defaultRunner,
): HostToolingInventoryResult {
  const hosts: HostToolingState[] = [];
  const issues: HostToolingIssue[] = [];

  for (const requirement of requirements) {
    const command = requirement.host === 'codex'
      ? ['codex', 'plugin', 'list', '--json']
      : ['claude', 'plugin', 'list', '--json'];
    const result = runner({ host: requirement.host, command });
    if (result.status !== 0) {
      issues.push({
        type: 'host-tooling-command-failed',
        host: requirement.host,
        message: `Unable to inspect ${requirement.host} plugins: ${result.stderr || `exit ${result.status}`}`,
      });
      hosts.push({ host: requirement.host, plugins: [] });
      continue;
    }

    let plugins: HostPluginState[];
    try {
      plugins = parseHostPlugins(requirement.host, JSON.parse(result.stdout) as unknown);
    } catch (error) {
      issues.push({
        type: 'host-tooling-command-failed',
        host: requirement.host,
        message: `Unable to parse ${requirement.host} plugin inventory: ${error instanceof Error ? error.message : String(error)}`,
      });
      hosts.push({ host: requirement.host, plugins: [] });
      continue;
    }

    const byId = new Map(plugins.map((plugin) => [plugin.id, plugin]));
    hosts.push({
      host: requirement.host,
      plugins: requirement.plugins.flatMap((pluginId) => {
        const plugin = byId.get(pluginId);
        return plugin ? [plugin] : [];
      }),
    });
    for (const pluginId of requirement.plugins) {
      const plugin = byId.get(pluginId);
      if (!plugin) {
        issues.push({
          type: 'host-tooling-missing',
          host: requirement.host,
          pluginId,
          message: `Required ${requirement.host} plugin is missing: ${pluginId}`,
        });
      } else if (!plugin.enabled) {
        issues.push({
          type: 'host-tooling-disabled',
          host: requirement.host,
          pluginId,
          message: `Required ${requirement.host} plugin is disabled: ${pluginId}`,
        });
      }
    }
  }

  return { hosts, issues };
}

function parseHostPlugins(
  host: PortfolioHostTooling['host'],
  value: unknown,
): HostPluginState[] {
  const entries = host === 'codex'
    ? isRecord(value) && Array.isArray(value.installed) ? value.installed : undefined
    : Array.isArray(value) ? value : undefined;
  if (!entries) throw new Error('expected a plugin array');

  return entries.flatMap((entry) => {
    if (!isRecord(entry)) return [];
    const id = host === 'codex' ? entry.pluginId : entry.id;
    if (typeof id !== 'string') return [];
    return [{
      id,
      version: typeof entry.version === 'string' ? entry.version : undefined,
      enabled: entry.enabled === true,
    }];
  });
}

function defaultRunner({ command }: HostToolingCommandInput): {
  status: number | null;
  stdout: string;
  stderr: string;
} {
  const result = spawnSync(command[0] ?? '', command.slice(1), {
    encoding: 'utf8',
    timeout: 10_000,
  });
  return {
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr || result.error?.message || '',
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
