import { copyFile, mkdir, readdir } from 'node:fs/promises';

const source = new URL('../src/', import.meta.url);
const output = new URL('../dist/', import.meta.url);
await mkdir(output, { recursive: true });
for (const name of await readdir(source)) {
  if (name === 'manifest.json' || name.endsWith('.png')) {
    await copyFile(new URL(name, source), new URL(name, output));
  }
}
