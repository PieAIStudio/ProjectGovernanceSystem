import { readFileSync } from 'node:fs';

import { evaluateHostHook, formatHostHookOutput } from '../host-hooks/host-hook-runner';
import { isHostHookEvent, isHostHookHost } from '../host-hooks/types';

export function runHostHook(args: string[]): number {
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

  const input = readStdinJson();
  const decision = evaluateHostHook({ host, event, input });
  const output = formatHostHookOutput(host, event, decision);
  console.log(`${JSON.stringify(output)}\n`);
  return 0;
}

function readOption(args: readonly string[], name: string): string | undefined {
  const index = args.indexOf(name);
  if (index < 0) return undefined;
  return args[index + 1];
}

function readStdinJson(): unknown {
  const raw = readFileSync(0, 'utf8').trim();
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}
