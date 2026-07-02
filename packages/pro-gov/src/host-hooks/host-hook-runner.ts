import { closeSync, openSync, readFileSync, readSync, statSync } from 'node:fs';

import type { HostHookDecision, HostHookEvent, HostHookHost, HostHookRequest } from './types';

const gateMarkerPattern = /Compound Gate:\s*(ran ce-compound|skipped)\s*->/i;

const completionSignalPatterns = [
  /\b(done|completed|implemented|fixed|verified|validated|shipped|pushed|committed)\b/i,
  /\b(tests?|typecheck|build|lint|doctor|pack)\b.*\b(pass|passed|green|succeed|succeeded|ok)\b/i,
  /\b(changed|updated|modified|created|deleted|refactored)\b.*\b(files?|docs?|tests?|hooks?|configs?)\b/i,
  /完成|已完成|修好了|实现了|验证通过|测试通过|已经提交|已经推送|提交并推送/,
];

const compoundGateInstruction = [
  'Before final reporting, pass the PGS Compound Gate.',
  'If this completed work produced reusable learning, run compound-engineering:ce-compound and report:',
  'Compound Gate: ran ce-compound -> <path>',
  'If there is no reusable learning, report:',
  'Compound Gate: skipped -> <reason>',
].join('\n');

const maxTranscriptBytes = 2 * 1024 * 1024;

export function evaluateHostHook(request: HostHookRequest): HostHookDecision {
  if (request.event !== 'Stop' && request.event !== 'SubagentStop') {
    return { action: 'allow' };
  }

  const input = normalizeStopInput(request.input);
  if (input.stopHookActive) {
    return { action: 'allow' };
  }

  if (!input.lastAssistantMessage) {
    return { action: 'allow' };
  }

  if (gateMarkerPattern.test(input.lastAssistantMessage)) {
    return { action: 'allow' };
  }

  if (!looksLikeCompletedEngineeringWork(input.lastAssistantMessage)) {
    return { action: 'allow' };
  }

  return { action: 'continue', reason: compoundGateInstruction };
}

export function formatHostHookOutput(
  host: HostHookHost,
  event: HostHookEvent,
  decision: HostHookDecision,
): Record<string, unknown> {
  if (decision.action === 'allow') {
    return {};
  }

  if (host === 'codex') {
    if (event === 'Stop' || event === 'SubagentStop') {
      return { decision: 'block', reason: decision.reason };
    }
    if (decision.action === 'block') {
      return {
        hookSpecificOutput: {
          hookEventName: event,
          permissionDecision: 'deny',
          permissionDecisionReason: decision.reason,
        },
        systemMessage: decision.reason,
      };
    }
    return { systemMessage: decision.reason };
  }

  if (host === 'claude' || host === 'claude-code') {
    if (event === 'Stop' || event === 'SubagentStop') {
      return { decision: 'block', reason: decision.reason };
    }
    if (decision.action === 'block') {
      return {
        hookSpecificOutput: {
          hookEventName: event,
          permissionDecision: 'deny',
          permissionDecisionReason: decision.reason,
        },
      };
    }
    return { systemMessage: decision.reason };
  }

  if (host === 'antigravity') {
    if (event === 'Stop' || event === 'SubagentStop') {
      return { decision: 'continue', reason: decision.reason };
    }
    if (decision.action === 'block') {
      return { decision: 'deny', reason: decision.reason };
    }
    return { decision: 'allow', reason: decision.reason };
  }

  return {};
}

function normalizeStopInput(input: unknown): {
  readonly lastAssistantMessage: string | undefined;
  readonly stopHookActive: boolean;
} {
  if (!isRecord(input)) {
    return { lastAssistantMessage: undefined, stopHookActive: false };
  }

  return {
    lastAssistantMessage:
      findString(input, ['last_assistant_message', 'lastAssistantMessage', 'message', 'text']) ??
      findLastAssistantMessageFromTranscript(findString(input, ['agent_transcript_path', 'agentTranscriptPath'])) ??
      findLastAssistantMessageFromTranscript(findString(input, ['transcript_path', 'transcriptPath'])),
    stopHookActive: findBoolean(input, ['stop_hook_active', 'stopHookActive']) ?? false,
  };
}

function looksLikeCompletedEngineeringWork(message: string): boolean {
  return completionSignalPatterns.some((pattern) => pattern.test(message));
}

function findString(input: Record<string, unknown>, keys: readonly string[]): string | undefined {
  for (const key of keys) {
    const value = input[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }
  return undefined;
}

function findBoolean(input: Record<string, unknown>, keys: readonly string[]): boolean | undefined {
  for (const key of keys) {
    const value = input[key];
    if (typeof value === 'boolean') {
      return value;
    }
  }
  return undefined;
}

function findLastAssistantMessageFromTranscript(path: string | undefined): string | undefined {
  if (!path || path.startsWith('~/')) {
    return undefined;
  }

  let content: string;
  try {
    content = readTranscriptTail(path);
  } catch {
    return undefined;
  }

  const lines = content.split(/\r?\n/);
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    const line = lines[index]?.trim();
    if (!line) {
      continue;
    }

    let record: unknown;
    try {
      record = JSON.parse(line);
    } catch {
      continue;
    }

    const message = extractAssistantText(record);
    if (message) {
      return message;
    }
  }

  return undefined;
}

function readTranscriptTail(path: string): string {
  const size = statSync(path).size;
  if (size <= maxTranscriptBytes) {
    return readFileSync(path, 'utf8');
  }

  const fd = openSync(path, 'r');
  try {
    const buffer = Buffer.allocUnsafe(maxTranscriptBytes);
    readSync(fd, buffer, 0, maxTranscriptBytes, size - maxTranscriptBytes);
    return buffer.toString('utf8');
  } finally {
    closeSync(fd);
  }
}

function extractAssistantText(value: unknown): string | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const nested = value.message;
  const role = findString(value, ['role', 'type']);
  if (isRecord(nested)) {
    const nestedRole = findString(nested, ['role', 'type']);
    if (nestedRole === 'assistant') {
      return extractTextContent(nested.content);
    }
  }

  if (role === 'assistant') {
    return extractTextContent(value.content) ?? extractTextContent(value.text);
  }

  return undefined;
}

function extractTextContent(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }

  if (!Array.isArray(value)) {
    return undefined;
  }

  const parts: string[] = [];
  for (const item of value) {
    if (typeof item === 'string') {
      parts.push(item);
      continue;
    }
    if (isRecord(item) && typeof item.text === 'string') {
      parts.push(item.text);
    }
  }

  const text = parts.join('\n').trim();
  return text.length > 0 ? text : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
