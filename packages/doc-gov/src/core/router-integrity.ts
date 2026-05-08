import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface RouterIntegrityIssue {
  file: string;
  code: string;
  message: string;
}

export interface RouterIntegrityResult {
  ok: boolean;
  issues: RouterIntegrityIssue[];
}

interface RequiredNeedle {
  file: string;
  needle: string;
  message: string;
}

const REQUIRED_FILES = [
  'AGENTS.md',
  'README.md',
  'routing/engineering-task-routing.md',
  'routing/doc-only-routing.md',
  'integrations/superpowers.md',
  'integrations/directed-development.md',
  'profiles/engineering-runtime/README.md',
  'profiles/engineering-runtime/manifest.yml',
  'profiles/doc-only/README.md',
  'profiles/doc-only/manifest.yml',
  'starter/AGENTS.template.md',
  'starter/docs/reference/execution/current-work.md',
] as const;

const REQUIRED_NEEDLES: RequiredNeedle[] = [
  {
    file: 'AGENTS.md',
    needle: 'routing/engineering-task-routing.md',
    message: 'AGENTS.md must mention routing/engineering-task-routing.md.',
  },
  {
    file: 'AGENTS.md',
    needle: 'routing/doc-only-routing.md',
    message: 'AGENTS.md must mention routing/doc-only-routing.md.',
  },
  {
    file: 'AGENTS.md',
    needle: 'integrations/superpowers.md',
    message: 'AGENTS.md must mention integrations/superpowers.md.',
  },
  {
    file: 'AGENTS.md',
    needle: 'integrations/directed-development.md',
    message: 'AGENTS.md must mention integrations/directed-development.md.',
  },
  {
    file: 'AGENTS.md',
    needle: 'profiles/engineering-runtime/',
    message: 'AGENTS.md must mention profiles/engineering-runtime/.',
  },
  {
    file: 'AGENTS.md',
    needle: 'profiles/doc-only/',
    message: 'AGENTS.md must mention profiles/doc-only/.',
  },
  {
    file: 'README.md',
    needle: 'integrations/superpowers.md',
    message: 'README.md must point readers to the Superpowers integration boundary.',
  },
  {
    file: 'routing/engineering-task-routing.md',
    needle: 'Use matching Superpowers workflow if applicable',
    message: 'Engineering routing must delegate Superpowers only inside the selected lane.',
  },
  {
    file: 'routing/engineering-task-routing.md',
    needle: 'current-work.md',
    message: 'Engineering routing must separate routing from current-work.md.',
  },
  {
    file: 'routing/doc-only-routing.md',
    needle: 'does not use Superpowers TDD or Directed Development by default',
    message: 'Doc-only routing must exclude engineering Superpowers/DD by default.',
  },
  {
    file: 'integrations/superpowers.md',
    needle: 'Task routing classifies first',
    message: 'Superpowers integration must state that task routing classifies first.',
  },
  {
    file: 'integrations/superpowers.md',
    needle: 'Superpowers executes inside the selected lane',
    message: 'Superpowers integration must state that Superpowers executes inside the lane.',
  },
  {
    file: 'integrations/superpowers.md',
    needle: 'does not vendor',
    message: 'Superpowers integration must preserve the external-plugin boundary.',
  },
  {
    file: 'integrations/directed-development.md',
    needle: 'optional workflow',
    message: 'Directed Development integration must stay optional.',
  },
  {
    file: 'profiles/engineering-runtime/manifest.yml',
    needle: 'routing/engineering-task-routing.md',
    message: 'Engineering profile manifest must point to engineering routing.',
  },
  {
    file: 'profiles/engineering-runtime/manifest.yml',
    needle: 'integrations/superpowers.md',
    message: 'Engineering profile manifest must include the Superpowers integration.',
  },
  {
    file: 'profiles/doc-only/manifest.yml',
    needle: 'routing/doc-only-routing.md',
    message: 'Doc-only profile manifest must point to doc-only routing.',
  },
  {
    file: 'profiles/doc-only/manifest.yml',
    needle: 'superpowers: false',
    message: 'Doc-only profile manifest must keep Superpowers disabled by default.',
  },
  {
    file: 'starter/AGENTS.template.md',
    needle: 'adopted profile',
    message: 'Starter AGENTS template must make projects name their adopted profile.',
  },
  {
    file: 'starter/AGENTS.template.md',
    needle: 'chosen routing file',
    message: 'Starter AGENTS template must make projects name their chosen routing file.',
  },
];

export function checkRouterIntegrity(rootDir = process.cwd()): RouterIntegrityResult {
  const issues: RouterIntegrityIssue[] = [];

  for (const file of REQUIRED_FILES) {
    if (!existsSync(join(rootDir, file))) {
      issues.push({
        file,
        code: 'missing-router-file',
        message: `Required router/integration file is missing: ${file}`,
      });
    }
  }

  for (const requirement of REQUIRED_NEEDLES) {
    const path = join(rootDir, requirement.file);
    if (!existsSync(path)) continue;
    const content = readFileSync(path, 'utf8');
    if (!content.includes(requirement.needle)) {
      issues.push({
        file: requirement.file,
        code: 'missing-router-reference',
        message: requirement.message,
      });
    }
  }

  return {
    ok: issues.length === 0,
    issues,
  };
}
