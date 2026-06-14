import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface AgentAssetBundle {
  id: string;
  title: string;
  description: string;
  assets: readonly string[];
}

export function loadAgentAssetBundles(agentAssetsDir: string): AgentAssetBundle[] {
  const bundlesDir = join(agentAssetsDir, 'bundles');
  if (!existsSync(bundlesDir)) return [];

  return readdirSync(bundlesDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => {
      const bundlePath = join(bundlesDir, entry.name);
      return JSON.parse(readFileSync(bundlePath, 'utf8')) as AgentAssetBundle;
    })
    .sort((a, b) => a.id.localeCompare(b.id));
}
