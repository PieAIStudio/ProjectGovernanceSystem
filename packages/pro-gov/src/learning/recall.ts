import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, join, relative } from 'node:path';

export interface LearningRecallOptions {
  readonly query: string;
  readonly limit?: number;
}

export interface LearningRecallHit {
  readonly relativePath: string;
  readonly title: string;
  readonly score: number;
  readonly summary: string;
}

export interface LearningRecallResult {
  readonly query: string;
  readonly hits: LearningRecallHit[];
}

interface LearningRecord {
  readonly relativePath: string;
  readonly title: string;
  readonly metadata: string;
  readonly body: string;
}

export function recallLearnings(root: string, options: LearningRecallOptions): LearningRecallResult {
  const query = options.query.trim();
  const terms = tokenize(query);
  const limit = Math.max(1, options.limit ?? 5);
  if (terms.length === 0) {
    return { query, hits: [] };
  }

  const records = loadLearningRecords(root);
  const hits = records
    .map((record) => {
      const score = scoreRecord(record, terms);
      return {
        relativePath: record.relativePath,
        title: record.title,
        score,
        summary: summarizeRecord(record, terms),
      };
    })
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score || a.relativePath.localeCompare(b.relativePath))
    .slice(0, limit);

  return { query, hits };
}

function loadLearningRecords(root: string): LearningRecord[] {
  const records: LearningRecord[] = [];
  const solutionsDir = join(root, 'docs/solutions');
  if (existsSync(solutionsDir)) {
    for (const path of listMarkdownFiles(solutionsDir)) {
      records.push(readLearningRecord(root, path));
    }
  }

  const conceptsPath = join(root, 'CONCEPTS.md');
  if (existsSync(conceptsPath)) {
    records.push(readLearningRecord(root, conceptsPath));
  }

  return records;
}

function listMarkdownFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const absolutePath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listMarkdownFiles(absolutePath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(absolutePath);
    }
  }
  return files.sort();
}

function readLearningRecord(root: string, absolutePath: string): LearningRecord {
  const content = readFileSync(absolutePath, 'utf8');
  const parsed = splitFrontmatter(content);
  const body = parsed.body;
  return {
    relativePath: normalizePath(relative(root, absolutePath)),
    title: findTitle(parsed.frontmatter, body) ?? titleFromPath(absolutePath),
    metadata: parsed.frontmatter,
    body,
  };
}

function splitFrontmatter(content: string): { frontmatter: string; body: string } {
  if (!content.startsWith('---\n')) {
    return { frontmatter: '', body: content };
  }

  const end = content.indexOf('\n---', 4);
  if (end === -1) {
    return { frontmatter: '', body: content };
  }

  return {
    frontmatter: content.slice(4, end).trim(),
    body: content.slice(end + '\n---'.length).trim(),
  };
}

function findTitle(frontmatter: string, body: string): string | undefined {
  const titleLine = frontmatter
    .split(/\r?\n/)
    .find((line) => line.trim().toLowerCase().startsWith('title:'));
  if (titleLine) {
    return titleLine.slice(titleLine.indexOf(':') + 1).trim().replace(/^["']|["']$/g, '');
  }

  const heading = body.split(/\r?\n/).find((line) => line.startsWith('# '));
  return heading ? heading.slice(2).trim() : undefined;
}

function titleFromPath(path: string): string {
  return basename(path, '.md')
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function scoreRecord(record: LearningRecord, terms: readonly string[]): number {
  const title = record.title.toLowerCase();
  const metadata = record.metadata.toLowerCase();
  const path = record.relativePath.toLowerCase();
  const body = record.body.toLowerCase();
  let score = 0;

  for (const term of terms) {
    if (title.includes(term)) score += 6;
    if (metadata.includes(term)) score += 4;
    if (path.includes(term)) score += 2;
    if (body.includes(term)) score += 1;
  }

  return score;
}

function summarizeRecord(record: LearningRecord, terms: readonly string[]): string {
  const lines = record.body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const best = lines
    .map((line, index) => ({
      line,
      index,
      score: countTermMatches(line, terms) + (line.startsWith('#') ? 0.5 : 0),
    }))
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)[0];
  if (!best) {
    return truncate(cleanMarkdownLine(lines[0] ?? record.title), 180);
  }

  const cleaned = cleanMarkdownLine(best.line);
  if (!best.line.startsWith('#')) {
    return truncate(cleaned, 180);
  }

  const nextLine = lines.slice(best.index + 1).find((line) => !line.startsWith('#'));
  return truncate([cleaned, nextLine].filter(Boolean).join(' - '), 180);
}

function tokenize(input: string): string[] {
  return [...new Set(input.toLowerCase().match(/[a-z0-9\u4e00-\u9fff]+/g) ?? [])].filter((term) => term.length > 1);
}

function truncate(input: string, maxLength: number): string {
  return input.length <= maxLength ? input : `${input.slice(0, maxLength - 1)}…`;
}

function normalizePath(path: string): string {
  return path.split('\\').join('/');
}

function countTermMatches(input: string, terms: readonly string[]): number {
  const lower = input.toLowerCase();
  return terms.filter((term) => lower.includes(term)).length;
}

function cleanMarkdownLine(input: string): string {
  return input.replace(/^#+\s*/, '').trim();
}
