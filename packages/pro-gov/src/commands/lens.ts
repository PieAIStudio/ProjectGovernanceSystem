import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

import { formatProjectLensInspection, renderProjectLensMarkdownReport } from '../lens/report';
import { scanProjectLensTarget } from '../lens/scan';

interface LensOptions {
  targetDir: string;
  json: boolean;
  format: 'text' | 'json';
  outPath?: string;
}

type ParseResult =
  | { ok: true; value: LensOptions }
  | { ok: false; error: string };

export function runLens(args: string[]): number {
  const [subcommand, ...rest] = args;
  if (subcommand === 'scan' || subcommand === 'inspect') {
    return runLensInspect(rest, subcommand);
  }
  if (subcommand === 'report') {
    return runLensReport(rest);
  }

  printUsage();
  return 1;
}

function runLensInspect(args: string[], subcommand: 'scan' | 'inspect'): number {
  const options = parseLensOptions(args, subcommand);
  if (!options.ok) {
    console.error(options.error);
    printUsage();
    return 1;
  }

  const report = scanProjectLensTarget(options.value.targetDir);
  if (options.value.json || options.value.format === 'json') {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(formatProjectLensInspection(report));
  }

  return 0;
}

function runLensReport(args: string[]): number {
  const options = parseLensOptions(args, 'report');
  if (!options.ok) {
    console.error(options.error);
    printUsage();
    return 1;
  }
  if (!options.value.outPath) {
    console.error('Expected --out <path>');
    printUsage();
    return 1;
  }

  const report = scanProjectLensTarget(options.value.targetDir);
  const markdown = renderProjectLensMarkdownReport(report);
  mkdirSync(dirname(options.value.outPath), { recursive: true });
  writeFileSync(options.value.outPath, markdown);
  console.log(`report: ${options.value.outPath}`);
  return 0;
}

function parseLensOptions(args: string[], subcommand: 'scan' | 'inspect' | 'report'): ParseResult {
  const options: LensOptions = {
    targetDir: process.cwd(),
    json: false,
    format: 'text',
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
      options.format = 'json';
    } else if (arg === '--format') {
      const format = args[index + 1];
      if (format !== 'text' && format !== 'json') {
        return { ok: false, error: 'Expected --format text|json' };
      }
      options.format = format;
      index += 1;
    } else if (arg === '--out') {
      const outPath = args[index + 1];
      if (!outPath) return { ok: false, error: 'Expected --out <path>' };
      options.outPath = outPath;
      index += 1;
    } else {
      return { ok: false, error: `Unknown lens ${subcommand} option: ${arg}` };
    }
  }

  return { ok: true, value: options };
}

function printUsage(): void {
  console.error('Usage: pro-gov lens scan [--target <path>] [--json]');
  console.error('Usage: pro-gov lens inspect [--target <path>] [--format text|json]');
  console.error('Usage: pro-gov lens report --target <path> --out <path>');
}
