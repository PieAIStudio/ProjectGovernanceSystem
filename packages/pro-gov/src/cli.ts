import { runAssets } from './commands/assets';
import { runDoctor } from './commands/doctor';
import { runInit } from './commands/init';
import { runSync } from './commands/sync';

const COMMANDS = [
  'assets list [--json] [--visibility public|private|third-party|all]',
  'assets recommend [--target <path>] [--json]',
  'assets plan --bundle <bundle-id> [--target <path>] [--json]',
  'init --profile <engineering-runtime|doc-only> --dry-run',
  'sync --check',
  'doctor',
] as const;

const [command, subcommand] = process.argv.slice(2);

if (!command || command === '--help' || command === '-h') {
  printHelp();
  process.exitCode = command ? 0 : 1;
} else if (command === 'assets') {
  process.exitCode = runAssets(process.argv.slice(3));
} else if (command === 'init') {
  process.exitCode = runInit(process.argv.slice(3));
} else if (command === 'sync') {
  process.exitCode = runSync(process.argv.slice(3));
} else if (command === 'doctor') {
  process.exitCode = runDoctor(process.argv.slice(3));
} else {
  console.error(`Unknown command: ${[command, subcommand].filter(Boolean).join(' ')}`);
  printHelp();
  process.exitCode = 1;
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
