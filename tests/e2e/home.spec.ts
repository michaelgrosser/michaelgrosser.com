import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const nameField = (page: Page) => page.getByRole('textbox', { name: 'Name', exact: true });
const emailField = (page: Page) => page.getByRole('textbox', { name: 'Email', exact: true });
const messageField = (page: Page) => page.getByRole('textbox', { name: 'Message', exact: true });

/** Turnstile is a third-party widget; the page must work without reaching it. */
const blockTurnstile = (page: Page) =>
  page.route('https://challenges.cloudflare.com/**', (route) => route.abort());

test.beforeEach(async ({ page }) => {
  await blockTurnstile(page);
});

test('renders the page and every section', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Michael Grosser/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/^Hi, I['’]m Michael$/);

  for (const id of ['top', 'experience', 'technical', 'education', 'contact']) {
    await expect(page.locator(`#${id}`)).toBeVisible();
  }

  await expect(page.getByRole('img', { name: 'Portrait of Michael Grosser' })).toBeVisible();
});

test('profile links open in a new tab, the email link does not', async ({ page }) => {
  await page.goto('/');

  const profiles = page.locator('a[data-review="icon-button"][href^="http"]');
  await expect(profiles).toHaveCount(6); // three profiles, in the hero and in contact

  for (const link of await profiles.all()) {
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /noopener/);
    await expect(link).toHaveAccessibleName(/opens in a new tab/);
  }

  const email = page.locator('a[data-review="icon-button"][href^="mailto:"]').first();
  await expect(email).not.toHaveAttribute('target', '_blank');
});

test('primary navigation moves to the requested section', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('link', { name: 'Experience', exact: true }).click();
  await expect(page).toHaveURL(/#experience$/);

  const heading = page.locator('#experience-heading');
  await expect(heading).toBeInViewport();
});

test('the mobile menu opens, navigates, and closes', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto('/');

  const toggle = page.getByRole('button', { name: 'Menu' });
  const menu = page.locator('#nav-menu');

  await expect(toggle).toBeVisible();
  await expect(menu).toBeHidden();

  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(menu).toBeVisible();

  await menu.getByRole('link', { name: 'Contact' }).click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(menu).toBeHidden();
  await expect(page).toHaveURL(/#contact$/);
});

test('the contact form reports its own validation errors', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Send', exact: true }).click();

  await expect(page.getByText('Please enter your name.')).toBeVisible();
  await expect(page.getByText('Please enter a valid email address.')).toBeVisible();
  await expect(page.getByText('Please enter a message.')).toBeVisible();
  await expect(nameField(page)).toBeFocused();

  await nameField(page).fill('Ada Lovelace');
  await emailField(page).fill('not-an-email');
  await messageField(page).fill('Hello');
  await page.getByRole('button', { name: 'Send', exact: true }).click();

  await expect(page.getByText('Please enter your name.')).toBeHidden();
  await expect(page.getByText('Please enter a valid email address.')).toBeVisible();
});

test('a successful submission replaces the form', async ({ page }) => {
  await page.route('**/api/contact', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }),
  );
  await page.goto('/');

  await nameField(page).fill('Ada Lovelace');
  await emailField(page).fill('ada@example.com');
  await messageField(page).fill('Hello, I would like to talk.');
  await page.getByRole('button', { name: 'Send', exact: true }).click();

  const wrap = page.locator('[data-send="wrap"]');

  // The fold runs for 1080ms before the card appears; Playwright waits it out.
  await expect(page.getByText('Message sent.')).toBeVisible();
  await expect(wrap).toHaveAttribute('data-phase', 'sent');
  await expect(page.getByRole('button', { name: 'Send', exact: true })).toBeHidden();
  await expect(page.getByRole('status')).toBeFocused();
});

test('reduced motion skips the send animation entirely', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/api/contact', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }),
  );
  await page.goto('/');

  const wrap = page.locator('[data-send="wrap"]');

  await nameField(page).fill('Ada Lovelace');
  await emailField(page).fill('ada@example.com');
  await messageField(page).fill('Hello, I would like to talk.');
  await page.getByRole('button', { name: 'Send', exact: true }).click();

  await expect(page.getByText('Message sent.')).toBeVisible();
  // Never passes through the folding state.
  await expect(wrap).toHaveAttribute('data-phase', 'sent');
});

