import { listAssets } from '../assets';

export function runAssets(args: string[]): number {
  const [subcommand] = args;
  if (subcommand !== 'list') {
    console.error('Usage: pro-gov assets list');
    return 1;
  }

  for (const asset of listAssets()) {
    console.log(asset.path);
  }
  return 0;
}
