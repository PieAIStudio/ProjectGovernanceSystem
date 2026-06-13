import { isValidProfile } from '../assets';
import { planStarterFiles } from './shared';

export function runInit(args: string[]): number {
  const profile = readFlag(args, '--profile');
  const dryRun = args.includes('--dry-run');

  if (!dryRun) {
    console.error('pro-gov init requires --dry-run in this first read-only release.');
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

  console.log('pro-gov init DRY RUN');
  console.log(`profile: ${profile}`);
  console.log('');
  console.log('Planned starter files:');

  for (const file of planStarterFiles(profile)) {
    console.log(`  ${file.targetPath} <- ${file.sourcePath}`);
  }

  return 0;
}

function readFlag(args: string[], flag: string): string | null {
  const index = args.indexOf(flag);
  if (index === -1) return null;
  const value = args[index + 1];
  if (!value || value.startsWith('--')) return null;
  return value;
}
