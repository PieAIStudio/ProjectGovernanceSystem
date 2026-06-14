import type { ProjectLensScanReport } from './scan';

export function formatProjectLensInspection(report: ProjectLensScanReport): string {
  return [
    `target: ${report.targetDir}`,
    `ai-entry-files: ${formatList(report.aiEntryFiles)}`,
    `package-scripts: ${formatList(report.packageJson?.scripts ?? [])}`,
    `dependencies: ${formatList(report.packageJson?.dependencies ?? [])}`,
    `dev-dependencies: ${formatList(report.packageJson?.devDependencies ?? [])}`,
    `docs-directory: ${report.docs.hasDocsDirectory ? 'yes' : 'no'}`,
    `markdown-files: ${report.docs.markdownFileCount}`,
    `governance-files: ${formatList(report.docs.governanceFiles)}`,
    `git: ${report.git.available ? 'available' : 'unavailable'}`,
    `git-branch: ${report.git.branch ?? 'unknown'}`,
    `git-head: ${report.git.head ?? 'unknown'}`,
    `large-files: ${report.largeFiles.length}`,
  ].join('\n');
}

export function renderProjectLensMarkdownReport(report: ProjectLensScanReport): string {
  return `${[
    '# Project Lens Evidence Report',
    '',
    `- Target: \`${report.targetDir}\``,
    `- Generated: ${new Date().toISOString()}`,
    '- Scope: local read-only evidence for AI-assisted project review',
    '',
    '## AI Entry Files',
    '',
    bulletList(report.aiEntryFiles),
    '',
    '## Package',
    '',
    `- Scripts: ${formatList(report.packageJson?.scripts ?? [])}`,
    `- Dependencies: ${formatList(report.packageJson?.dependencies ?? [])}`,
    `- Dev dependencies: ${formatList(report.packageJson?.devDependencies ?? [])}`,
    '',
    '## Docs',
    '',
    `- Docs directory: ${report.docs.hasDocsDirectory ? 'yes' : 'no'}`,
    `- Markdown files: ${report.docs.markdownFileCount}`,
    `- Governance files: ${formatList(report.docs.governanceFiles)}`,
    '',
    '## Git',
    '',
    `- Available: ${report.git.available ? 'yes' : 'no'}`,
    `- Branch: ${report.git.branch ?? 'unknown'}`,
    `- Head: ${report.git.head ?? 'unknown'}`,
    '',
    '## Large Files',
    '',
    report.largeFiles.length === 0
      ? '- none'
      : report.largeFiles.map((file) => `- \`${file.path}\` (${file.bytes} bytes)`).join('\n'),
    '',
    '## Review Notes',
    '',
    '- This report is evidence only; it does not replace human or AI judgement.',
    '- Use the ProjectLens skills for interpretation, tradeoff analysis, and recommendations.',
  ].join('\n')}\n`;
}

function formatList(values: readonly string[]): string {
  return values.length === 0 ? 'none' : values.join(', ');
}

function bulletList(values: readonly string[]): string {
  if (values.length === 0) return '- none';
  return values.map((value) => `- \`${value}\``).join('\n');
}