test('"send another" returns an empty form', async ({ page }) => {
  await page.route('**/api/contact', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }),
  );
  await page.goto('/');

  await nameField(page).fill('Ada Lovelace');
  await emailField(page).fill('ada@example.com');
  await messageField(page).fill('Hello, I would like to talk.');
  await page.getByRole('button', { name: 'Send', exact: true }).click();
  await expect(page.getByText('Message sent.')).toBeVisible();

  await page.getByRole('button', { name: 'Send another' }).click();

  await expect(page.locator('[data-send="wrap"]')).toHaveAttribute('data-phase', 'idle');
  await expect(nameField(page)).toHaveValue('');
  await expect(messageField(page)).toHaveValue('');
  await expect(nameField(page)).toBeEnabled();
});

test('a failed submission explains itself and keeps what was typed', async ({ page }) => {
  await page.route('**/api/contact', (route) =>
    route.fulfill({
      status: 502,
      contentType: 'application/json',
      body: '{"ok":false,"error":"delivery"}',
    }),
  );
  await page.goto('/');

  await nameField(page).fill('Ada Lovelace');
  await emailField(page).fill('ada@example.com');
  await messageField(page).fill('Hello, I would like to talk.');
  await page.getByRole('button', { name: 'Send', exact: true }).click();

  const alert = page.getByRole('alert');
  await expect(alert).toContainText('Something went wrong sending your message.');
  await expect(messageField(page)).toHaveValue('Hello, I would like to talk.');
  await expect(page.getByRole('button', { name: 'Send', exact: true })).toBeEnabled();
  // Keyboard users must not be dumped back at the top of the document.
  await expect(alert).toBeFocused();
});

test('server-reported field errors are shown against the field', async ({ page }) => {
  await page.route('**/api/contact', (route) =>
    route.fulfill({
      status: 422,
      contentType: 'application/json',
      body: '{"ok":false,"error":"invalid","fields":{"email":"Please enter a valid email address."}}',
    }),
  );
  await page.goto('/');

  await nameField(page).fill('Ada Lovelace');
  await emailField(page).fill('ada@example.com');
  await messageField(page).fill('Hello, I would like to talk.');
  await page.getByRole('button', { name: 'Send', exact: true }).click();

  await expect(page.locator('#contact-email-error')).toHaveText(
    'Please enter a valid email address.',
  );
  await expect(emailField(page)).toHaveAttribute('aria-invalid', 'true');
  await expect(emailField(page)).toBeFocused();
  // A field-level rejection is not a delivery failure; only one message should appear.
  await expect(page.getByRole('alert')).toBeHidden();
});

test('the built page carries the real Turnstile site key', async ({ page }) => {
  await page.goto('/');

  const siteKey = await page.locator('.cf-turnstile').getAttribute('data-sitekey');

  // Cloudflare's test keys start 1x/2x/3x and always issue a dummy token, which the
  // production secret rejects. Shipping one silently breaks every submission.
  expect(siteKey).toMatch(/^0x/);
});

test('a retired URL redirects permanently to the home page', async ({ request }) => {
  const response = await request.get('/about', { maxRedirects: 0 });

  expect(response.status()).toBe(301);
  expect(response.headers()['location']).toBe('/');
});

test('an unknown path serves the 404 page, not the home page', async ({ page }) => {
  const response = await page.goto('/wp-admin');

  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('This page doesn’t exist.');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow');
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);

  // The nav has to work from here, which root-relative anchors are what buy us.
  await page.getByRole('link', { name: 'Experience', exact: true }).click();
  await expect(page).toHaveURL(/\/#experience$/);
  await expect(page.locator('#experience')).toBeVisible();
});

for (const width of [1440, 740, 390]) {
  test(`has no detectable accessibility violations at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });
}
