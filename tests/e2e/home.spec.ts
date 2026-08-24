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
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Michael Grosser');

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

  await page.getByRole('button', { name: 'Send' }).click();

  await expect(page.getByText('Please enter your name.')).toBeVisible();
  await expect(page.getByText('Please enter a valid email address.')).toBeVisible();
  await expect(page.getByText('Please enter a message.')).toBeVisible();
  await expect(nameField(page)).toBeFocused();

  await nameField(page).fill('Ada Lovelace');
  await emailField(page).fill('not-an-email');
  await messageField(page).fill('Hello');
  await page.getByRole('button', { name: 'Send' }).click();

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
  await page.getByRole('button', { name: 'Send' }).click();

  await expect(page.getByText('your message is on its way')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Send' })).toBeHidden();
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
  await page.getByRole('button', { name: 'Send' }).click();

  const alert = page.getByRole('alert');
  await expect(alert).toContainText('Something went wrong sending your message.');
  await expect(messageField(page)).toHaveValue('Hello, I would like to talk.');
  await expect(page.getByRole('button', { name: 'Send' })).toBeEnabled();
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
  await page.getByRole('button', { name: 'Send' }).click();

  await expect(page.locator('#contact-email-error')).toHaveText(
    'Please enter a valid email address.',
  );
  await expect(emailField(page)).toHaveAttribute('aria-invalid', 'true');
  await expect(emailField(page)).toBeFocused();
  // A field-level rejection is not a delivery failure; only one message should appear.
  await expect(page.getByRole('alert')).toBeHidden();
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
