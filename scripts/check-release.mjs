/**
 * Release gate: refuses to let a build reach production if it cannot work there.
 *
 * `npm run build` deliberately still succeeds without a Turnstile site key, so tests
 * and the review harness can run anywhere. That leaves one way to ship a form that
 * rejects every real visitor, and this is the check that closes it.
 *
 *   node scripts/check-release.mjs
 */
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const DIST = resolve(import.meta.dirname, '../dist');
const TURNSTILE_TEST_KEYS = [
  '1x00000000000000000000AA',
  '2x00000000000000000000AB',
  '3x00000000000000000000FF',
];

const failures = [];

if (!existsSync(DIST)) {
  failures.push('dist/ does not exist — run `npm run build` first.');
} else {
  const html = await readFile(join(DIST, 'index.html'), 'utf8');

  const testKey = TURNSTILE_TEST_KEYS.find((key) => html.includes(key));
  if (testKey) {
    failures.push(
      `dist/index.html was built with the Turnstile *test* site key (${testKey}).\n` +
        '  Every real submission would be rejected by the production secret.\n' +
        '  Set PUBLIC_TURNSTILE_SITE_KEY to the widget key for michaelgrosser.com and rebuild.',
    );
  }

  if (!html.includes('challenges.cloudflare.com')) {
    failures.push('dist/index.html does not load Turnstile — the form would have no spam check.');
  }

  if (!existsSync(join(DIST, '_headers'))) {
    failures.push('dist/_headers is missing — the site would ship with no security headers.');
  }
}

if (failures.length > 0) {
  console.error('\nRelease check failed:\n');
  for (const failure of failures) console.error(`  - ${failure}\n`);
  process.exit(1);
}

console.log('Release check passed.');
