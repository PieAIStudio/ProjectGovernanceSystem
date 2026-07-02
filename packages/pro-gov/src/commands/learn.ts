import { recallLearnings } from '../learning/recall';

interface LearnRecallOptions {
  readonly targetDir: string;
  readonly query: string;
  readonly limit: number;
  readonly json: boolean;
}

export function runLearn(args: string[]): number {
  const [subcommand, ...rest] = args;
  if (subcommand === 'recall') return runLearnRecall(rest);
  printUsage();
  return 1;
}

function runLearnRecall(args: string[]): number {
  const options = parseRecallOptions(args);
  if (!options.ok) {
    console.error(options.error);
    printUsage();
    return 1;
  }

  const result = recallLearnings(options.value.targetDir, {
    query: options.value.query,
    limit: options.value.limit,
  });

  if (options.value.json) {
    console.log(JSON.stringify(result, null, 2));
    return 0;
  }

  console.log(`Learning Recall: ${result.hits.length} hit${result.hits.length === 1 ? '' : 's'}`);
  for (const hit of result.hits) {
    console.log(`${hit.relativePath}\t${hit.score}\t${hit.title}`);
    if (hit.summary) console.log(`  ${hit.summary}`);
  }
  if (result.hits.length === 0) {
    console.log('No relevant learning records found.');
  }
  return 0;
}

function parseRecallOptions(args: string[]): { ok: true; value: LearnRecallOptions } | { ok: false; error: string } {
  let targetDir = process.cwd();
  let query = '';
  let limit = 5;
  let json = false;
  const positional: string[] = [];

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--target') {
      const value = readFlagValue(args, index, '--target');
      if (!value.ok) return value;
      targetDir = value.value;
      index += 1;
    } else if (arg === '--query') {
      const value = readFlagValue(args, index, '--query');
      if (!value.ok) return value;
      query = value.value;
      index += 1;
    } else if (arg === '--limit') {
      const parsed = readFlagValue(args, index, '--limit');
      if (!parsed.ok) return parsed;
      const value = Number.parseInt(parsed.value, 10);
      if (!Number.isFinite(value) || value < 1) return { ok: false, error: '--limit must be a positive integer' };
      limit = value;
      index += 1;
    } else if (arg === '--json') {
      json = true;
    } else if (arg === '--help' || arg === '-h') {
      return { ok: false, error: 'Usage requested' };
    } else if (arg.startsWith('--')) {
      return { ok: false, error: `Unknown option: ${arg}` };
    } else {
      positional.push(arg);
    }
  }

  if (!query && positional.length > 0) {
    query = positional.join(' ');
  }
  if (!query.trim()) {
    return { ok: false, error: 'Missing required --query <text>' };
  }

  return { ok: true, value: { targetDir, query, limit, json } };
}

function readFlagValue(args: string[], index: number, flag: string): { ok: true; value: string } | { ok: false; error: string } {
  const value = args[index + 1];
  if (!value || value.startsWith('--')) {
    return { ok: false, error: `Missing value for ${flag}` };
  }
  return { ok: true, value };
}

function printUsage(): void {
  console.error('Usage: pro-gov learn recall --query <text> [--target <path>] [--limit <n>] [--json]');
}
