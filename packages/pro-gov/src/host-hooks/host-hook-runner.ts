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
      return { ok: false, reason: decision.reason };
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
    lastAssistantMessage: findString(input, ['last_assistant_message', 'lastAssistantMessage', 'message', 'text']),
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
