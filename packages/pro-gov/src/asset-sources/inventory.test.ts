import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, symlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';

import { scanAgentAssetSources } from './inventory';

function makeTempRoot(): string {
  return mkdtempSync(join(tmpdir(), 'pro-gov-assets-'));
}

function writeSkill(root: string, name: string): void {
  const dir = join(root, name);
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, 'SKILL.md'),
    `---\nname: ${name}\ndescription: ${name} test skill\n---\n\n# ${name}\n`,
  );
}

test('scanAgentAssetSources classifies pie, dokobot, npx, rules, and commands', () => {
  const root = makeTempRoot();
  const projectSkills = join(root, 'MyProjectSkills');
  const globalSkills = join(root, 'MyGlobalSkills');
  const dokobot = join(projectSkills, 'dokobot');
  const npxRoot = join(projectSkills, '_npx_skills');
  const globalRules = join(root, 'MyGlobalRules');
  const projectCommands = join(root, 'MyProjectCommands');

  writeSkill(projectSkills, 'screenwalk');
  writeSkill(globalSkills, 'my-skills-manager');
  writeSkill(dokobot, 'deep-research');
  writeSkill(join(npxRoot, '.agents', 'skills'), 'frontend-design');
  mkdirSync(globalRules, { recursive: true });
  writeFileSync(join(globalRules, 'rule-evolution-methodology.md'), '# Rule\n');
  mkdirSync(projectCommands, { recursive: true });
  writeFileSync(join(projectCommands, 'publish-founder-log.md'), '# Command\n');
  writeFileSync(
    join(npxRoot, 'skills-lock.json'),
    JSON.stringify({
      version: 1,
      skills: {
        'frontend-design': {
          source: 'anthropics/skills',
          sourceType: 'github',
          skillPath: 'skills/frontend-design/SKILL.md',
        },
      },
    }),
  );

  const report = scanAgentAssetSources({
    projectSkillsRoot: projectSkills,
    globalSkillsRoot: globalSkills,
    dokobotRoot: dokobot,
    npxRoot,
    ruleRoots: [globalRules],
    commandRoots: [projectCommands],
  });

  assert.deepEqual(
    report.assets.map((asset) => `${asset.family}:${asset.kind}:${asset.name}`).sort(),
    [
      'dokobot:skill:deep-research',
      'npx-skills:skill:frontend-design',
      'pie-commands:command:publish-founder-log',
      'pie-rules:rule:rule-evolution-methodology',
      'pie-skills:skill:my-skills-manager',
      'pie-skills:skill:screenwalk',
    ],
  );
  assert.equal(report.counts['npx-skills'], 1);
});

test('scanAgentAssetSources reports dangling links, duplicate names, missing skills, and npx lock drift', () => {
  const root = makeTempRoot();
  const projectSkills = join(root, 'MyProjectSkills');
  const globalSkills = join(root, 'MyGlobalSkills');
  const npxRoot = join(projectSkills, '_npx_skills');

  writeSkill(projectSkills, 'shared-skill');
  writeSkill(globalSkills, 'shared-skill');
  mkdirSync(join(projectSkills, 'missing-skill-md'), { recursive: true });
  symlinkSync(join(root, 'does-not-exist.md'), join(projectSkills, 'dangling-rule.md'));
  writeSkill(join(npxRoot, '.agents', 'skills'), 'installed-only');
  writeFileSync(
    join(npxRoot, 'skills-lock.json'),
    JSON.stringify({
      version: 1,
      skills: {
        'lock-only': {
          source: 'owner/repo',
          sourceType: 'github',
          skillPath: 'skills/lock-only/SKILL.md',
        },
      },
    }),
  );

  const report = scanAgentAssetSources({
    projectSkillsRoot: projectSkills,
    globalSkillsRoot: globalSkills,
    npxRoot,
  });

  assert.ok(report.issues.some((issue) => issue.type === 'dangling-symlink'));
  assert.ok(report.issues.some((issue) => issue.type === 'duplicate-name' && issue.name === 'shared-skill'));
  assert.ok(report.issues.some((issue) => issue.type === 'missing-skill-md' && issue.name === 'missing-skill-md'));
  assert.ok(report.issues.some((issue) => issue.type === 'npx-lock-missing-skill-dir' && issue.name === 'lock-only'));
  assert.ok(report.issues.some((issue) => issue.type === 'npx-skill-dir-missing-lock' && issue.name === 'installed-only'));
});

test('scanAgentAssetSources does not double-count nested npx root problems as pie skill issues', () => {
  const root = makeTempRoot();
  const projectSkills = join(root, 'MyProjectSkills');
  const npxRoot = join(projectSkills, '_npx_skills');

  mkdirSync(join(npxRoot, 'skills'), { recursive: true });
  symlinkSync(join(root, 'missing-skill'), join(npxRoot, 'skills', 'missing-skill'));

  const report = scanAgentAssetSources({
    projectSkillsRoot: projectSkills,
    npxRoot,
  });

  assert.equal(
    report.issues.filter((issue) => issue.type === 'dangling-symlink' && issue.name === 'missing-skill').length,
    1,
  );
  assert.ok(
    report.issues.every(
      (issue) => issue.type !== 'dangling-symlink' || issue.name !== 'missing-skill' || issue.family === 'npx-skills',
    ),
  );
});
