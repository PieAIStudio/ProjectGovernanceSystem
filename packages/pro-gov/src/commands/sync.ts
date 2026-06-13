import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { planStarterFiles } from './shared';

export function runSync(args: string[]): number {
  if (!args.includes('--check')) {
    console.error('pro-gov sync requires --check in this first read-only release.');
    return 1;
  }

  let differences = 0;
  console.log('pro-gov sync check');

  for (const file of planStarterFiles()) {
    const targetPath = join(process.cwd(), file.targetPath);
    if (!existsSync(targetPath)) {
      console.log(`missing: ${file.targetPath}`);
      differences += 1;
      continue;
    }

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
