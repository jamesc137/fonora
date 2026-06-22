import { cpSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcDist = join(root, 'node_modules', 'piper-tts-web', 'dist');
const dest = join(root, 'vendor', 'piper-tts-web');

if (!existsSync(srcDist)) {
  console.warn('piper-tts-web not installed; run npm install first.');
  process.exit(0);
}

mkdirSync(dest, { recursive: true });
cpSync(join(srcDist, 'piper-tts-web.js'), join(dest, 'piper-tts-web.js'));
cpSync(join(srcDist, 'piper'), join(dest, 'piper'), { recursive: true });
console.log('Copied piper-tts-web bundle to vendor/piper-tts-web/');
