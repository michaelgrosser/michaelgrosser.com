import { describe, expect, it } from 'vitest';
import { buildEmail, validateSubmission } from '../../worker/contact';
import { CONTACT_LIMITS, CONTACT_MESSAGES, HONEYPOT_FIELD } from '../../src/data/contact';

const valid = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  message: 'Hello — can we talk about your platform work?',
  token: 'turnstile-token',
};

describe('validateSubmission', () => {
  it('accepts a well-formed submission and normalizes it', () => {
    const result = validateSubmission({ ...valid, email: '  Ada@Example.com ' });
    expect(result).toEqual({
      ok: true,
      value: { ...valid, email: 'ada@example.com' },
    });
  });

  it('reports a message for every missing field', () => {
    const result = validateSubmission({ name: '  ', email: '', message: '\n\n' });
    expect(result).toEqual({
      ok: false,
      error: 'invalid',
      fields: {
        name: CONTACT_MESSAGES.name,
        email: CONTACT_MESSAGES.email,
        message: CONTACT_MESSAGES.message,
      },
    });
  });

  it.each(['not-an-email', 'no@domain', 'two@@example.com', 'spa ce@example.com', 'a@b.'])(
    'rejects %s as an email address',
    (email) => {
      const result = validateSubmission({ ...valid, email });
      expect(result.ok).toBe(false);
      expect(result.ok === false && result.error === 'invalid' && result.fields.email).toBe(
        CONTACT_MESSAGES.email,
      );
    },
  );

  it('rejects a submission whose honeypot was filled', () => {
    expect(validateSubmission({ ...valid, [HONEYPOT_FIELD]: 'Acme' })).toEqual({
      ok: false,
      error: 'honeypot',
    });
  });

  it('rejects fields beyond the shared limits', () => {
    const result = validateSubmission({
      ...valid,
      message: 'x'.repeat(CONTACT_LIMITS.message + 1),
    });
    expect(result.ok === false && result.error === 'invalid' && result.fields.message).toBe(
      CONTACT_MESSAGES.tooLong,
    );
  });

  it('strips control characters from single-line fields', () => {
    const result = validateSubmission({ ...valid, name: 'Ada\r\nBcc: victim@example.com' });
    expect(result.ok && result.value.name).toBe('Ada Bcc: victim@example.com');
  });

  it('rejects a payload that is not an object', () => {
    expect(validateSubmission('nope').ok).toBe(false);
    expect(validateSubmission(null).ok).toBe(false);
  });
});

describe('buildEmail', () => {
  const message = buildEmail({
    submission: { name: 'Ada Lovelace', email: 'ada@example.com', message: 'Hello there' },
    from: 'contact@michaelgrosser.com',
    to: 'michael@michaelgrosser.com',
    messageId: 'test-id@michaelgrosser.com',
    date: 'Mon, 24 Aug 2026 12:00:00 GMT',
  });

  it('sends from the site and replies to the visitor', () => {
    expect(message).toContain('From: <contact@michaelgrosser.com>');
    expect(message).toContain('To: <michael@michaelgrosser.com>');
    expect(message).toContain('Reply-To: <ada@example.com>');
  });

  it('carries the required Message-ID and Date headers', () => {
    expect(message).toContain('Message-ID: <test-id@michaelgrosser.com>');
    expect(message).toContain('Date: Mon, 24 Aug 2026 12:00:00 GMT');
  });

  it('encodes the body as base64 so submitted text cannot forge a header', () => {
    const [headers, body] = message.split('\r\n\r\n');
    expect(headers).toContain('Content-Transfer-Encoding: base64');
    expect(atob(body.trim())).toContain('Hello there');
    expect(body).not.toContain('Hello there');
  });

  it('leaves an ASCII subject unencoded', () => {
    expect(message).toContain('Subject: Contact form: Ada Lovelace');
  });

  it('folds a non-ASCII subject into RFC 2047 words under the length limit', () => {
    const raw = buildEmail({
      submission: {
        name: 'Ada Lovelace \u{1F4A1} ' + 'Ää'.repeat(40),
        email: 'ada@example.com',
        message: 'Hi',
      },
      from: 'contact@michaelgrosser.com',
      to: 'michael@michaelgrosser.com',
      messageId: 'test-id@michaelgrosser.com',
      date: 'Mon, 24 Aug 2026 12:00:00 GMT',
    });

    const headers = raw.split('\r\n\r\n')[0]!.split('\r\n');
    const first = headers.findIndex((line) => line.startsWith('Subject:'));
    const subjectLines = [headers[first]!];
    for (let i = first + 1; i < headers.length && headers[i]!.startsWith(' '); i++) {
      subjectLines.push(headers[i]!);
    }

    expect(subjectLines.length).toBeGreaterThan(1);
    for (const line of subjectLines) {
      expect(line.length).toBeLessThanOrEqual(78);
      expect(line.trim()).toMatch(/^(Subject: )?=\?UTF-8\?B\?[A-Za-z0-9+/=]+\?=$/);
    }

    // Each word must decode on its own: a split UTF-8 sequence would corrupt here.
    const decoded = Buffer.concat(
      subjectLines.map((line) =>
        Buffer.from(/=\?UTF-8\?B\?([A-Za-z0-9+/=]+)\?=/.exec(line)![1]!, 'base64'),
      ),
    ).toString('utf8');
    expect(decoded).toContain('\u{1F4A1}');
  });
});
