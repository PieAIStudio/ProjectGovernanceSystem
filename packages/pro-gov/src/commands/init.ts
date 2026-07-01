import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';

import { isValidProfile } from '../assets';
import { planStarterFiles } from './shared';

export function runInit(args: string[]): number {
  const profile = readFlag(args, '--profile');
  const dryRun = args.includes('--dry-run');
  const apply = args.includes('--apply');

  if (dryRun === apply) {
    console.error('pro-gov init requires exactly one of --dry-run or --apply.');
    return 1;
  }

  if (!profile) {
    console.error('Missing required flag: --profile <engineering-runtime|doc-only>');
    return 1;
  }

  if (!isValidProfile(profile)) {
    console.error(`Invalid profile: ${profile}`);
    return 1;
  }

  const files = planStarterFiles(profile).filter((file) => file.ownership !== 'optional-guardrail');
  if (apply) return applyStarterFiles(files, profile);

  console.log('pro-gov init DRY RUN');
  console.log(`profile: ${profile}`);
  console.log('');
  console.log('Planned starter files:');

  for (const file of files) {
    console.log(`  ${file.targetPath} <- ${file.sourcePath}`);
  }

  return 0;
}

function applyStarterFiles(
  files: ReturnType<typeof planStarterFiles>,
  profile: 'engineering-runtime' | 'doc-only',
): number {
  const root = process.cwd();
  const conflicts = files.filter((file) => existsSync(join(root, file.targetPath)));
  if (conflicts.length > 0) {
    console.error('pro-gov init is refusing to overwrite existing project files:');
    for (const file of conflicts) console.error(`  ${file.targetPath}`);
    console.error('No files were written. Use --dry-run and migrate existing files deliberately.');
    return 1;
  }

  for (const file of files) {
    const targetPath = join(root, file.targetPath);
    mkdirSync(dirname(targetPath), { recursive: true });
    const source = readFileSync(file.absoluteSourcePath);
    const content = file.targetPath === 'AGENTS.md'
      ? renderAgentsTemplate(source.toString('utf8'), basename(root), profile)
      : source;
    writeFileSync(targetPath, content);
  }

  console.log('pro-gov init APPLIED');
  console.log(`profile: ${profile}`);
  console.log(`created-files: ${files.length}`);
  console.log('Existing project files were not overwritten.');
  console.log('Next: customize project-local policy/current-work, run doc-gov scan, then run doc-gov doctor.');
  return 0;
}

function renderAgentsTemplate(
  template: string,
  projectName: string,
  profile: 'engineering-runtime' | 'doc-only',
): string {
  const selectedRoute = `docs/governance/agents-routing/${profile}-v0.9.md`;
  return template
    .replace('# PROJECT_NAME AI Router', `# ${projectName} AI Router`)
    .replace(
      /6\. The selected agents routing file:\n   - `docs\/governance\/agents-routing\/engineering-runtime-v0\.9\.md`, or\n   - `docs\/governance\/agents-routing\/doc-only-v0\.9\.md`/,
      `6. The selected agents routing file: \`${selectedRoute}\``,
    )
    .replace(
      '- Name this project\'s adopted profile: `engineering-runtime` or `doc-only`.',
      `- This project adopts the \`${profile}\` profile.`,
    );
}

function readFlag(args: string[], flag: string): string | null {
  const index = args.indexOf(flag);
  if (index === -1) return null;
  const value = args[index + 1];
  if (!value || value.startsWith('--')) return null;
  return value;
}
