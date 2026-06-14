import { existsSync, lstatSync, mkdirSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

import type { AssetInstallAction, AssetInstallPlan } from './install-plan';

export interface AssetApplyResult {
  appliedActions: string[];
}

export function applyAssetInstallPlan(plan: AssetInstallPlan): AssetApplyResult {
  const appliedActions: string[] = [];

  for (const action of plan.actions) {
    applyAction(plan.targetDir, action);
    appliedActions.push(action.type);
  }

  return { appliedActions };
}

function applyAction(targetDir: string, action: AssetInstallAction): void {
  const targetAbsolutePath = join(targetDir, action.targetPath);

  if (action.type === 'create-dir') {
    mkdirSync(targetAbsolutePath, { recursive: true });
    return;
  }

  if (action.type === 'write-file') {
    mkdirSync(dirname(targetAbsolutePath), { recursive: true });
    writeFileSync(targetAbsolutePath, action.content);
    return;
  }

  mkdirSync(dirname(targetAbsolutePath), { recursive: true });
  const sourceAbsolutePath = resolve(action.sourcePath);

  if (action.type === 'symlink') {
    if (pathExistsEvenIfDanglingSymlink(targetAbsolutePath)) {
      throw new Error(`Refusing to overwrite unmanaged target: ${action.targetPath}`);
    }
    symlinkSync(sourceAbsolutePath, targetAbsolutePath);
    return;
  }

  if (!pathExistsEvenIfDanglingSymlink(targetAbsolutePath)) {
    symlinkSync(sourceAbsolutePath, targetAbsolutePath);
    return;
  }

  const stats = lstatSync(targetAbsolutePath);
  if (!stats.isSymbolicLink()) {
    throw new Error(`Refusing to overwrite unmanaged target: ${action.targetPath}`);
  }
  unlinkSync(targetAbsolutePath);
  symlinkSync(sourceAbsolutePath, targetAbsolutePath);
}

function pathExistsEvenIfDanglingSymlink(path: string): boolean {
  try {
    lstatSync(path);
    return true;
  } catch {
    return existsSync(path);
  }
}
