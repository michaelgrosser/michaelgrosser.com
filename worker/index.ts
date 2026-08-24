/**
 * The site's only server-side code.
 *
 * Static assets are served by Cloudflare ahead of this Worker; everything that
 * reaches here is either the contact endpoint or a miss.
 */
import { EmailMessage } from 'cloudflare:email';
import { buildEmail, validateSubmission } from './contact';
import { CONTACT_ENDPOINT, type ContactResponse } from '../src/data/contact';

export interface Env {
  /** Cloudflare Email `send_email` binding. */
  CONTACT_EMAIL: SendEmail;
  /** Secret. Set with `wrangler secret put TURNSTILE_SECRET_KEY`. */
  TURNSTILE_SECRET_KEY?: string;
  /** Sender address on a domain this site controls. */
  CONTACT_FROM: string;
  /** Verified destination address. */
  CONTACT_TO: string;
}

/** Enough for the longest allowed message plus JSON overhead, and nothing more. */
const MAX_BODY_BYTES = 16 * 1024;

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/** public/_headers covers static assets; Worker responses set their own. */
const SECURITY_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
};

const json = (body: ContactResponse, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: SECURITY_HEADERS });

async function verifyTurnstile(secret: string, token: string, ip: string | null) {
  const form = new FormData();
  form.append('secret', secret);
  form.append('response', token);
  if (ip) form.append('remoteip', ip);

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, { method: 'POST', body: form });
    const result = (await response.json()) as { success?: boolean };
    return result.success === true;
  } catch (error) {
    console.error('turnstile verification failed', error);
    return false;
  }
}

async function handleContact(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') {
    return json({ ok: false, error: 'method' }, 405);
  }

  // Same-origin only. There is no reason for another site to post here.
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) {
    return json({ ok: false, error: 'origin' }, 403);
  }

  if (!request.headers.get('content-type')?.includes('application/json')) {
    return json({ ok: false, error: 'content-type' }, 415);
  }

  const declaredLength = Number(request.headers.get('content-length') ?? '0');
  if (declaredLength > MAX_BODY_BYTES) {
    return json({ ok: false, error: 'too-large' }, 413);
  }

  // Read as bytes: a string length would count UTF-16 units and let the cap drift.
  const buffer = await request.arrayBuffer();
  if (buffer.byteLength > MAX_BODY_BYTES) {
    return json({ ok: false, error: 'too-large' }, 413);
  }

  const raw = new TextDecoder().decode(buffer);

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return json({ ok: false, error: 'malformed' }, 400);
  }

  const validated = validateSubmission(payload);

  if (!validated.ok) {
    // A tripped honeypot gets the same shape as success so bots learn nothing.
    if (validated.error === 'honeypot') return json({ ok: true });
    return json({ ok: false, error: 'invalid', fields: validated.fields }, 422);
  }

  if (!env.TURNSTILE_SECRET_KEY) {
    console.error('TURNSTILE_SECRET_KEY is not configured; refusing to accept submissions.');
    return json({ ok: false, error: 'server' }, 500);
  }

  const passed = await verifyTurnstile(
    env.TURNSTILE_SECRET_KEY,
    validated.value.token,
    request.headers.get('cf-connecting-ip'),
  );

  if (!passed) {
    return json({ ok: false, error: 'challenge' }, 403);
  }

  const message = buildEmail({
    submission: validated.value,
    from: env.CONTACT_FROM,
    to: env.CONTACT_TO,
    messageId: `${crypto.randomUUID()}@${new URL(request.url).hostname}`,
    date: new Date().toUTCString(),
  });

  try {
    await env.CONTACT_EMAIL.send(new EmailMessage(env.CONTACT_FROM, env.CONTACT_TO, message));
  } catch (error) {
    // The message body is never logged: submissions are not retained anywhere.
    console.error('contact delivery failed', error);
    return json({ ok: false, error: 'delivery' }, 502);
  }

  return json({ ok: true });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (pathname === CONTACT_ENDPOINT) {
      return handleContact(request, env);
    }

    return new Response('Not found', {
      status: 404,
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'x-content-type-options': 'nosniff',
        'strict-transport-security': 'max-age=31536000; includeSubDomains',
      },
    });
  },
} satisfies ExportedHandler<Env>;
