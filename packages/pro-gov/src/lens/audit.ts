import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';

export interface ProjectLensAuditContract {
  version: 1;
  target: {
    path: string;
    name: string;
  };
  requiredArtifacts: string[];
}

export type ProjectLensAuditRunMode = 'fresh' | 'reuse';

export interface ProjectLensAuditCheckOptions {
  mode?: ProjectLensAuditRunMode;
}

export interface ProjectLensAuditCheckIssue {
  type:
    | 'missing-contract'
    | 'invalid-contract'
    | 'missing-required-artifact'
    | 'artifact-not-complete'
    | 'artifact-template-not-replaced'
    | 'audit-method-not-recorded';
  path: string;
  message?: string;
}

export interface ProjectLensAuditCheckResult {
  ok: boolean;
  auditDir: string;
  issues: ProjectLensAuditCheckIssue[];
}

const REQUIRED_ARTIFACTS = [
  'manifest.md',
  'raw/project-lens/architecture-lens.md',
  'raw/project-lens/truth-surface-audit.md',
  'raw/project-lens/technology-strategy.md',
  'raw/ponytail/ponytail-audit.md',
  'raw/ponytail/ponytail-debt.md',
  'raw/ponytail/ponytail-gain.md',
  'raw/target/target-state.md',
  'raw/target/commands.md',
  'raw/target/sources.md',
  'synthesis/decision-index.md',
  'synthesis/handoff-for-implementation-ai.md',
] as const;

type AuditArtifactPath = (typeof REQUIRED_ARTIFACTS)[number];
type AuditMethodRecordRule = { label: string; match: RegExp };

export function createProjectLensAuditPackage(targetDir: string, auditDir: string): ProjectLensAuditContract {
  const contract: ProjectLensAuditContract = {
    version: 1,
    target: {
      path: targetDir,
      name: basename(targetDir) || 'target',
    },
    requiredArtifacts: [...REQUIRED_ARTIFACTS],
  };

  mkdirSync(auditDir, { recursive: true });
  writeJson(join(auditDir, 'audit.contract.json'), contract);
  for (const artifactPath of REQUIRED_ARTIFACTS) {
    writeTemplate(join(auditDir, artifactPath), renderArtifactTemplate(artifactPath, contract));
  }

  return contract;
}

export function checkProjectLensAuditPackage(
  auditDir: string,
  options: ProjectLensAuditCheckOptions = {},
): ProjectLensAuditCheckResult {
  const contractPath = join(auditDir, 'audit.contract.json');
  if (!existsSync(contractPath)) {
    return {
      ok: false,
      auditDir,
      issues: [
        {
          type: 'missing-contract',
          path: 'audit.contract.json',
        },
      ],
    };
  }

  let contract: ProjectLensAuditContract;
  try {
    contract = JSON.parse(readFileSync(contractPath, 'utf8')) as ProjectLensAuditContract;
  } catch (error) {
    return {
      ok: false,
      auditDir,
      issues: [
        {
          type: 'invalid-contract',
          path: 'audit.contract.json',
          message: error instanceof Error ? error.message : 'Invalid JSON',
        },
      ],
    };
  }

  const issues: ProjectLensAuditCheckIssue[] = [];
  if (contract.version !== 1 || !Array.isArray(contract.requiredArtifacts)) {
    issues.push({
      type: 'invalid-contract',
      path: 'audit.contract.json',
      message: 'Expected version 1 and requiredArtifacts array',
    });
  } else {
    for (const artifactPath of REQUIRED_ARTIFACTS) {
      if (!contract.requiredArtifacts.includes(artifactPath)) {
        issues.push({
          type: 'invalid-contract',
          path: 'audit.contract.json',
          message: `Missing required artifact in contract: ${artifactPath}`,
        });
      }
    }
  }

  for (const artifactPath of REQUIRED_ARTIFACTS) {
    const absolutePath = join(auditDir, artifactPath);
    if (!existsSync(absolutePath)) {
      issues.push({ type: 'missing-required-artifact', path: artifactPath });
      continue;
    }
    const content = readFileSync(absolutePath, 'utf8');
    if (isPendingArtifact(content)) {
      issues.push({ type: 'artifact-not-complete', path: artifactPath });
    } else if (hasTemplateBody(content)) {
      issues.push({ type: 'artifact-template-not-replaced', path: artifactPath });
    } else {
      issues.push(...checkArtifactGuardrails(artifactPath, content, options.mode));
    }
  }

  return {
    ok: issues.length === 0,
    auditDir,
    issues,
  };
}

