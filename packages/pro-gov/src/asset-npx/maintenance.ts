import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { tmpdir } from 'node:os';

export type NpxSkillsMaintenanceOperation = 'add' | 'update';

export interface NpxSkillsMaintenanceOptions {
  operation: NpxSkillsMaintenanceOperation;
  npxRoot: string;
  source?: string;
  skill?: string;
  timeoutMs?: number;
  runner?: NpxSkillsRunner;
}

export interface NpxSkillsRunnerInput {
  command: string[];
  cwd: string;
  timeoutMs: number;
}

export type NpxSkillsRunner = (input: NpxSkillsRunnerInput) => {
  status: number | null;
  stdout: string;
  stderr: string;
  signal?: string | null;
  timedOut?: boolean;
  timeoutMs?: number;
};

export interface NpxSkillsMaintenanceChange {
  type: 'added' | 'modified' | 'deleted';
  path: string;
}

export interface NpxSkillsMaintenancePlan {
  schemaVersion: 1;
  operation: NpxSkillsMaintenanceOperation;
  npxRoot: string;
  tempRoot: string;
  command: string[];
  stdout: string;
  stderr: string;
  exitCode: number;
  changes: NpxSkillsMaintenanceChange[];
  summary: string;
  appliedToRealRoot: false;
}

export function createNpxSkillsMaintenancePlan(
  options: NpxSkillsMaintenanceOptions,
): NpxSkillsMaintenancePlan {
  assertNativeNpxRoot(options.npxRoot);
  if (options.operation === 'add' && !options.source) {
    throw new Error('npx skills add requires a source.');
  }

  const before = snapshotFiles(options.npxRoot);
  const tempRoot = mkdtempSync(join(tmpdir(), 'pro-gov-npx-skills-'));
  cpSync(options.npxRoot, tempRoot, { recursive: true, dereference: false });

  const command = buildNpxCommand(options);
  const runner = options.runner ?? defaultRunner;
  const timeoutMs = options.timeoutMs ?? 300_000;
  const result = runner({ command, cwd: tempRoot, timeoutMs });
  if (result.timedOut) {
    throw new Error(`npx skills ${options.operation} timed out after ${timeoutMs}ms`);
  }
  if (result.status === null && result.signal) {
    throw new Error(`npx skills ${options.operation} terminated by ${result.signal}`);
  }
  if (result.status !== 0) {
    throw new Error(`npx skills ${options.operation} failed with exit code ${result.status}`);
  }
  if (options.operation === 'update') {
    assertNoReportedPartialUpdateFailure(result.stdout, result.stderr);
  }

  const after = snapshotFiles(tempRoot);
  const changes = diffSnapshots(before, after);

  return {
    schemaVersion: 1,
    operation: options.operation,
    npxRoot: options.npxRoot,
    tempRoot,
    command,
    stdout: result.stdout,
    stderr: result.stderr,
    exitCode: result.status ?? 0,
    changes,
    summary: summarizeChanges(changes),
    appliedToRealRoot: false,
  };
}

function assertNoReportedPartialUpdateFailure(stdout: string, stderr: string): void {
  const output = `${stdout}\n${stderr}`.replace(/\u001B\[[0-?]*[ -/]*[@-~]/g, '');
  const failure = output.match(/Failed to update\s+\d+\s+skill\(s\)/i);
  if (failure) {
    throw new Error(`npx skills update reported a partial failure: ${failure[0]}`);
  }
}

function assertNativeNpxRoot(npxRoot: string): void {
  if (!existsSync(join(npxRoot, 'skills-lock.json'))) {
    throw new Error(`npx skills root is missing skills-lock.json: ${npxRoot}`);
  }
  if (!existsSync(join(npxRoot, '.agents/skills'))) {
    throw new Error(`npx skills root is missing .agents/skills: ${npxRoot}`);
  }
}

function buildNpxCommand(options: NpxSkillsMaintenanceOptions): string[] {
  if (options.operation === 'add') {
    const command = ['npx', '--yes', 'skills', 'add', options.source ?? ''];
    if (options.skill) command.push('--skill', options.skill);
    return command;
  }
  const command = ['npx', '--yes', 'skills', 'update', '-p', '-y'];
  if (options.skill) command.push(options.skill);
  return command;
}

function defaultRunner({ command, cwd, timeoutMs }: NpxSkillsRunnerInput): {
  status: number | null;
  stdout: string;
  stderr: string;
  signal: string | null;
  timedOut: boolean;
} {
  const result = spawnSync(command[0] ?? 'npx', command.slice(1), {
    cwd,
    encoding: 'utf8',
    timeout: timeoutMs,
  });
  return {
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
    signal: result.signal,
    timedOut: (result.error as NodeJS.ErrnoException | undefined)?.code === 'ETIMEDOUT',
  };
}

function snapshotFiles(root: string): Map<string, string> {
  const snapshot = new Map<string, string>();
  for (const filePath of listFiles(root)) {
    const relativePath = toUnixPath(relative(root, filePath));
    snapshot.set(relativePath, hashFile(filePath));
  }
  return snapshot;
}

function listFiles(root: string): string[] {
  const files: string[] = [];
  collectFiles(root, root, files);
  return files.sort();
}

function collectFiles(root: string, current: string, files: string[]): void {
  mkdirSync(root, { recursive: true });
  for (const entry of readdirSync(current, { withFileTypes: true })) {
    const entryPath = join(current, entry.name);
    if (entry.isDirectory()) {
      collectFiles(root, entryPath, files);
    } else if (entry.isFile()) {
      files.push(entryPath);
    }
  }
}

function hashFile(path: string): string {
  const hash = createHash('sha256');
  const stats = statSync(path);
  hash.update(String(stats.size));
  hash.update('\0');
  hash.update(readFileSync(path));
  return hash.digest('hex');
}

function diffSnapshots(
  before: ReadonlyMap<string, string>,
  after: ReadonlyMap<string, string>,
): NpxSkillsMaintenanceChange[] {
  const changes: NpxSkillsMaintenanceChange[] = [];
  for (const [path, hash] of after) {
    if (!before.has(path)) {
      changes.push({ type: 'added', path });
    } else if (before.get(path) !== hash) {
      changes.push({ type: 'modified', path });
    }
  }
  for (const path of before.keys()) {
    if (!after.has(path)) changes.push({ type: 'deleted', path });
  }
  return changes.sort((a, b) => a.path.localeCompare(b.path) || a.type.localeCompare(b.type));
}

function summarizeChanges(changes: readonly NpxSkillsMaintenanceChange[]): string {
  const counts = new Map<NpxSkillsMaintenanceChange['type'], number>();
  for (const change of changes) counts.set(change.type, (counts.get(change.type) ?? 0) + 1);
  return `added=${counts.get('added') ?? 0} modified=${counts.get('modified') ?? 0} deleted=${
    counts.get('deleted') ?? 0
  }`;
}

function toUnixPath(path: string): string {
  return path.replaceAll('\\', '/');
}
