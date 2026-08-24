/**
 * Serves dist/ for the Playwright suite. `astro preview` daemonizes itself, which
 * Playwright's webServer cannot supervise, so the tests use this instead.
 *
 *   node scripts/serve-dist.mjs [port]
 */
import { resolve } from 'node:path';
import { serveDir, urlFor } from './static-server.mjs';

const port = Number(process.argv[2] ?? 4321);
const server = await serveDir(resolve(import.meta.dirname, '../dist'), port);

console.log(`serving dist/ at ${urlFor(server)}`);
