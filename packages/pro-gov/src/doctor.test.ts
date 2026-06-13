import assert from 'node:assert/strict';
import test from 'node:test';

import { runDoctor } from './commands/doctor';

test('doctor reports package health without failing on optional integrations', () => {
  const output = captureConsole(() => {
    assert.equal(runDoctor([]), 0);
  });

  assert.match(output, /pro-gov doctor/);
  assert.match(output, /assets:/);
  assert.match(output, /doc-gov:/);
});

function captureConsole(fn: () => void): string {
  const originalLog = console.log;
  const originalError = console.error;
  const lines: string[] = [];
  try {
    console.log = (...args: unknown[]) => {
      lines.push(args.join(' '));
    };
    console.error = (...args: unknown[]) => {
      lines.push(args.join(' '));
    };
    fn();
    return lines.join('\n');
  } finally {
    console.log = originalLog;
    console.error = originalError;
  }
}
