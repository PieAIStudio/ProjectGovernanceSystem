export type HostHookHost = 'antigravity' | 'claude' | 'claude-code' | 'codex';

export type HostHookEvent =
  | 'PostToolUse'
  | 'PreToolUse'
  | 'Stop'
  | 'SubagentStop'
  | 'UserPromptSubmit';

export type HostHookDecision =
  | { readonly action: 'allow' }
  | { readonly action: 'block'; readonly reason: string }
  | { readonly action: 'continue'; readonly reason: string };

export interface HostHookRequest {
  readonly event: HostHookEvent;
  readonly host: HostHookHost;
  readonly input: unknown;
}

export function isHostHookHost(value: unknown): value is HostHookHost {
  return value === 'antigravity' || value === 'claude' || value === 'claude-code' || value === 'codex';
}

export function isHostHookEvent(value: unknown): value is HostHookEvent {
  return (
    value === 'PostToolUse' ||
    value === 'PreToolUse' ||
    value === 'Stop' ||
    value === 'SubagentStop' ||
    value === 'UserPromptSubmit'
  );
}
