import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { checkDocs } from '../core/checker';
import { checkCurrentMarkdownLinks } from '../core/link-checker';
import { manifestInSync } from '../core/manifest';
import { checkRouterIntegrity } from '../core/router-integrity';

interface DoctorIssue {
  severity: 'error' | 'warning';
  code: string;
  message: string;
}

export function runDoctor(_args: string[]): number {
  const root = process.cwd();
  const issues = collectDoctorIssues(root);
  const errors = issues.filter((issue) => issue.severity === 'error');
  const warnings = issues.filter((issue) => issue.severity === 'warning');

  for (const issue of errors) {
    console.error(`error ${issue.code}: ${issue.message}`);
  }
  for (const issue of warnings) {
    console.log(`warning ${issue.code}: ${issue.message}`);
  }

  if (errors.length > 0) {
    console.error(
      `doc-gov doctor failed with ${errors.length} error(s) and ${warnings.length} warning(s).`
    );
    return 1;
  }

  console.log(`doc-gov doctor passed with ${warnings.length} warning(s).`);
  return 0;
}

export function collectDoctorIssues(rootDir = process.cwd()): DoctorIssue[] {
  const issues: DoctorIssue[] = [];

  const router = checkRouterIntegrity(rootDir);
  if (!router.ok) {
    for (const issue of router.issues) {
      issues.push({
        severity: 'error',
        code: `router:${issue.code}`,
        message: `${issue.file}: ${issue.message}`,
      });
    }
  }

  const docs = checkDocs(rootDir);
  if (!docs.ok) {
    for (const issue of docs.issues) {
      issues.push({
        severity: 'error',
        code: `docs:${issue.code}`,
        message: `${issue.file}: ${issue.message}`,
      });
    }
  }

  if (!manifestInSync(rootDir)) {
    issues.push({
      severity: 'error',
      code: 'manifest:out-of-sync',
      message: 'docs/governance/MANIFEST.yml is stale. Run pnpm doc-gov scan.',
    });
  }

  const links = checkCurrentMarkdownLinks(rootDir);
  if (!links.ok) {
    for (const issue of links.issues) {
      issues.push({
        severity: 'error',
        code: 'links:broken-local-link',
        message: issue.message,
      });
    }
  }

  issues.push(...checkLefthook(rootDir));
  issues.push(...checkDocsCheckWorkflow(rootDir));

  return issues;
}

function checkLefthook(rootDir: string): DoctorIssue[] {
  const path = join(rootDir, 'lefthook.yml');
  if (!existsSync(path)) {
    return [
      {
        severity: 'warning',
        code: 'guardrail:missing-lefthook',
        message: 'lefthook.yml is missing; local commits do not have the standard doc-gov gate.',
      },
    ];
  }

  const content = readFileSync(path, 'utf8');
  const issues: DoctorIssue[] = [];
  for (const command of [
    'pnpm doc-gov router-check',
    'pnpm doc-gov check',
    'pnpm doc-gov scan --check',
    'pnpm doc-gov links',
    'pnpm doc-gov audit',
    'pnpm doc-gov verify-commit-msg',
  ]) {
    if (!content.includes(command)) {
      issues.push({
        severity: 'error',
        code: 'guardrail:incomplete-lefthook',
        message: `lefthook.yml must include: ${command}`,
      });
    }
  }

  const preCommit = join(rootDir, '.git/hooks/pre-commit');
  const commitMsg = join(rootDir, '.git/hooks/commit-msg');
  if (!hookCallsLefthook(preCommit)) {
    issues.push({
      severity: 'error',
      code: 'guardrail:lefthook-not-installed',
      message: 'lefthook.yml exists, but .git/hooks/pre-commit is not installed for lefthook.',
    });
  }
  if (!hookCallsLefthook(commitMsg)) {
    issues.push({
      severity: 'error',
      code: 'guardrail:lefthook-not-installed',
      message: 'lefthook.yml exists, but .git/hooks/commit-msg is not installed for lefthook.',
    });
  }

  return issues;
}

function checkDocsCheckWorkflow(rootDir: string): DoctorIssue[] {
  const path = join(rootDir, '.github/workflows/docs-check.yml');
  if (!existsSync(path)) {
    return [
      {
        severity: 'warning',
        code: 'guardrail:missing-docs-check-workflow',
        message:
          '.github/workflows/docs-check.yml is missing; CI does not have the standard doc-gov gate.',
      },
    ];
  }

  const content = readFileSync(path, 'utf8');
  const issues: DoctorIssue[] = [];
  for (const command of [
    'pnpm doc-gov router-check',
    'pnpm doc-gov check',
    'pnpm doc-gov scan --check',
    'pnpm doc-gov links',
    'pnpm doc-gov audit',
  ]) {
    if (!content.includes(command)) {
      issues.push({
        severity: 'error',
        code: 'guardrail:incomplete-docs-check-workflow',
        message: `.github/workflows/docs-check.yml must include: ${command}`,
      });
    }
  }
  return issues;
}

function hookCallsLefthook(path: string): boolean {
  return existsSync(path) && readFileSync(path, 'utf8').includes('lefthook');
}
