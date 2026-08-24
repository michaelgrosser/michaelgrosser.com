/**
 * Self-review capture harness.
 *
 * Renders the built site and the approved design prototype at the same viewports,
 * writes screenshots to .review/, and runs an axe-core accessibility scan.
 *
 * The point is not the numbers — it is that the agent can read the resulting PNGs and
 * compare them against docs/ui/README.md before a human ever looks at the work.
 *
 *   node scripts/review/capture.mjs              # current + baseline + axe
 *   node scripts/review/capture.mjs --no-baseline
 *   node scripts/review/capture.mjs --only=760
 *
 * Assumes `npm run build` has already produced dist/.
 */

// @playwright/test, not the bare 'playwright' package: only the former is a dependency.
import { chromium } from '@playwright/test';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { serveDir, urlFor } from '../static-server.mjs';

const ROOT = resolve(import.meta.dirname, '../..');
const OUT = join(ROOT, '.review');
const DIST = join(ROOT, 'dist');
const PROTOTYPE_DIR = join(ROOT, 'docs/ui/design');
const PROTOTYPE_FILE = 'Michael Grosser Site.dc.html';

// Widths sit on both sides of every breakpoint in docs/ui/README.md
// (<=1000, <=760, <=700), plus a common phone width.
const VIEWPORTS = [
  { name: '1440-desktop', width: 1440, height: 1200 },
  { name: '1024-above-1000', width: 1024, height: 1200 },
  { name: '0960-below-1000', width: 960, height: 1200 },
  { name: '0800-above-760', width: 800, height: 1200 },
  { name: '0740-below-760', width: 740, height: 1200 },
  { name: '0680-below-700', width: 680, height: 1200 },
  { name: '0390-phone', width: 390, height: 900 },
];

// Hover is the design's signature interaction and is invisible in a static capture.
const HOVER_TARGETS = [
  { name: 'hover-experience-row', selector: '[data-review="experience-row"]' },
  { name: 'hover-education-item', selector: '[data-review="education-item"]' },
  { name: 'hover-logo', selector: '[data-review="logo"]' },
  { name: 'hover-icon-button', selector: '[data-review="icon-button"]' },
  { name: 'hover-primary-button', selector: '[data-review="primary-button"]' },
];

/**
 * Turnstile is invisible until it challenges someone, but its long-lived connections
 * keep the page from ever going idle. Block it so the sweep is deterministic and can
 * run offline. The prototype does not use it, so the baseline is unaffected.
 */
async function openPage(browser, viewport) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  await page.route('https://challenges.cloudflare.com/**', (route) => route.abort());
  return page;
}

async function settle(page) {
  // Fonts drive nearly every measurement on this page; never shoot before they load.
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
  await page.evaluate(
    () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
  );
}

async function captureSet(browser, url, label, viewports) {
  const dir = join(OUT, label);
  await mkdir(dir, { recursive: true });
  const captured = [];

  for (const vp of viewports) {
    const page = await openPage(browser, { width: vp.width, height: vp.height });
    const consoleErrors = [];
    page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()));
    page.on('pageerror', (e) => consoleErrors.push(String(e)));

    await page.goto(url, { waitUntil: 'load' });
    await settle(page);
    await page.screenshot({ path: join(dir, `${vp.name}.png`), fullPage: true });

    // A page that scrolls sideways is a spec violation; measure it rather than eyeball it.
    const horizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );

    captured.push({ viewport: vp.name, width: vp.width, horizontalOverflow, consoleErrors });
    await page.close();
  }

  return captured;
}

