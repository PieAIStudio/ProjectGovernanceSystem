import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { evaluateHostHook, formatHostHookOutput } from './host-hook-runner';

test('Stop hook asks the agent to pass Compound Gate before final completion', () => {
  const decision = evaluateHostHook({
    host: 'codex',
    event: 'Stop',
    input: {
      stop_hook_active: false,
      last_assistant_message: 'Done. I changed the files, ran tests, committed, and pushed.',
    },
  });

  assert.equal(decision.action, 'continue');
  assert.match(decision.reason, /Compound Gate/);
  assert.match(decision.reason, /ce-compound/);
});

test('Stop hook allows final reports that already include a Compound Gate result', () => {
  const decision = evaluateHostHook({
    host: 'codex',
    event: 'Stop',
    input: {
      stop_hook_active: false,
      last_assistant_message: 'Verified and pushed.\n\nCompound Gate: skipped -> mechanical sync only',
    },
  });

  assert.deepEqual(decision, { action: 'allow' });
});

test('Stop hook allows a continued turn to stop to avoid infinite loops', () => {
  const decision = evaluateHostHook({
    host: 'claude-code',
    event: 'Stop',
    input: {
      stop_hook_active: true,
      last_assistant_message: 'Done. I changed the files and ran tests.',
    },
  });

  assert.deepEqual(decision, { action: 'allow' });
});

test('Claude Code Stop fixture blocks completed work without Compound Gate marker', () => {
  // Source: https://code.claude.com/docs/en/hooks, Stop input and decision control, accessed 2026-07-02.
  const decision = evaluateHostHook({
    host: 'claude-code',
    event: 'Stop',
    input: {
      session_id: 'abc123',
      transcript_path: '~/.claude/projects/example/abc123.jsonl',
      cwd: '/Users/example/project',
      hook_event_name: 'Stop',
      stop_hook_active: false,
      last_assistant_message: 'Done. I changed the files and tests passed.',
      background_tasks: [],
      session_crons: [],
    },
  });

  assert.equal(decision.action, 'continue');
  assert.deepEqual(formatHostHookOutput('claude-code', 'Stop', decision), {
    decision: 'block',
    reason: decision.reason,
  });
});

test('Claude Code SubagentStop fixture blocks completed subagent work without Compound Gate marker', () => {
  // Source: https://code.claude.com/docs/en/hooks, SubagentStop input and decision control, accessed 2026-07-02.
  const decision = evaluateHostHook({
    host: 'claude-code',
    event: 'SubagentStop',
    input: {
      session_id: 'abc123',
      transcript_path: '~/.claude/projects/example/abc123.jsonl',
      cwd: '/Users/example/project',
      hook_event_name: 'SubagentStop',
      stop_hook_active: false,
      agent_id: 'def456',
      agent_type: 'Explore',
      agent_transcript_path: '~/.claude/projects/example/abc123/subagents/agent-def456.jsonl',
      last_assistant_message: 'Completed the audit and verified the report.',
      background_tasks: [],
      session_crons: [],
    },
  });

  assert.equal(decision.action, 'continue');
  assert.deepEqual(formatHostHookOutput('claude-code', 'SubagentStop', decision), {
    decision: 'block',
    reason: decision.reason,
  });
});

test('Claude Code Stop can fall back to transcript_path when last assistant message is absent', () => {
  const root = mkdtempSync(join(tmpdir(), 'pro-gov-claude-transcript-'));
  const transcriptPath = join(root, 'session.jsonl');
  writeFileSync(
    transcriptPath,
    [
      JSON.stringify({ type: 'user', message: { role: 'user', content: 'Please fix it.' } }),
      JSON.stringify({
        type: 'assistant',
        message: {
          role: 'assistant',
          content: [{ type: 'text', text: 'Done. I changed files and tests passed.' }],
        },
      }),
    ].join('\n'),
  );

  const decision = evaluateHostHook({
    host: 'claude-code',
    event: 'Stop',
    input: {
      session_id: 'abc123',
      transcript_path: transcriptPath,
      cwd: root,
      hook_event_name: 'Stop',
      stop_hook_active: false,
    },
  });

  assert.equal(decision.action, 'continue');
});

test('Antigravity Stop fixture continues completed work without Compound Gate marker', () => {
  // Source: https://antigravity.google/docs/hooks, Stop output summary, accessed 2026-07-02:
  // decision "continue" prevents the agent from stopping and re-enters the execution loop.
  const decision = evaluateHostHook({
    host: 'antigravity',
    event: 'Stop',
    input: {
      hook_event_name: 'Stop',
      stop_hook_active: false,
      last_assistant_message: 'Done. I updated the docs and tests passed.',
    },
  });

  assert.equal(decision.action, 'continue');
  assert.deepEqual(formatHostHookOutput('antigravity', 'Stop', decision), {
    decision: 'continue',
    reason: decision.reason,
  });
});

test('Stop hook ignores analysis-only replies with no completion claim', () => {
  const decision = evaluateHostHook({
    host: 'antigravity',
    event: 'Stop',
    input: {
      stop_hook_active: false,
      last_assistant_message: 'I recommend using a Stop hook, then validating it in a fresh session.',
    },
  });

  assert.deepEqual(decision, { action: 'allow' });
});

test('formatHostHookOutput emits host-specific continuation shapes', () => {
  const decision = {
    action: 'continue' as const,
    reason: 'Pass Compound Gate before final reporting.',
  };

  assert.deepEqual(formatHostHookOutput('codex', 'Stop', decision), {
    decision: 'block',
    reason: 'Pass Compound Gate before final reporting.',
  });
  assert.deepEqual(formatHostHookOutput('claude-code', 'Stop', decision), {
    decision: 'block',
    reason: 'Pass Compound Gate before final reporting.',
  });
  assert.deepEqual(formatHostHookOutput('antigravity', 'Stop', decision), {
    decision: 'continue',
    reason: 'Pass Compound Gate before final reporting.',
  });
});
