import { listAssets } from '../assets';

export type ProGovProfile = 'engineering-runtime' | 'doc-only';

export interface PlannedFile {
  sourcePath: string;
  targetPath: string;
  absoluteSourcePath: string;
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
        },
      ];
    })
    .sort((a, b) => a.targetPath.localeCompare(b.targetPath));
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
