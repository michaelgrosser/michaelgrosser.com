/**
 * A tiny static file server shared by the review harness and the Playwright suite.
 * Deliberately not a dependency: serving a directory of built files is a few lines,
 * and both callers need identical behaviour.
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.ico': 'image/x-icon',
};

/**
 * Cloudflare's asset layer applies _redirects before serving files. Only the exact-path
 * form is supported here, which is all the file uses.
 */
async function loadRedirects(dir) {
  const redirects = new Map();

  try {
    const contents = await readFile(join(dir, '_redirects'), 'utf8');
    for (const line of contents.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const [from, to, status] = trimmed.split(/\s+/);
      if (from && to) redirects.set(from, { to, status: Number(status) || 302 });
    }
  } catch {
    // No _redirects file; nothing to do.
  }

  return redirects;
}

export async function serveDir(dir, port = 0) {
  const redirects = await loadRedirects(dir);

  const server = createServer(async (req, res) => {
    try {
      let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);

      const redirect = redirects.get(path);
      if (redirect) {
        res.writeHead(redirect.status, { location: redirect.to });
        res.end();
        return;
      }

      if (path.endsWith('/')) path += 'index.html';
      const file = join(dir, path);
      if (!file.startsWith(dir)) {
        res.writeHead(403).end();
        return;
      }
      const body = await readFile(file);
      res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' });
      res.end(body);
    } catch {
      // Mirrors Cloudflare's not_found_handling: "404-page".
      try {
        const fallback = await readFile(join(dir, '404.html'));
        res.writeHead(404, { 'content-type': MIME['.html'] });
        res.end(fallback);
      } catch {
        res.writeHead(404).end('not found');
      }
    }
  });

  return new Promise((ok) => server.listen(port, '127.0.0.1', () => ok(server)));
}

export const urlFor = (server, path = '/') => `http://127.0.0.1:${server.address().port}${path}`;
