import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { checkRouterIntegrity } from '../core/router-integrity';

type Profile = 'engineering-runtime' | 'doc-only';

const PROFILE_ROUTES: Record<Profile, string> = {
  'engineering-runtime': 'docs/governance/agents-routing/engineering-runtime-v0.9.md',
  'doc-only': 'docs/governance/agents-routing/doc-only-v0.9.md',
};

export function runMigrate(args: string[]): number {
  const checkOnly = args.includes('--check');
  const apply = args.includes('--apply');
  const profile = parseProfile(args);

  if (!profile) {
    console.error('Usage: doc-gov migrate --profile <engineering-runtime|doc-only> --check');
    return 1;
  }

  if (apply) {
    console.error('doc-gov migrate --apply is not implemented yet. Run --check first.');
    return 1;
  }

  if (!checkOnly) {
    console.error('doc-gov migrate currently supports --check only.');
    return 1;
  }

  const issues = checkMigrationReadiness(process.cwd(), profile);
  if (issues.length > 0) {
    for (const issue of issues) console.error(issue);
    console.error(`doc-gov migrate --check failed for profile: ${profile}`);
    return 1;
  }

  console.log(`doc-gov migrate --check passed for profile: ${profile}`);
  return 0;
}

export function checkMigrationReadiness(rootDir: string, profile: Profile): string[] {
  const issues: string[] = [];
  const router = checkRouterIntegrity(rootDir);
  for (const issue of router.issues) {
    issues.push(`${issue.file}: ${issue.code}: ${issue.message}`);
  }

  const route = PROFILE_ROUTES[profile];
  if (!existsSync(join(rootDir, route))) {
    issues.push(`missing selected profile route: ${route}`);
  }

  const agentsPath = join(rootDir, 'AGENTS.md');
  if (existsSync(agentsPath) && !readFileSync(agentsPath, 'utf8').includes(route)) {
    issues.push(`AGENTS.md must name selected profile route: ${route}`);
  }

  return issues;
}

function parseProfile(args: string[]): Profile | undefined {
  const index = args.indexOf('--profile');
  const value = index >= 0 ? args[index + 1] : undefined;
  if (value === 'engineering-runtime' || value === 'doc-only') return value;
  return undefined;
}
