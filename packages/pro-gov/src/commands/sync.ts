import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { isValidProfile } from '../assets';
import type { ProGovProfile } from './shared';
import { planStarterFiles } from './shared';

export function runSync(args: string[]): number {
  if (!args.includes('--check')) {
    console.error('pro-gov sync is read-only and requires --check.');
    return 1;
  }

  const requestedProfile = readFlag(args, '--profile');
  let profile: ProGovProfile | undefined;
  if (requestedProfile) {
    if (!isValidProfile(requestedProfile)) {
      console.error(`Invalid profile: ${requestedProfile}`);
      return 1;
    }
    profile = requestedProfile;
  } else {
    profile = inferInstalledProfile(process.cwd());
  }
  if (!profile) {
    console.error(
      'Cannot infer one installed profile. Pass --profile <engineering-runtime|doc-only>.',
    );
    return 1;
  }

  let differences = 0;
  console.log('pro-gov sync check');
  console.log(`profile: ${profile}`);

  for (const file of planStarterFiles(profile)) {
    const targetPath = join(process.cwd(), file.targetPath);
    if (!existsSync(targetPath)) {
      if (file.ownership === 'optional-guardrail') continue;
      console.log(`missing: ${file.targetPath}`);
      differences += 1;
      continue;
    }

    if (file.ownership === 'project-local-seed') continue;

    const source = readFileSync(file.absoluteSourcePath, 'utf8');
    const target = readFileSync(targetPath, 'utf8');
    if (source !== target) {
      console.log(`different: ${file.targetPath}`);
      differences += 1;
    }
  }

  if (differences > 0) {
    console.error(`sync check found ${differences} difference(s).`);
    return 1;
  }

  console.log('sync check passed: starter files match packaged assets.');
  return 0;
}

function inferInstalledProfile(root: string): ProGovProfile | undefined {
  const installed = (['engineering-runtime', 'doc-only'] as const).filter((profile) =>
    existsSync(join(root, `docs/governance/agents-routing/${profile}-v0.9.md`)),
  );
  return installed.length === 1 ? installed[0] : undefined;
}

function readFlag(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  const value = index >= 0 ? args[index + 1] : undefined;
  return value && !value.startsWith('--') ? value : undefined;
}
