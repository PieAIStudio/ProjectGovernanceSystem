import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Render a template by replacing the placeholder frontmatter values
 * (id, title, type, status, canonical, owner, created, last_reviewed, domain).
 *
 * Body is left untouched so the user can fill it manually.
 */
export interface TemplateValues {
  id: string;
  title: string;
  type: string;
  status: string;
  canonical: boolean;
  owner: string;
  created: string;
  lastReviewed: string;
  domain: string;
  tags: string[];
  pinned: boolean;
}

const TEMPLATE_FILES: Record<string, string> = {
  decision: 'adr.md',
  spec: 'spec.md',
  plan: 'plan.md',
  canon: 'canon-entry.md',
  reference: 'reference.md',
  policy: 'policy.md',
  archive: 'archive.md',
};

export function loadTemplate(rootDir: string, type: string): string {
  const file = TEMPLATE_FILES[type];
  if (!file) throw new Error(`No template file mapped for type: ${type}`);
  return readFileSync(join(rootDir, 'governance/templates', file), 'utf8');
}

export function renderTemplate(template: string, values: TemplateValues): string {
  const closing = template.indexOf('\n---', 4);
  if (closing === -1) throw new Error('Template is missing closing frontmatter marker.');
  const body = template.slice(closing + 4).replace(/^\n/, '');

  const tagsBlock =
    values.tags.length > 0 ? values.tags.map((t) => `  - ${t}`).join('\n') : '  - replace-me';

  const frontmatter = [
    '---',
    `id: ${values.id}`,
    `title: ${values.title}`,
    `type: ${values.type}`,
    `status: ${values.status}`,
    `canonical: ${values.canonical}`,
    `owner: ${values.owner}`,
    `created: ${values.created}`,
    `last_reviewed: ${values.lastReviewed}`,
    `domain: ${values.domain}`,
    'tags:',
    tagsBlock,
    `pinned: ${values.pinned}`,
    'related: []',
    '---',
    '',
  ].join('\n');

  // Replace placeholder ID/title in body H1 if it still says "Replace Me".
  const replacedBody = body
    .replace(/^# REPLACE-ME: Replace Me/m, `# ${values.id}: ${values.title}`)
    .replace(/^# Replace Me$/m, `# ${values.title}`)
    .replace(/^# Replace Me \(archived\)$/m, `# ${values.title} (archived)`);

  return frontmatter + replacedBody;
}
