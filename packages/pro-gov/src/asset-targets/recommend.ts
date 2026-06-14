import { existsSync, readFileSync } from 'node:fs';
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

export function discoverTargetSignals(targetDir: string): TargetSignals {
  const packageJson = readJson(join(targetDir, 'package.json')) as
    | { dependencies?: Record<string, string>; devDependencies?: Record<string, string> }
    | undefined;
  const dependencyNames = packageJson
    ? Object.keys({ ...packageJson.dependencies, ...packageJson.devDependencies })
    : [];

  const frontendSignals = dependencyNames.filter((name) => frontendPackages.has(name)).sort();
  const hasAgentEntry = ['AGENTS.md', 'CLAUDE.md', 'GEMINI.md'].some((file) =>
    existsSync(join(targetDir, file)),
  );
  const researchSignals = [
    existsSync(join(targetDir, 'docs/research')) ? 'docs/research' : '',
    textFileIncludes(join(targetDir, 'README.md'), ['research', '调研']) ? 'README research' : '',
  ].filter(Boolean);
  const writingSignals = [
    existsSync(join(targetDir, 'chapters')) ? 'chapters' : '',
    textFileIncludes(join(targetDir, 'README.md'), ['novel', 'fiction', 'story', '小说'])
      ? 'README writing'
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
