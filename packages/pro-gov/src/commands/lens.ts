import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

import {
  checkProjectLensAuditPackage,
  createProjectLensAuditPackage,
  formatProjectLensAuditCheckText,
  type ProjectLensAuditRunMode,
} from '../lens/audit';
import { formatProjectLensInspection, renderProjectLensMarkdownReport } from '../lens/report';
import { scanProjectLensTarget } from '../lens/scan';

interface LensOptions {
  targetDir: string;
  json: boolean;
  format: 'text' | 'json';
  outPath?: string;
  auditDir?: string;
  auditMode?: ProjectLensAuditRunMode;
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
  if (subcommand === 'audit') {
    return runLensAudit(rest);
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

function runLensAudit(args: string[]): number {
  const [auditSubcommand, ...rest] = args;
  if (auditSubcommand === 'init') {
    const options = parseLensOptions(rest, 'audit init');
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
    createProjectLensAuditPackage(options.value.targetDir, options.value.outPath);
    console.log(`audit: ${options.value.outPath}`);
    return 0;
  }

  if (auditSubcommand === 'check') {
    const options = parseLensOptions(rest, 'audit check');
    if (!options.ok) {
      console.error(options.error);
      printUsage();
      return 1;
    }
    if (!options.value.auditDir) {
      console.error('Expected --dir <path>');
      printUsage();
      return 1;
    }
    const result = checkProjectLensAuditPackage(options.value.auditDir, { mode: options.value.auditMode });
    if (options.value.json || options.value.format === 'json') {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(formatProjectLensAuditCheckText(result));
    }
    return result.ok ? 0 : 1;
  }

  printUsage();
  return 1;
}

function parseLensOptions(
  args: string[],
  subcommand: 'scan' | 'inspect' | 'report' | 'audit init' | 'audit check',
): ParseResult {
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
    } else if (arg === '--dir') {
      const auditDir = args[index + 1];
      if (!auditDir) return { ok: false, error: 'Expected --dir <path>' };
      options.auditDir = auditDir;
      index += 1;
    } else if (arg === '--mode') {
      if (subcommand !== 'audit check') {
        return { ok: false, error: `Unknown lens ${subcommand} option: ${arg}` };
      }
      const auditMode = args[index + 1];
      if (auditMode !== 'fresh' && auditMode !== 'reuse') {
        return { ok: false, error: 'Expected --mode fresh|reuse' };
      }
      options.auditMode = auditMode;
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
  console.error('Usage: pro-gov lens audit init --target <path> --out <path>');
  console.error('Usage: pro-gov lens audit check --dir <path> [--mode fresh|reuse] [--json]');
}
