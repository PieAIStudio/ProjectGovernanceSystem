import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';

import { createNpxSkillsMaintenancePlan } from './maintenance';

test('createNpxSkillsMaintenancePlan runs updates only inside a temp copy', () => {
  const npxRoot = createNpxRoot();
  const originalSkill = readFileSync(join(npxRoot, '.agents/skills/example/SKILL.md'), 'utf8');

  const plan = createNpxSkillsMaintenancePlan({
    operation: 'update',
    npxRoot,
    runner: ({ cwd }) => {
      writeFileSync(join(cwd, '.agents/skills/example/SKILL.md'), '# Updated\n');
      return { status: 0, stdout: 'updated', stderr: '' };
    },
  });

  assert.equal(plan.appliedToRealRoot, false);
  assert.notEqual(plan.tempRoot, npxRoot);
  assert.deepEqual(plan.command.slice(0, 5), ['npx', '--yes', 'skills', 'update', '-p']);
  assert.ok(plan.changes.some((change) => change.type === 'modified' && change.path === '.agents/skills/example/SKILL.md'));
  assert.equal(readFileSync(join(npxRoot, '.agents/skills/example/SKILL.md'), 'utf8'), originalSkill);
});

test('createNpxSkillsMaintenancePlan refuses roots without native npx shape', () => {
  const baseDir = join(tmpdir(), `pro-gov-bad-npx-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  mkdirSync(baseDir, { recursive: true });

  assert.throws(
    () => createNpxSkillsMaintenancePlan({ operation: 'update', npxRoot: baseDir }),
    /skills-lock.json/,
  );

  writeFileSync(join(baseDir, 'skills-lock.json'), '{"version":1,"skills":{}}\n');
  assert.throws(
    () => createNpxSkillsMaintenancePlan({ operation: 'update', npxRoot: baseDir }),
    /\.agents\/skills/,
  );
});

test('createNpxSkillsMaintenancePlan creates add commands with source and skill name', () => {
  const npxRoot = createNpxRoot();
  const plan = createNpxSkillsMaintenancePlan({
    operation: 'add',
    npxRoot,
    source: 'example/skill-repo',
    skill: 'example',
    runner: ({ cwd }) => {
      mkdirSync(join(cwd, '.agents/skills/new-skill'), { recursive: true });
      writeFileSync(join(cwd, '.agents/skills/new-skill/SKILL.md'), '# New\n');
      return { status: 0, stdout: 'added', stderr: '' };
    },
  });

  assert.deepEqual(plan.command, [
    'npx',
    '--yes',
    'skills',
    'add',
    'example/skill-repo',
    '--skill',
    'example',
  ]);
  assert.ok(plan.changes.some((change) => change.type === 'added'));
  assert.equal(existsSync(join(npxRoot, '.agents/skills/new-skill')), false);
});

test('createNpxSkillsMaintenancePlan rejects partial update failures reported with exit code zero', () => {
  const npxRoot = createNpxRoot();

  assert.throws(
    () =>
      createNpxSkillsMaintenancePlan({
        operation: 'update',
        npxRoot,
        runner: () => ({
          status: 0,
          stdout: 'Updated 3 skill(s)\n\u001B[31mFailed to update 2 skill(s)\u001B[0m\n',
          stderr: '',
        }),
      }),
    /reported a partial failure.*Failed to update 2 skill\(s\)/s,
  );
});

function createNpxRoot(): string {
  const npxRoot = join(tmpdir(), `pro-gov-npx-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  mkdirSync(join(npxRoot, '.agents/skills/example'), { recursive: true });
  writeFileSync(join(npxRoot, 'skills-lock.json'), '{"version":1,"skills":{"example":{}}}\n');
  writeFileSync(join(npxRoot, '.agents/skills/example/SKILL.md'), '# Example\n');
  return npxRoot;
}
