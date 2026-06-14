import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

export interface ProjectLensScanOptions {
  largeFileBytes?: number;
}

export interface ProjectLensScanReport {
  targetDir: string;
  aiEntryFiles: string[];
  packageJson?: {
    scripts: string[];
    dependencies: string[];
    devDependencies: string[];
  };
  docs: {
    hasDocsDirectory: boolean;
    markdownFileCount: number;
    governanceFiles: string[];
  };
  git: {
    available: boolean;
    branch?: string;
    head?: string;
    statusShort?: string;
  };
  largeFiles: Array<{
    path: string;
    bytes: number;
  }>;
}

const ignoredDirectories = new Set([
  '.git',
  '.next',
  '.turbo',
  'dist',
  'node_modules',
  'coverage',
]);

export function scanProjectLensTarget(
  targetDir: string,
  options: ProjectLensScanOptions = {},
): ProjectLensScanReport {
  const largeFileBytes = options.largeFileBytes ?? 50_000;
  const files = listProjectFiles(targetDir);
  const markdownFiles = files.filter((file) => file.endsWith('.md'));
  const packageJson = readPackageJson(targetDir);

  return {
    targetDir,
    aiEntryFiles: ['AGENTS.md', 'CLAUDE.md', 'GEMINI.md'].filter((file) =>
      existsSync(join(targetDir, file)),
    ),
    packageJson,
    docs: {
      hasDocsDirectory: existsSync(join(targetDir, 'docs')),
      markdownFileCount: markdownFiles.length,
      governanceFiles: markdownFiles
        .filter((file) => file.startsWith('docs/governance/') || file.startsWith('docs/policy/'))
        .sort(),
    },
    git: readGitState(targetDir),
    largeFiles: files
      .map((file) => ({ path: file, bytes: statSync(join(targetDir, file)).size }))
      .filter((file) => file.bytes >= largeFileBytes)
      .sort((a, b) => b.bytes - a.bytes || a.path.localeCompare(b.path))
      .slice(0, 25),
  };
}

function readPackageJson(targetDir: string): ProjectLensScanReport['packageJson'] {
  const packageJsonPath = join(targetDir, 'package.json');
  if (!existsSync(packageJsonPath)) return undefined;
  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
      scripts?: Record<string, string>;
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    return {
      scripts: Object.keys(packageJson.scripts ?? {}).sort(),
      dependencies: Object.keys(packageJson.dependencies ?? {}).sort(),
      devDependencies: Object.keys(packageJson.devDependencies ?? {}).sort(),
    };
  } catch {
    return undefined;
  }
}

function readGitState(targetDir: string): ProjectLensScanReport['git'] {
  const branch = runGit(targetDir, ['rev-parse', '--abbrev-ref', 'HEAD']);
  if (!branch.ok) return { available: false };
  const head = runGit(targetDir, ['log', '-1', '--format=%H %s']);
  const status = runGit(targetDir, ['status', '-sb']);
  return {
    available: true,
    branch: branch.stdout,
    head: head.ok ? head.stdout : undefined,
    statusShort: status.ok ? status.stdout : undefined,
  };
}

function runGit(targetDir: string, args: string[]): { ok: true; stdout: string } | { ok: false } {
  const result = spawnSync('git', ['-C', targetDir, ...args], {
    encoding: 'utf8',
  });
  if (result.status !== 0) return { ok: false };
  return { ok: true, stdout: result.stdout.trim() };
}

function listProjectFiles(targetDir: string): string[] {
  const files: string[] = [];
  collectFiles(targetDir, targetDir, files);
  return files.sort();
}

function collectFiles(rootDir: string, currentDir: string, files: string[]): void {
  if (!existsSync(currentDir)) return;
  for (const entry of readdirSync(currentDir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (ignoredDirectories.has(entry.name)) continue;
      collectFiles(rootDir, join(currentDir, entry.name), files);
    } else if (entry.isFile()) {
      files.push(toUnixPath(relative(rootDir, join(currentDir, entry.name))));
    }
  }
}

function toUnixPath(path: string): string {
  return path.replaceAll('\\', '/');
}
