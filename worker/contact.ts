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

/**
 * The message Resend is asked to send.
 *
 * `From` stays on a domain this site controls — forging the visitor's address as the
 * sender fails SPF and DKIM — and the visitor becomes `Reply-To` instead. Everything
 * submitted travels as JSON in the request body, so there is no header for it to
 * break out of and no MIME encoding to get wrong.
 */
export function buildMessage(submission: Pick<ContactSubmission, 'name' | 'email' | 'message'>) {
  return {
    subject: `Contact form: ${submission.name}`,
    text: [
      `Name: ${submission.name}`,
      `Email: ${submission.email}`,
      '',
      submission.message,
      '',
    ].join('\n'),
  };
}
