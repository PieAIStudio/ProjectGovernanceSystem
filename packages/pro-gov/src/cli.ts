import { runAssets } from './commands/assets';
import { runDoctor } from './commands/doctor';
import { runHostHook } from './commands/host-hook';
import { runInit } from './commands/init';
import { runLearn } from './commands/learn';
import { runLens } from './commands/lens';
import { runPortfolio } from './commands/portfolio';
import { runSync } from './commands/sync';

const COMMANDS = [
  'assets list [--json] [--visibility public|private|third-party|all]',
  'assets discover [--target <path>] [--json]',
  'assets recommend [--target <path>] [--json]',
  'assets plan --bundle <bundle-id> [--target <path>] [--json]',
  'assets apply --plan <path>',
  'assets check [--target <path>] [--strict-registry] [--json]',
  'assets public-check [--public-root <path>] [--private-root <path>] [--json]',
  'assets npx add|update ... --plan',
  'portfolio check --config <path> [--json]',
  'portfolio plan --config <path> [--target <id|all>] [--json]',
  'portfolio assets-check --config <path> [--target <id|all>] [--json]',
  'portfolio doctor --config <path> [--target <id|all>] [--json]',
  'learn recall --query <text> [--target <path>] [--limit <n>] [--json]',
  'lens scan [--target <path>] [--json]',
  'lens inspect [--target <path>] [--format text|json]',
  'lens report --target <path> --out <path>',
  'lens audit init --target <path> --out <path>',
  'lens audit check --dir <path> [--json]',
  'host-hook --host <codex|claude-code|antigravity> --event <Stop|SubagentStop|...>',
  'init --profile <engineering-runtime|doc-only> <--dry-run|--apply>',
  'sync --check [--profile <engineering-runtime|doc-only>]',
  'doctor',
] as const;

const [command, subcommand] = process.argv.slice(2);

process.exitCode = await main();

async function main(): Promise<number> {
  if (!command || command === '--help' || command === '-h') {
    printHelp();
    return command ? 0 : 1;
  }
  if (command === 'assets') return runAssets(process.argv.slice(3));
  if (command === 'learn') return runLearn(process.argv.slice(3));
  if (command === 'lens') return runLens(process.argv.slice(3));
  if (command === 'portfolio') return runPortfolio(process.argv.slice(3));
  if (command === 'host-hook') return runHostHook(process.argv.slice(3));
  if (command === 'init') return runInit(process.argv.slice(3));
  if (command === 'sync') return runSync(process.argv.slice(3));
  if (command === 'doctor') return runDoctor(process.argv.slice(3));

  console.error(`Unknown command: ${[command, subcommand].filter(Boolean).join(' ')}`);
  printHelp();
  return 1;
}

function printHelp(): void {
  console.log('pro-gov — project-level distribution kit for Project Governance System');
  console.log('');
  console.log('Usage: pro-gov <command> [args...]');
  console.log('');
  console.log('Commands:');
  for (const command of COMMANDS) {
    console.log(`  ${command}`);
  }
}
