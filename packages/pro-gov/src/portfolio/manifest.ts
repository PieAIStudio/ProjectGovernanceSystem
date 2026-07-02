import { existsSync, readFileSync } from 'node:fs';
import { dirname, isAbsolute, resolve } from 'node:path';

import { isValidProfile } from '../assets';

export interface PortfolioManifest {
  schemaVersion: 1;
  portfolioId: string;
  controlPlane?: PortfolioEndpoint;
  executionEngine?: PortfolioEndpoint;
  hostTooling?: PortfolioHostTooling[];
  targets: PortfolioTarget[];
}

export interface PortfolioHostTooling {
  host: 'codex' | 'claude-code';
  plugins: string[];
}

export interface PortfolioEndpoint {
  id: string;
  path: string;
}

export interface PortfolioTarget extends PortfolioEndpoint {
  profile?: 'engineering-runtime' | 'doc-only';
  assetBundles?: string[];
}

export type PortfolioManifestIssueType =
  | 'invalid-json'
  | 'invalid-field'
  | 'duplicate-target-id'
  | 'missing-path';

export interface PortfolioManifestIssue {
  type: PortfolioManifestIssueType;
  id?: string;
  field?: string;
  message: string;
}

export interface LoadedPortfolioManifest {
  configPath: string;
  manifest?: PortfolioManifest;
  issues: PortfolioManifestIssue[];
}

export function loadPortfolioManifest(configPath: string): LoadedPortfolioManifest {
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(configPath, 'utf8'));
  } catch (error) {
    return {
      configPath,
      issues: [
        {
          type: 'invalid-json',
          message: error instanceof Error ? error.message : String(error),
        },
      ],
    };
  }

  const normalized = resolveManifestPaths(parsed, dirname(resolve(configPath)));
  const issues = validatePortfolioManifest(normalized);
  return {
    configPath,
    manifest: issues.length === 0 ? (normalized as PortfolioManifest) : undefined,
    issues,
  };
}

function resolveManifestPaths(value: unknown, configDir: string): unknown {
  if (!isRecord(value)) return value;

  const resolveEndpoint = (endpoint: unknown): unknown => {
    if (!isRecord(endpoint) || typeof endpoint.path !== 'string' || isAbsolute(endpoint.path)) {
      return endpoint;
    }
    return { ...endpoint, path: resolve(configDir, endpoint.path) };
  };

  return {
    ...value,
    controlPlane: resolveEndpoint(value.controlPlane),
    executionEngine: resolveEndpoint(value.executionEngine),
    targets: Array.isArray(value.targets) ? value.targets.map(resolveEndpoint) : value.targets,
  };
}

export function validatePortfolioManifest(value: unknown): PortfolioManifestIssue[] {
  const issues: PortfolioManifestIssue[] = [];
  if (!isRecord(value)) {
    return [
      {
        type: 'invalid-field',
        field: 'root',
        message: 'Portfolio manifest must be a JSON object.',
      },
    ];
  }

  if (value.schemaVersion !== 1) {
    issues.push({
      type: 'invalid-field',
      field: 'schemaVersion',
      message: 'Portfolio manifest schemaVersion must be 1.',
    });
  }
  if (typeof value.portfolioId !== 'string' || value.portfolioId.length === 0) {
    issues.push({
      type: 'invalid-field',
      field: 'portfolioId',
      message: 'Portfolio manifest portfolioId must be a non-empty string.',
    });
  }

  validateAllowedFields(
    value,
    'root',
    ['schemaVersion', 'portfolioId', 'controlPlane', 'executionEngine', 'hostTooling', 'targets'],
    issues,
  );
  validateEndpoint(value.controlPlane, 'controlPlane', issues);
  validateEndpoint(value.executionEngine, 'executionEngine', issues);
  validateHostTooling(value.hostTooling, issues);

  if (!Array.isArray(value.targets)) {
    issues.push({
      type: 'invalid-field',
      field: 'targets',
      message: 'Portfolio manifest targets must be an array.',
    });
    return issues;
  }

  const seenTargetIds = new Set<string>();
  for (const target of value.targets) {
    if (!isRecord(target)) {
      issues.push({
        type: 'invalid-field',
        field: 'targets',
        message: 'Portfolio target must be an object.',
      });
      continue;
    }

    validateEndpoint(target, 'targets', issues);
    validateAllowedFields(target, 'target', ['id', 'path', 'profile', 'assetBundles'], issues);
    if (typeof target.id === 'string') {
      if (seenTargetIds.has(target.id)) {
        issues.push({
          type: 'duplicate-target-id',
          id: target.id,
          message: `Duplicate portfolio target id: ${target.id}`,
        });
      }
      seenTargetIds.add(target.id);
    }

    if (target.profile !== undefined && (typeof target.profile !== 'string' || !isValidProfile(target.profile))) {
      issues.push({
        type: 'invalid-field',
        id: typeof target.id === 'string' ? target.id : undefined,
        field: 'profile',
        message: 'Portfolio target profile must be engineering-runtime or doc-only.',
      });
    }
    validateOptionalStringArray(target.assetBundles, target.id, 'assetBundles', issues);
    if ('sharedRules' in target) {
      issues.push({
        type: 'invalid-field',
        id: typeof target.id === 'string' ? target.id : undefined,
        field: 'sharedRules',
        message: 'Portfolio target sharedRules is not managed yet; remove it until plan/check supports it.',
      });
    }
  }

  return issues;
}

