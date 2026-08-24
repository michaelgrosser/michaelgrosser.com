/**
 * Pure helpers for the contact endpoint: validation, normalization and message
 * construction. Kept free of Worker globals so they can be unit tested directly.
 */
import {
  CONTACT_LIMITS,
  CONTACT_MESSAGES,
  HONEYPOT_FIELD,
  type ContactFieldErrors,
} from '../src/data/contact';

export type ContactSubmission = {
  name: string;
  email: string;
  message: string;
  token: string;
};

export type ValidationResult =
  | { ok: true; value: ContactSubmission }
  | { ok: false; error: 'honeypot' }
  | { ok: false; error: 'invalid'; fields: ContactFieldErrors };

/**
 * Deliberately conservative: ASCII only, one @, a dotted domain with no leading or
 * trailing hyphen, and none of the characters that could break out of a header line.
 * Internationalized addresses are rejected rather than passed raw to the mail binding.
 */
const EMAIL_PATTERN =
  /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~.-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/;

/** Collapses a value to one safe line: no control characters, no runs of space. */
const stripControl = (value: string) =>
  value
    // eslint-disable-next-line no-control-regex -- matching control characters is the point
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** Normalizes line endings and drops the control characters a mail body cannot carry. */
const cleanMultiline = (value: string) =>
  value
    .replace(/\r\n?/g, '\n')
    // eslint-disable-next-line no-control-regex -- matching control characters is the point
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '')
    .trim();

const asString = (value: unknown) => (typeof value === 'string' ? value : '');

export function validateSubmission(payload: unknown): ValidationResult {
  if (typeof payload !== 'object' || payload === null) {
    return { ok: false, error: 'invalid', fields: { name: CONTACT_MESSAGES.name } };
  }

  const input = payload as Record<string, unknown>;

  // A filled honeypot is a bot. Report nothing useful back.
  if (asString(input[HONEYPOT_FIELD]).trim() !== '') {
    return { ok: false, error: 'honeypot' };
  }

  const name = stripControl(asString(input.name));
  const email = stripControl(asString(input.email)).toLowerCase();
  const message = cleanMultiline(asString(input.message));
  const fields: ContactFieldErrors = {};

  if (!name) fields.name = CONTACT_MESSAGES.name;
  else if (name.length > CONTACT_LIMITS.name) fields.name = CONTACT_MESSAGES.tooLong;

  if (!email || !EMAIL_PATTERN.test(email) || email.length > CONTACT_LIMITS.email) {
    fields.email = CONTACT_MESSAGES.email;
  }

  if (!message) fields.message = CONTACT_MESSAGES.message;
  else if (message.length > CONTACT_LIMITS.message) fields.message = CONTACT_MESSAGES.tooLong;

  if (Object.keys(fields).length > 0) {
    return { ok: false, error: 'invalid', fields };
  }

  return { ok: true, value: { name, email, message, token: asString(input.token) } };
}

const encodeBase64 = (bytes: Uint8Array) => {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
};

const base64Utf8 = (value: string) => encodeBase64(new TextEncoder().encode(value));

/**
 * RFC 2047 encoded-words, used only when a header value is not plain ASCII.
 *
 * An encoded word may not exceed 75 characters, so the payload is chunked at 39 bytes
 * (52 base64 characters, 64 including the delimiters) and long values are folded onto
 * continuation lines. A chunk never splits a UTF-8 sequence.
 */
const ENCODED_WORD_BYTES = 39;

const encodeHeader = (value: string) => {
  if (/^[ -~]*$/.test(value)) return value;

  const bytes = new TextEncoder().encode(value);
  const words: string[] = [];

  for (let start = 0; start < bytes.length;) {
    let length = Math.min(ENCODED_WORD_BYTES, bytes.length - start);
    // 0b10xxxxxx marks a continuation byte: back off until the split is a real boundary.
    while (start + length < bytes.length && (bytes[start + length]! & 0xc0) === 0x80) length--;
    words.push(`=?UTF-8?B?${encodeBase64(bytes.subarray(start, start + length))}?=`);
    start += length;
  }

  return words.join('\r\n ');
};

/** RFC 2045 requires base64 bodies to wrap at 76 characters. */
const wrap = (value: string) => value.match(/.{1,76}/g)?.join('\r\n') ?? '';

export type EmailOptions = {
  submission: Pick<ContactSubmission, 'name' | 'email' | 'message'>;
  from: string;
  to: string;
  /** Injected so the output is deterministic in tests. */
  messageId: string;
  date: string;
};

/**
 * Builds the raw RFC 5322 message handed to Cloudflare Email.
 *
 * The visitor's address becomes `Reply-To`; `From` stays on a domain this site
 * controls, because forging the sender fails SPF/DKIM. Submitted text only ever
 * reaches the base64-encoded body, so it cannot forge a header.
 */
export function buildEmail({ submission, from, to, messageId, date }: EmailOptions): string {
  const body = [
    `Name: ${submission.name}`,
    `Email: ${submission.email}`,
    '',
    submission.message,
    '',
  ].join('\n');

  return [
    `From: <${from}>`,
    `To: <${to}>`,
    `Reply-To: <${submission.email}>`,
    `Subject: ${encodeHeader(`Contact form: ${submission.name}`)}`,
    `Message-ID: <${messageId}>`,
    `Date: ${date}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    wrap(base64Utf8(body)),
    '',
  ].join('\r\n');
}
