import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import worker, { type Env } from '../../worker/index';
import type { EmailMessage } from '../../tests/stubs/cloudflare-email';
import { CONTACT_ENDPOINT } from '../../src/data/contact';

const ORIGIN = 'https://michaelgrosser.com';

const submission = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  message: 'Hello, I would like to talk.',
  token: 'turnstile-token',
};

/** Records what the Worker tried to send without ever leaving the process. */
function makeEnv(overrides: Partial<Env> = {}) {
  const send = vi.fn(async (_message: EmailMessage) => {});
  const env = {
    CONTACT_EMAIL: { send } as unknown as Env['CONTACT_EMAIL'],
    TURNSTILE_SECRET_KEY: 'secret',
    CONTACT_FROM: 'contact@michaelgrosser.com',
    CONTACT_TO: 'michael@michaelgrosser.com',
    ...overrides,
  } satisfies Env;

  return { env, send };
}

const post = (body: unknown, init: RequestInit = {}) =>
  new Request(`${ORIGIN}${CONTACT_ENDPOINT}`, {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
    ...init,
    // Merged last: overrides are meant to replace one header, not all of them.
    headers: { 'content-type': 'application/json', origin: ORIGIN, ...(init.headers ?? {}) },
  });

/** Turnstile is the only network call the Worker makes. */
const turnstile = (success: boolean) =>
  vi.fn(async () => new Response(JSON.stringify({ success }), { status: 200 }));

beforeEach(() => {
  vi.stubGlobal('fetch', turnstile(true));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('POST /api/contact', () => {
  it('sends one email for a valid submission', async () => {
    const { env, send } = makeEnv();

    const response = await worker.fetch(post(submission), env);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(send).toHaveBeenCalledTimes(1);

    const message = send.mock.calls[0]![0];
    expect(message.from).toBe('contact@michaelgrosser.com');
    expect(message.to).toBe('michael@michaelgrosser.com');
    expect(message.raw).toContain('Reply-To: <ada@example.com>');
  });

  it('answers a tripped honeypot as if it succeeded, and sends nothing', async () => {
    const { env, send } = makeEnv();

    const response = await worker.fetch(post({ ...submission, subject: 'Acme' }), env);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(send).not.toHaveBeenCalled();
  });

  it('returns per-field errors for an invalid submission', async () => {
    const { env, send } = makeEnv();

    const response = await worker.fetch(post({ ...submission, email: 'nope' }), env);

    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toMatchObject({ ok: false, error: 'invalid' });
    expect(send).not.toHaveBeenCalled();
  });

  it('refuses to accept anything while the Turnstile secret is unconfigured', async () => {
    const { env, send } = makeEnv({ TURNSTILE_SECRET_KEY: undefined });
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    const response = await worker.fetch(post(submission), env);

    expect(response.status).toBe(500);
    expect(send).not.toHaveBeenCalled();
    error.mockRestore();
  });

  it('rejects a submission Turnstile does not vouch for', async () => {
    vi.stubGlobal('fetch', turnstile(false));
    const { env, send } = makeEnv();

    const response = await worker.fetch(post(submission), env);

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ ok: false, error: 'challenge' });
    expect(send).not.toHaveBeenCalled();
  });

  it('reports a delivery failure without losing the submission silently', async () => {
    const { env, send } = makeEnv();
    send.mockRejectedValueOnce(new Error('mailbox unavailable'));
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    const response = await worker.fetch(post(submission), env);

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({ ok: false, error: 'delivery' });
    error.mockRestore();
  });

  it.each([
    ['GET', 405, { method: 'GET', body: undefined }],
    ['a non-JSON content type', 415, { headers: { 'content-type': 'text/plain' } }],
    ['an oversized body', 413, { headers: { 'content-length': String(64 * 1024) } }],
    ['a cross-origin post', 403, { headers: { origin: 'https://evil.example' } }],
  ])('rejects %s with %i', async (_label, status, init) => {
    const { env, send } = makeEnv();

    const response = await worker.fetch(post(submission, init as RequestInit), env);

    expect(response.status).toBe(status);
    expect(send).not.toHaveBeenCalled();
  });

  it('rejects a malformed body', async () => {
    const { env, send } = makeEnv();

    const response = await worker.fetch(post('{ not json'), env);

    expect(response.status).toBe(400);
    expect(send).not.toHaveBeenCalled();
  });

  it('404s anything that is not the contact endpoint', async () => {
    const { env } = makeEnv();

    const response = await worker.fetch(new Request(`${ORIGIN}/nope`), env);

    expect(response.status).toBe(404);
  });
});
