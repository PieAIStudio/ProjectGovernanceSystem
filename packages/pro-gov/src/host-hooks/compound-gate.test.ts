import assert from 'node:assert/strict';
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
    host: 'claude',
    event: 'Stop',
    input: {
      stop_hook_active: true,
      last_assistant_message: 'Done. I changed the files and ran tests.',
    },
  });

  assert.deepEqual(decision, { action: 'allow' });
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
  assert.deepEqual(formatHostHookOutput('claude', 'Stop', decision), {
    ok: false,
    reason: 'Pass Compound Gate before final reporting.',
  });
  assert.deepEqual(formatHostHookOutput('antigravity', 'Stop', decision), {
    decision: 'continue',
    reason: 'Pass Compound Gate before final reporting.',
  });
});
