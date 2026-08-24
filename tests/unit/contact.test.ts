import { describe, expect, it } from 'vitest';
import { buildMessage, validateSubmission } from '../../worker/contact';
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

describe('buildMessage', () => {
  const message = buildMessage({
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    message: 'Hello there',
  });

  it('names the sender in the subject', () => {
    expect(message.subject).toBe('Contact form: Ada Lovelace');
  });

  it('puts who wrote it above what they wrote', () => {
    expect(message.text).toBe(
      ['Name: Ada Lovelace', 'Email: ada@example.com', '', 'Hello there', ''].join('\n'),
    );
  });

  it('carries non-ASCII text through untouched', () => {
    const unicode = buildMessage({
      name: 'Ada Lovelace \u{1F4A1}',
      email: 'ada@example.com',
      message: 'Gruesse ä',
    });

    expect(unicode.subject).toBe('Contact form: Ada Lovelace \u{1F4A1}');
    expect(unicode.text).toContain('ä');
  });
});
