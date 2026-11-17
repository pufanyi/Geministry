import { watch } from 'node:fs';
import { cp, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { build, context } from 'esbuild';

const root = fileURLToPath(new URL('../', import.meta.url));
const assets = new URL('../public/', import.meta.url);
const output = new URL('../dist/', import.meta.url);
async function copyAssets() {
  await mkdir(output, { recursive: true });
  await cp(assets, output, { recursive: true });
}

const options = {
  absWorkingDir: root,
  entryPoints: ['src/content.ts'],
  outfile: 'dist/content.js',
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: 'es2022',
  loader: { '.css': 'text' },
  logLevel: 'info',
};

await copyAssets();
if (process.argv.includes('--watch')) {
  const builder = await context(options);
  await builder.watch();
  const watcher = watch(assets, () => {
    copyAssets().catch((error) => console.error('Asset copy failed:', error));
  });
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, async () => {
      watcher.close();
      await builder.dispose();
      process.exit(0);
    });
  }
} else {
  await build(options);
}