function writeJson(path: string, value: unknown): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function writeTemplate(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

function renderArtifactTemplate(artifactPath: AuditArtifactPath, contract: ProjectLensAuditContract): string {
  const title = artifactPath
    .replace(/\.md$/, '')
    .split('/')
    .map((part) => part.replaceAll('-', ' '))
    .join(' / ');
  const producer = artifactProducer(artifactPath);
  return `${[
    '---',
    'status: pending',
    `producer: ${producer}`,
    `target: ${contract.target.path}`,
    `artifact: ${artifactPath}`,
    '---',
    '',
    `# ${title}`,
    '',
    'Replace this template with the raw audit output for this producer.',
    ...renderArtifactGuardrailHint(artifactPath),
    '',
    'Required completion marker:',
    '',
    '```text',
    'status: complete',
    '```',
  ].join('\n')}\n`;
}

function renderArtifactGuardrailHint(artifactPath: AuditArtifactPath): string[] {
  const rules = REQUIRED_METHOD_RECORDS[artifactPath];
  if (!rules) return [];
  const lines = [
    '',
    'Required audit method records. Keep these labels at the start of their own lines:',
    '',
    ...rules.map((rule) => `${rule.label} <replace with evidence>`),
  ];
  if (artifactPath === 'manifest.md') {
    lines.push(
      '',
      'For --mode fresh, also keep these labels at the start of their own lines:',
      '',
      'Audit run mode: <replace with fresh>',
      'Current session id: <replace with current Codex thread id, or unknown plus reason>',
      'Fresh run evidence: <replace with current-run raw pass and subagent evidence>',
      '',
      'For --mode reuse, use these labels instead of the fresh-mode labels:',
      '',
      'Audit run mode: <replace with reuse>',
      'Reuse source audit: <replace with reused audit package path>',
      'Reuse justification: <replace with same target commit, clean status, and check result>',
      'No new subagents were run: <replace with true and explanation>',
    );
  }
  return lines;
}

function artifactProducer(artifactPath: string): string {
  if (artifactPath.startsWith('raw/project-lens/')) return 'project-lens';
  if (artifactPath.startsWith('raw/ponytail/')) return 'ponytail';
  if (artifactPath.startsWith('raw/target/')) return 'target-evidence';
  if (artifactPath.startsWith('synthesis/')) return 'synthesis';
  return 'audit';
}

function isPendingArtifact(content: string): boolean {
  const frontmatter = content.match(/^---\n([\s\S]*?)\n---\n/);
  if (!frontmatter) return true;
  return !/^status:\s*complete\s*$/m.test(frontmatter[1]);
}

function hasTemplateBody(content: string): boolean {
  return content.includes('Replace this template with the raw audit output for this producer.');
}

const REQUIRED_METHOD_RECORDS: Partial<Record<AuditArtifactPath, AuditMethodRecordRule[]>> = {
  'manifest.md': [
    {
      label: 'Read-only boundary:',
      match: /^Read-only boundary:/im,
    },
    {
      label: 'Agent execution record:',
      match: /^Agent execution record:/im,
    },
    {
      label: 'Subagent trace:',
      match: /^Subagent trace:/im,
    },
  ],
  'raw/target/commands.md': [
    {
      label: 'Project Lens method source:',
      match: /^Project Lens method source:/im,
    },
    {
      label: 'Ponytail method source:',
      match: /^Ponytail method source:/im,
    },
  ],
  'synthesis/decision-index.md': [
    {
      label: 'Target repository final status:',
      match: /^Target repository final status:/im,
    },
    {
      label: 'Audit package final status:',
      match: /^Audit package final status:/im,
    },
  ],
};

const RUN_MODE_METHOD_RECORDS: Record<ProjectLensAuditRunMode, AuditMethodRecordRule[]> = {
  fresh: [
    {
      label: 'Audit run mode: fresh',
      match: /^Audit run mode:\s*fresh\b/im,
    },
    {
      label: 'Current session id:',
      match: /^Current session id:/im,
    },
    {
      label: 'Fresh run evidence:',
      match: /^Fresh run evidence:/im,
    },
  ],
  reuse: [
    {
      label: 'Audit run mode: reuse',
      match: /^Audit run mode:\s*reuse\b/im,
    },
    {
      label: 'Reuse source audit:',
      match: /^Reuse source audit:/im,
    },
    {
      label: 'Reuse justification:',
      match: /^Reuse justification:/im,
    },
    {
      label: 'No new subagents were run:',
      match: /^No new subagents were run:/im,
    },
  ],
};

function checkArtifactGuardrails(
  artifactPath: AuditArtifactPath,
  content: string,
  mode?: ProjectLensAuditRunMode,
): ProjectLensAuditCheckIssue[] {
  const rules = [
    ...(REQUIRED_METHOD_RECORDS[artifactPath] ?? []),
    ...(artifactPath === 'manifest.md' && mode ? RUN_MODE_METHOD_RECORDS[mode] : []),
  ];
  if (!rules) return [];
  return rules
    .filter((rule) => !hasCompletedMethodRecord(rule, content))
    .map((rule) => ({
      type: 'audit-method-not-recorded' as const,
      path: artifactPath,
      message: `Missing required audit method record: ${rule.label}`,
    }));
}

function hasCompletedMethodRecord(rule: AuditMethodRecordRule, content: string): boolean {
  return content
    .split(/\r?\n/)
    .some((line) => rule.match.test(line) && !line.includes('<replace with'));
}

export function formatProjectLensAuditCheckText(result: ProjectLensAuditCheckResult): string {
  if (result.ok) return `audit package ok: ${result.auditDir}`;
  return [
    `audit package failed: ${result.auditDir}`,
    ...result.issues.map((issue) => {
      const message = issue.message ? `: ${issue.message}` : '';
      return `- ${issue.type}: ${issue.path}${message}`;
    }),
  ].join('\n');
}
