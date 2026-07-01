const EXTERNAL_ARTIFACT_PREFIXES = [
  'docs/brainstorms/',
  'docs/solutions/',
  'docs/pulse-reports/',
] as const;

export function isExternalArtifactPath(repoPath: string): boolean {
  if (EXTERNAL_ARTIFACT_PREFIXES.some((prefix) => repoPath.startsWith(prefix))) {
    return true;
  }

  if (
    repoPath.startsWith('docs/plans/') &&
    repoPath !== 'docs/plans/active' &&
    !repoPath.startsWith('docs/plans/active/') &&
    repoPath !== 'docs/plans/completed' &&
    !repoPath.startsWith('docs/plans/completed/')
  ) {
    return true;
  }

  return false;
}
