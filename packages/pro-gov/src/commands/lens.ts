import { scanProjectLensTarget } from '../lens/scan';

interface LensScanOptions {
  targetDir: string;
  json: boolean;
}

type ParseResult =
  | { ok: true; value: LensScanOptions }
  | { ok: false; error: string };

export function runLens(args: string[]): number {
  const [subcommand, ...rest] = args;
  if (subcommand !== 'scan') {
    printUsage();
    return 1;
  }

  const options = parseScanOptions(rest);
  if (!options.ok) {
    console.error(options.error);
    printUsage();
    return 1;
  }

  const report = scanProjectLensTarget(options.value.targetDir);
  if (options.value.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`target: ${report.targetDir}`);
    console.log(`ai-entry-files: ${report.aiEntryFiles.join(', ') || 'none'}`);
    console.log(`markdown-files: ${report.docs.markdownFileCount}`);
    console.log(`git: ${report.git.available ? 'available' : 'unavailable'}`);
    console.log(`large-files: ${report.largeFiles.length}`);
  }

  return 0;
}

function parseScanOptions(args: string[]): ParseResult {
  const options: LensScanOptions = {
    targetDir: process.cwd(),
    json: false,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--target') {
      const targetDir = args[index + 1];
      if (!targetDir) return { ok: false, error: 'Expected --target <path>' };
      options.targetDir = targetDir;
      index += 1;
    } else if (arg === '--json') {
      options.json = true;
    } else {
      return { ok: false, error: `Unknown lens scan option: ${arg}` };
    }
  }

  return { ok: true, value: options };
}

function printUsage(): void {
  console.error('Usage: pro-gov lens scan [--target <path>] [--json]');
}
