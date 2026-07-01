import { listAssets } from '../assets';

export type ProGovProfile = 'engineering-runtime' | 'doc-only';

export interface PlannedFile {
  sourcePath: string;
  targetPath: string;
  absoluteSourcePath: string;
  ownership: 'shared' | 'project-local-seed' | 'optional-guardrail';
}

export function planStarterFiles(profile?: ProGovProfile): PlannedFile[] {
  return listAssets()
    .flatMap((asset) => {
      const targetPath = starterTargetPath(asset.path);
      if (!targetPath) return [];
      if (profile && isOtherProfileRouting(targetPath, profile)) return [];
      return [
        {
          sourcePath: asset.path,
          targetPath,
          absoluteSourcePath: asset.absolutePath,
          ownership: classifyOwnership(targetPath),
        },
      ];
    })
    .sort((a, b) => a.targetPath.localeCompare(b.targetPath));
}

function classifyOwnership(targetPath: string): PlannedFile['ownership'] {
  if (
    targetPath === 'lefthook.yml' ||
    targetPath === '.github/workflows/docs-check.yml'
  ) {
    return 'optional-guardrail';
  }
  if (
    targetPath === 'AGENTS.md' ||
    targetPath === 'CLAUDE.md' ||
    targetPath === 'docs/policy/best-practice-for-this-project.md' ||
    targetPath === 'docs/reference/documentation-map.md' ||
    targetPath === 'docs/reference/execution/current-work.md'
  ) {
    return 'project-local-seed';
  }
  return 'shared';
}

function isOtherProfileRouting(targetPath: string, profile: ProGovProfile): boolean {
  return (
    targetPath.startsWith('docs/governance/agents-routing/') &&
    targetPath !== `docs/governance/agents-routing/${profile}-v0.9.md`
  );
}

function starterTargetPath(sourcePath: string): string | null {
  if (sourcePath === 'starter/AGENTS.template.md') return 'AGENTS.md';
  if (sourcePath === 'starter/CLAUDE.template.md') return 'CLAUDE.md';
  if (sourcePath === 'starter/lefthook.template.yml') return 'lefthook.yml';
  if (!sourcePath.startsWith('starter/')) return null;
  return sourcePath.slice('starter/'.length);
}
