import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface TargetSignals {
  targetDir: string;
  hasPackageJson: boolean;
  hasAgentEntry: boolean;
  frontendSignals: string[];
  researchSignals: string[];
  writingSignals: string[];
}

export interface BundleRecommendation {
  bundleId: string;
  confidence: 'high' | 'medium';
  reasons: string[];
}

const frontendPackages = new Set([
  '@vitejs/plugin-react',
  'astro',
  'next',
  'nuxt',
  'react',
  'svelte',
  'tailwindcss',
  'vite',
  'vue',
]);

const agentEntryCandidates = ['AGENTS.md', 'CLAUDE.md', '.gemini/settings.json', 'GEMINI.md'] as const;

export function discoverTargetSignals(targetDir: string): TargetSignals {
  const packageJson = readJson(join(targetDir, 'package.json')) as
    | { dependencies?: Record<string, string>; devDependencies?: Record<string, string> }
    | undefined;
  const dependencyNames = packageJson
    ? Object.keys({ ...packageJson.dependencies, ...packageJson.devDependencies })
    : [];

  const frontendSignals = dependencyNames.filter((name) => frontendPackages.has(name)).sort();
  const hasAgentEntry = agentEntryCandidates.some((file) => existsSync(join(targetDir, file)));
  const researchSignals = [
    existsSync(join(targetDir, 'docs/research')) ? 'docs/research' : '',
    existsSync(join(targetDir, 'research')) ? 'research' : '',
    hasBookChildDirectory(targetDir, 'research') ? 'books/*/research' : '',
    textFileIncludes(join(targetDir, 'README.md'), ['research', '调研']) ? 'README research' : '',
  ].filter(Boolean);
  const writingSignals = [
    existsSync(join(targetDir, 'chapters')) ? 'chapters' : '',
    existsSync(join(targetDir, 'src/chapters')) ? 'src/chapters' : '',
    hasBookChildDirectory(targetDir, 'chapters') ? 'books/*/chapters' : '',
    textFileIncludes(join(targetDir, 'AGENTS.md'), ['writing mode', 'novel chapter', 'book content'])
      ? 'AGENTS writing'
      : '',
  ].filter(Boolean);

  return {
    targetDir,
    hasPackageJson: Boolean(packageJson),
    hasAgentEntry,
    frontendSignals,
    researchSignals,
    writingSignals,
  };
}

export function recommendBundlesForTarget(targetDir: string): BundleRecommendation[] {
  const signals = discoverTargetSignals(targetDir);
  const recommendations: BundleRecommendation[] = [
    {
      bundleId: 'base-governance',
      confidence: signals.hasAgentEntry || signals.hasPackageJson ? 'high' : 'medium',
      reasons: [
        signals.hasAgentEntry ? 'agent entry file present' : '',
        signals.hasPackageJson ? 'package.json present' : '',
        !signals.hasAgentEntry && !signals.hasPackageJson ? 'default project governance baseline' : '',
      ].filter(Boolean),
    },
  ];

  if (signals.frontendSignals.length > 0) {
    recommendations.push({
      bundleId: 'frontend-app',
      confidence: 'high',
      reasons: signals.frontendSignals.map((signal) => `frontend dependency: ${signal}`),
    });
  }

  if (signals.researchSignals.length > 0) {
    recommendations.push({
      bundleId: 'research-docs',
      confidence: 'high',
      reasons: signals.researchSignals,
    });
  }

  if (signals.writingSignals.length > 0) {
    recommendations.push({
      bundleId: 'novel-writing',
      confidence: 'high',
      reasons: signals.writingSignals,
    });
  }

  return recommendations;
}

function readJson(path: string): unknown | undefined {
  if (!existsSync(path)) return undefined;
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return undefined;
  }
}

function textFileIncludes(path: string, needles: readonly string[]): boolean {
  if (!existsSync(path)) return false;
  const contents = readFileSync(path, 'utf8').toLowerCase();
  return needles.some((needle) => contents.includes(needle.toLowerCase()));
}

function hasBookChildDirectory(targetDir: string, childName: string): boolean {
  const booksDir = join(targetDir, 'books');
  if (!existsSync(booksDir)) return false;
  try {
    return readdirSync(booksDir, { withFileTypes: true }).some(
      (entry) => entry.isDirectory() && existsSync(join(booksDir, entry.name, childName)),
    );
  } catch {
    return false;
  }
}
