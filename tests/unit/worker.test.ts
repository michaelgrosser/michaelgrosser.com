import { afterEach, describe, expect, it, vi } from 'vitest';
import worker, { type Env } from '../../worker/index';
import { CONTACT_ENDPOINT } from '../../src/data/contact';

const ORIGIN = 'https://michaelgrosser.com';

const submission = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  message: 'Hello, I would like to talk.',
  token: 'turnstile-token',
};

const makeEnv = (overrides: Partial<Env> = {}) =>
  ({
    TURNSTILE_SECRET_KEY: 'turnstile-secret',
    RESEND_API_KEY: 'resend-key',
    CONTACT_FROM: 'michael@michaelgrosser.com',
    CONTACT_TO: 'michael@michaelgrosser.com',
    ...overrides,
  }) satisfies Env;

type ResendCall = { headers: Headers; body: Record<string, unknown> };

/**
 * Stands in for both outbound calls the Worker makes, and records what Resend was
 * asked to send. Nothing leaves the process.
 */
function stubNetwork({ turnstilePasses = true, resendStatus = 200 } = {}) {
  const resend: ResendCall[] = [];

  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (url.includes('siteverify')) {
        return new Response(JSON.stringify({ success: turnstilePasses }), { status: 200 });
      }

      if (url.startsWith('https://api.resend.com/emails')) {
        resend.push({
          headers: new Headers(init?.headers),
          body: JSON.parse(String(init?.body)),
        });
        return new Response(JSON.stringify(resendStatus === 200 ? { id: 'msg_1' } : {}), {
          status: resendStatus,
        });
      }

      throw new Error(`unexpected fetch to ${url}`);
    }),
  );

  return resend;
}

const post = (body: unknown, init: RequestInit = {}) =>
  new Request(`${ORIGIN}${CONTACT_ENDPOINT}`, {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
    ...init,
    // Merged last: overrides are meant to replace one header, not all of them.
    headers: { 'content-type': 'application/json', origin: ORIGIN, ...(init.headers ?? {}) },
  });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('POST /api/contact', () => {
  it('hands a valid submission to Resend exactly once', async () => {
    const resend = stubNetwork();

    const response = await worker.fetch(post(submission), makeEnv());

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(resend).toHaveLength(1);

    expect(resend[0]!.headers.get('authorization')).toBe('Bearer resend-key');
    expect(resend[0]!.body).toMatchObject({
      from: 'michael@michaelgrosser.com',
      to: ['michael@michaelgrosser.com'],
      // The visitor is the reply address, never the sender.
      reply_to: 'ada@example.com',
      subject: 'Contact form: Ada Lovelace',
    });
    expect(resend[0]!.body.text).toContain('Hello, I would like to talk.');
  });

  it('answers a tripped honeypot as if it succeeded, and sends nothing', async () => {
    const resend = stubNetwork();

    const response = await worker.fetch(post({ ...submission, subject: 'Acme' }), makeEnv());

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(resend).toHaveLength(0);
  });

  it('returns per-field errors for an invalid submission', async () => {
    const resend = stubNetwork();

    const response = await worker.fetch(post({ ...submission, email: 'nope' }), makeEnv());

    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toMatchObject({ ok: false, error: 'invalid' });
    expect(resend).toHaveLength(0);
  });

  it.each([
    ['the Turnstile secret', { TURNSTILE_SECRET_KEY: undefined }],
    ['the Resend API key', { RESEND_API_KEY: undefined }],
  ])('refuses every submission while %s is unconfigured', async (_label, missing) => {
    const resend = stubNetwork();
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    const response = await worker.fetch(post(submission), makeEnv(missing));

    expect(response.status).toBe(500);
    expect(resend).toHaveLength(0);
    error.mockRestore();
  });

  it('rejects a submission Turnstile does not vouch for', async () => {
    const resend = stubNetwork({ turnstilePasses: false });

    const response = await worker.fetch(post(submission), makeEnv());

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ ok: false, error: 'challenge' });
    expect(resend).toHaveLength(0);
  });

  it('reports a Resend rejection as a delivery failure', async () => {
    stubNetwork({ resendStatus: 422 });
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    const response = await worker.fetch(post(submission), makeEnv());

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({ ok: false, error: 'delivery' });
    error.mockRestore();
  });

  it('reports an unreachable provider as a delivery failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        if (String(input).includes('siteverify')) {
          return new Response(JSON.stringify({ success: true }), { status: 200 });
        }
        throw new Error('network down');
      }),
    );
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    const response = await worker.fetch(post(submission), makeEnv());

    expect(response.status).toBe(502);
    error.mockRestore();
  });

  it.each([
    ['GET', 405, { method: 'GET', body: undefined }],
    ['a non-JSON content type', 415, { headers: { 'content-type': 'text/plain' } }],
    ['an oversized body', 413, { headers: { 'content-length': String(64 * 1024) } }],
    ['a cross-origin post', 403, { headers: { origin: 'https://evil.example' } }],
  ])('rejects %s with %i', async (_label, status, init) => {
    const resend = stubNetwork();

    const response = await worker.fetch(post(submission, init as RequestInit), makeEnv());

    expect(response.status).toBe(status);
    expect(resend).toHaveLength(0);
  });

  it('rejects a malformed body', async () => {
    const resend = stubNetwork();

    const response = await worker.fetch(post('{ not json'), makeEnv());

    expect(response.status).toBe(400);
    expect(resend).toHaveLength(0);
  });

  it('404s anything that is not the contact endpoint', async () => {
    stubNetwork();

    const response = await worker.fetch(new Request(`${ORIGIN}/nope`), makeEnv());

    expect(response.status).toBe(404);
  });
});