async function captureHovers(browser, url) {
  const dir = join(OUT, 'current');
  await mkdir(dir, { recursive: true });
  const page = await openPage(browser, { width: 1440, height: 1200 });
  await page.goto(url, { waitUntil: 'load' });
  await settle(page);

  const done = [];
  for (const target of HOVER_TARGETS) {
    const el = page.locator(target.selector).first();
    if ((await el.count()) === 0) continue;
    await el.hover();
    await page.waitForTimeout(320); // longest specified transition is 220ms
    await el.screenshot({ path: join(dir, `${target.name}.png`) }).catch(() => {});
    done.push(target.name);
  }

  // Keyboard focus rings must be visible; capture the first tab stop.
  await page.keyboard.press('Tab');
  await page.screenshot({ path: join(dir, 'focus-first-tab-stop.png') });
  await page.close();

  // The open mobile menu is a whole layout that no static capture shows.
  const narrow = await openPage(browser, { width: 390, height: 900 });
  await narrow.goto(url, { waitUntil: 'load' });
  await settle(narrow);
  const toggle = narrow.locator('[data-nav-toggle]');
  if ((await toggle.count()) > 0) {
    await toggle.click();
    await narrow.waitForTimeout(200);
    await narrow.screenshot({ path: join(dir, 'menu-open.png') });
    done.push('menu-open');
  }
  await narrow.close();

  return done;
}

async function runAxe(browser, url) {
  let AxeBuilder;
  try {
    ({ default: AxeBuilder } = await import('@axe-core/playwright'));
  } catch {
    return { skipped: '@axe-core/playwright not installed' };
  }

  const results = {};
  for (const width of [1440, 740, 390]) {
    // AxeBuilder refuses pages created straight off the browser.
    const context = await browser.newContext({ viewport: { width, height: 1200 } });
    await context.route('https://challenges.cloudflare.com/**', (route) => route.abort());
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'load' });
    await settle(page);
    const scan = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    results[width] = scan.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      nodes: v.nodes.map((n) => n.target.join(' ')).slice(0, 8),
    }));
    await context.close();
  }
  return results;
}

const args = process.argv.slice(2);
const only = args.find((a) => a.startsWith('--only='))?.split('=')[1];
const viewports = only ? VIEWPORTS.filter((v) => v.name.includes(only)) : VIEWPORTS;
const wantBaseline = !args.includes('--no-baseline');

if (!existsSync(DIST)) {
  console.error('dist/ not found — run `npm run build` first.');
  process.exit(1);
}

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

const siteServer = await serveDir(DIST);
const browser = await chromium.launch();
const report = { viewports: viewports.map((v) => v.name) };

console.log('capturing current implementation...');
report.current = await captureSet(browser, urlFor(siteServer), 'current', viewports);
report.hovers = await captureHovers(browser, urlFor(siteServer));

console.log('running axe-core...');
report.axe = await runAxe(browser, urlFor(siteServer));

if (wantBaseline) {
  console.log('capturing design prototype baseline...');
  const protoServer = await serveDir(PROTOTYPE_DIR);
  try {
    report.baseline = await captureSet(
      browser,
      urlFor(protoServer, `/${encodeURIComponent(PROTOTYPE_FILE)}`),
      'baseline',
      viewports,
    );
    // The prototype pulls fonts and icons from CDNs. With no network it still renders,
    // but in fallback fonts — which makes any pixel comparison meaningless.
    if (report.baseline.some((b) => b.consoleErrors.length > 0)) {
      report.baselineWarning =
        'Prototype logged console errors (likely blocked CDN fonts/icons). Treat baseline as layout-only, not pixel-accurate.';
    }
  } finally {
    protoServer.close();
  }
}

await browser.close();
siteServer.close();

await writeFile(join(OUT, 'report.json'), JSON.stringify(report, null, 2));

const overflows = report.current.filter((c) => c.horizontalOverflow > 0);
const axeCount = Object.values(report.axe ?? {})
  .filter(Array.isArray)
  .reduce((n, v) => n + v.length, 0);

console.log(`\nwrote ${OUT}`);
console.log(
  `horizontal overflow: ${
    overflows.length
      ? overflows.map((o) => `${o.viewport}(+${o.horizontalOverflow}px)`).join(', ')
      : 'none'
  }`,
);
console.log(`axe violations: ${report.axe?.skipped ?? axeCount}`);
if (report.baselineWarning) console.log(`baseline: ${report.baselineWarning}`);
