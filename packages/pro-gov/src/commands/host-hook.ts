import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';

import { evaluateHostHook, formatHostHookOutput } from '../host-hooks/host-hook-runner';
import { isHostHookEvent, isHostHookHost } from '../host-hooks/types';

const defaultStdinTimeoutMs = 750;
const maxDebugRawInputBytes = 256 * 1024;

export async function runHostHook(args: string[]): Promise<number> {
  const host = readOption(args, '--host');
  const event = readOption(args, '--event');

  if (!isHostHookHost(host)) {
    console.error('Expected --host <codex|claude-code|antigravity>');
    return 1;
  }

  if (!isHostHookEvent(event)) {
    console.error('Expected --event <Stop|SubagentStop|PreToolUse|PostToolUse|UserPromptSubmit>');
    return 1;
  }

  const rawInput = await readStdinText(defaultStdinTimeoutMs);
  const input = parseStdinJson(rawInput);
  const decision = evaluateHostHook({ host, event, input });
  const output = formatHostHookOutput(host, event, decision);
  writeDebugLogIfRequested(args, {
    decision,
    event,
    host,
    input,
    output,
    rawInput,
  });
  console.log(`${JSON.stringify(output)}\n`);
  return 0;
}

function readOption(args: readonly string[], name: string): string | undefined {
  const index = args.indexOf(name);
  if (index < 0) return undefined;
  return args[index + 1];
}

function parseStdinJson(raw: string): unknown {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function readStdinText(timeoutMs: number): Promise<string> {
  if (process.stdin.isTTY) {
    return Promise.resolve('');
  }

  process.stdin.setEncoding('utf8');

  return new Promise((resolveText) => {
    let settled = false;
    let content = '';

    const settle = (): void => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      process.stdin.off('data', onData);
      process.stdin.off('end', settle);
      process.stdin.off('error', settle);
      process.stdin.pause();
      resolveText(content.trim());
    };

    const onData = (chunk: string | Buffer): void => {
      content += chunk.toString();
    };

    const timer = setTimeout(settle, timeoutMs);
    timer.unref();

    process.stdin.on('data', onData);
    process.stdin.on('end', settle);
    process.stdin.on('error', settle);
    process.stdin.resume();
  });
}

function writeDebugLogIfRequested(
  args: readonly string[],
  record: {
    readonly decision: unknown;
    readonly event: string;
    readonly host: string;
    readonly input: unknown;
    readonly output: unknown;
    readonly rawInput: string;
  },
): void {
  const explicitPath = readOption(args, '--debug-log');
  const enabled = explicitPath !== undefined || process.env.PGS_HOST_HOOK_DEBUG === '1';
  if (!enabled) return;

  const debugDir = explicitPath && explicitPath.trim().length > 0 ? explicitPath : defaultDebugDir();
  try {
    mkdirSync(debugDir, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${timestamp}-${process.pid}-${record.host}-${record.event}.json`;
    writeFileSync(
      join(debugDir, fileName),
      `${JSON.stringify(
        {
          schemaVersion: 1,
          cwd: process.cwd(),
          event: record.event,
          host: record.host,
          nodeVersion: process.version,
          packageVersion: readPackageVersion(),
          rawInput: truncateDebugRawInput(record.rawInput),
          input: record.input,
          decision: record.decision,
          output: record.output,
        },
        null,
        2,
      )}\n`,
      'utf8',
    );
  } catch {
    // Hooks must never fail only because optional local diagnostics cannot write.
  }
}

function defaultDebugDir(): string {
  const gitPath = spawnSync('git', ['rev-parse', '--git-path', 'pro-gov-hook-debug'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  });
  const value = gitPath.status === 0 ? gitPath.stdout.trim() : '';
  if (value) {
    return resolve(process.cwd(), value);
  }
  return join(tmpdir(), 'pro-gov-hook-debug', basename(process.cwd()));
}

function readPackageVersion(): string | undefined {
  const packageJsonPath = resolvePackageJsonPath();
  if (!packageJsonPath) return undefined;
  try {
    const parsed = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    return typeof parsed.version === 'string' ? parsed.version : undefined;
  } catch {
    return undefined;
  }
}

function resolvePackageJsonPath(): string | undefined {
  const candidates = [
    resolve(process.cwd(), 'packages/pro-gov/package.json'),
    resolve(process.cwd(), 'node_modules/@pieai/pro-gov/package.json'),
  ];
  return candidates.find((candidate) => existsSync(candidate));
}

function truncateDebugRawInput(value: string): string {
  const buffer = Buffer.from(value);
  if (buffer.byteLength <= maxDebugRawInputBytes) return value;
  return `${buffer.subarray(0, maxDebugRawInputBytes).toString('utf8')}\n[truncated]`;
}
