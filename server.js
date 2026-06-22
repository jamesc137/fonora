import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const host = process.env.HOST || '0.0.0.0';
const port = Number(process.env.PORT) || 8000;

const MIME = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.wasm': 'application/wasm',
  '.data': 'application/octet-stream',
};

/** Map browser URL prefixes to on-disk paths (keeps large npm bundles out of git). */
const URL_ALIASES = [
  {
    prefix: '/vendor/piper-tts-web/',
    base: join(root, 'vendor', 'piper-tts-web'),
    fallback: join(root, 'node_modules', 'piper-tts-web', 'dist'),
  },
];

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

function normalizePathname(pathname) {
  let path = decodeURIComponent(pathname);
  if (path.endsWith('/')) path += 'index.html';
  if (path === '/') path = '/index.html';
  return path;
}

function resolveFilePath(pathname) {
  for (const { prefix, base, fallback } of URL_ALIASES) {
    if (!pathname.startsWith(prefix)) continue;
    const rel = pathname.slice(prefix.length);
    const candidates = [join(base, rel)];
    if (fallback) candidates.push(join(fallback, rel));
    for (const candidate of candidates) {
      const rootCheck = candidate.startsWith(base) || (fallback && candidate.startsWith(fallback));
      if (rootCheck && !candidate.includes('..')) return candidate;
    }
    return null;
  }

  const filePath = join(root, pathname.replace(/^\//, ''));
  if (!filePath.startsWith(root) || filePath.includes('..')) return null;
  return filePath;
}

function cacheControl(pathname) {
  if (pathname === '/index.html' || pathname === '/') return 'no-cache';
  if (/\.(wasm|data|js|mjs|css)$/.test(pathname)) return 'public, max-age=31536000, immutable';
  return 'public, max-age=3600';
}

createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);

    if (url.pathname === '/health') {
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', ...SECURITY_HEADERS });
      res.end('ok');
      return;
    }

    const pathname = normalizePathname(url.pathname);
    const filePath = resolveFilePath(pathname);
    if (!filePath) {
      res.writeHead(403, SECURITY_HEADERS);
      res.end('Forbidden');
      return;
    }

    const info = await stat(filePath);
    if (!info.isFile()) {
      res.writeHead(404, SECURITY_HEADERS);
      res.end('Not found');
      return;
    }

    const body = await readFile(filePath);
    const type = MIME[extname(filePath)] ?? 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': type,
      'Cache-Control': cacheControl(pathname),
      ...SECURITY_HEADERS,
    });
    res.end(body);
  } catch {
    res.writeHead(404, SECURITY_HEADERS);
    res.end('Not found');
  }
}).listen(port, host, () => {
  console.log(`Fonora listening on http://${host}:${port}`);
});
