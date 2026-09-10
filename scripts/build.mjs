import {cp, mkdir, readdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'dist');
await mkdir(output, {recursive: true});
const pages = (await readdir(root)).filter(name => name.endsWith('.html'));
for (const name of [...pages, 'assets', 'projetos', 'modo']) {
  await cp(path.join(root, name), path.join(output, name), {recursive: true});
}
console.log('Site estático preparado em dist/.');
