import assert from 'node:assert/strict';
import test from 'node:test';

import { inspectHostTooling } from './inventory';
import type { HostToolingCommandRunner } from './inventory';

test('inspectHostTooling accepts installed and enabled Codex and Claude plugins', () => {
  const runner = fixtureRunner({
    codex: JSON.stringify({ installed: [
      { pluginId: 'superpowers@openai-curated', version: '1.0.0', enabled: true },
      { pluginId: 'unrelated@example', version: '9.9.9', enabled: true },
    ] }),
    'claude-code': JSON.stringify([{ id: 'ponytail@ponytail', version: '4.8.4', enabled: true }]),
  });

  const result = inspectHostTooling([
    { host: 'codex', plugins: ['superpowers@openai-curated'] },
    { host: 'claude-code', plugins: ['ponytail@ponytail'] },
  ], runner);

  assert.deepEqual(result.issues, []);
  assert.deepEqual(result.hosts.map((host) => host.plugins[0]?.version), ['1.0.0', '4.8.4']);
  assert.equal(result.hosts[0]?.plugins.length, 1);
});

test('inspectHostTooling reports missing and disabled plugins', () => {
  const runner = fixtureRunner({
    codex: JSON.stringify({ installed: [{ pluginId: 'ponytail@ponytail', version: '4.8.4', enabled: false }] }),
  });

  const result = inspectHostTooling([
    { host: 'codex', plugins: ['ponytail@ponytail', 'compound-engineering@example'] },
  ], runner);

  assert.ok(result.issues.some((issue) => issue.type === 'host-tooling-disabled'));
  assert.ok(result.issues.some((issue) => issue.type === 'host-tooling-missing'));
});

test('inspectHostTooling reports unavailable commands and malformed output', () => {
  const unavailable: HostToolingCommandRunner = () => ({ status: null, stdout: '', stderr: 'ENOENT' });
  const malformed: HostToolingCommandRunner = () => ({ status: 0, stdout: 'not-json', stderr: '' });

  const unavailableResult = inspectHostTooling([{ host: 'codex', plugins: [] }], unavailable);
  const malformedResult = inspectHostTooling([{ host: 'claude-code', plugins: [] }], malformed);

  assert.ok(unavailableResult.issues.some((issue) => issue.type === 'host-tooling-command-failed'));
  assert.ok(malformedResult.issues.some((issue) => issue.type === 'host-tooling-command-failed'));
});

function fixtureRunner(outputs: Partial<Record<'codex' | 'claude-code', string>>): HostToolingCommandRunner {
  return ({ host }) => ({
    status: 0,
    stdout: outputs[host] ?? JSON.stringify(host === 'codex' ? { installed: [] } : []),
    stderr: '',
  });
}