export function getDefaultPortfolioTargets(
  manifest: PortfolioManifest | undefined,
): PortfolioTarget[] {
  return manifest?.targets ?? [];
}

function validateAllowedFields(
  value: Record<string, unknown>,
  location: string,
  allowedFields: readonly string[],
  issues: PortfolioManifestIssue[],
): void {
  const allowed = new Set(allowedFields);
  for (const field of Object.keys(value)) {
    if (allowed.has(field)) continue;
    issues.push({
      type: 'invalid-field',
      id: typeof value.id === 'string' ? value.id : undefined,
      field,
      message: `Unknown portfolio ${location} field: ${field}`,
    });
  }
}

function validateEndpoint(
  value: unknown,
  field: string,
  issues: PortfolioManifestIssue[],
): void {
  if (value === undefined) return;
  if (!isRecord(value)) {
    issues.push({
      type: 'invalid-field',
      field,
      message: `Portfolio ${field} must be an object.`,
    });
    return;
  }
  if (typeof value.id !== 'string' || value.id.length === 0) {
    issues.push({
      type: 'invalid-field',
      field: `${field}.id`,
      message: `Portfolio ${field} id must be a non-empty string.`,
    });
  }
  if (typeof value.path !== 'string' || value.path.length === 0) {
    issues.push({
      type: 'invalid-field',
      id: typeof value.id === 'string' ? value.id : undefined,
      field: `${field}.path`,
      message: `Portfolio ${field} path must be a non-empty string.`,
    });
    return;
  }
  if (!existsSync(value.path)) {
    issues.push({
      type: 'missing-path',
      id: typeof value.id === 'string' ? value.id : undefined,
      field: `${field}.path`,
      message: `Portfolio ${field} path does not exist: ${value.path}`,
    });
  }
}

function validateOptionalStringArray(
  value: unknown,
  id: unknown,
  field: string,
  issues: PortfolioManifestIssue[],
): void {
  if (value === undefined) return;
  if (!Array.isArray(value) || !value.every((entry) => typeof entry === 'string')) {
    issues.push({
      type: 'invalid-field',
      id: typeof id === 'string' ? id : undefined,
      field,
      message: `Portfolio target ${field} must be an array of strings.`,
    });
  }
}

function validateHostTooling(
  value: unknown,
  issues: PortfolioManifestIssue[],
): void {
  if (value === undefined) return;
  if (!Array.isArray(value)) {
    issues.push({
      type: 'invalid-field',
      field: 'hostTooling',
      message: 'Portfolio hostTooling must be an array.',
    });
    return;
  }

  const seenHosts = new Set<string>();
  for (const entry of value) {
    if (!isRecord(entry)) {
      issues.push({
        type: 'invalid-field',
        field: 'hostTooling',
        message: 'Portfolio hostTooling entry must be an object.',
      });
      continue;
    }
    validateAllowedFields(entry, 'hostTooling', ['host', 'plugins'], issues);
    if (entry.host !== 'codex' && entry.host !== 'claude-code') {
      issues.push({
        type: 'invalid-field',
        field: 'hostTooling.host',
        message: 'Portfolio hostTooling host must be codex or claude-code.',
      });
    } else if (seenHosts.has(entry.host)) {
      issues.push({
        type: 'invalid-field',
        field: 'hostTooling',
        message: `Duplicate portfolio hostTooling entry: ${entry.host}`,
      });
    } else {
      seenHosts.add(entry.host);
    }

    if (
      !Array.isArray(entry.plugins) ||
      !entry.plugins.every((plugin) => typeof plugin === 'string' && plugin.length > 0)
    ) {
      issues.push({
        type: 'invalid-field',
        field: 'hostTooling.plugins',
        message: 'Portfolio hostTooling plugins must be an array of non-empty strings.',
      });
    }
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
