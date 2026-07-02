import {
  existsSync,
  lstatSync,
  mkdirSync,
  readlinkSync,
  realpathSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

import { isManagedAssetTargetPath } from './install-plan';
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

  if (action.type === 'remove-symlink') {
    removeManagedSymlink(targetAbsolutePath, action);
    return;
  }

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
  const symlinkTarget = relative(realpathSync(dirname(targetAbsolutePath)), realpathSync(sourceAbsolutePath)) || '.';

  if (action.type === 'symlink') {
    if (pathExistsEvenIfDanglingSymlink(targetAbsolutePath)) {
      throw new Error(`Refusing to overwrite unmanaged target: ${action.targetPath}`);
    }
    symlinkSync(symlinkTarget, targetAbsolutePath);
    return;
  }

  if (!pathExistsEvenIfDanglingSymlink(targetAbsolutePath)) {
    symlinkSync(symlinkTarget, targetAbsolutePath);
    return;
  }

  const stats = lstatSync(targetAbsolutePath);
  if (!stats.isSymbolicLink()) {
    throw new Error(`Refusing to overwrite unmanaged target: ${action.targetPath}`);
  }
  unlinkSync(targetAbsolutePath);
  symlinkSync(symlinkTarget, targetAbsolutePath);
}

function removeManagedSymlink(
  targetAbsolutePath: string,
  action: Extract<AssetInstallAction, { type: 'remove-symlink' }>,
): void {
  if (!isManagedAssetTargetPath(action.targetPath)) {
    throw new Error(`Refusing to remove managed asset outside supported roots: ${action.targetPath}`);
  }
  if (!pathExistsEvenIfDanglingSymlink(targetAbsolutePath)) return;
  const stats = lstatSync(targetAbsolutePath);
  if (!stats.isSymbolicLink()) {
    throw new Error(`Refusing to remove path that is no longer a managed symlink: ${action.targetPath}`);
  }
  const actualSourcePath = resolve(dirname(targetAbsolutePath), readlinkSync(targetAbsolutePath));
  if (actualSourcePath !== resolve(action.expectedSourcePath)) {
    throw new Error(`Refusing to remove managed symlink with changed target: ${action.targetPath}`);
  }
  unlinkSync(targetAbsolutePath);
}

function pathExistsEvenIfDanglingSymlink(path: string): boolean {
  try {
    lstatSync(path);
    return true;
  } catch {
    return existsSync(path);
  }
}
