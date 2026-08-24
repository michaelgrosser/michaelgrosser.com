/**
 * Contact-form contract shared by the page and the Worker.
 *
 * The Worker re-validates everything; these limits exist so the browser and the
 * server agree on what "too long" means instead of drifting apart.
 */

export const CONTACT_ENDPOINT = '/api/contact';

export const CONTACT_LIMITS = {
  name: 120,
  /** RFC 5321 caps an address at 254 characters. */
  email: 254,
  message: 4000,
} as const;

/**
 * Field that only a bot will fill in. Deliberately not an autofill token name —
 * "company" is the `organization` signature and browsers fill it unprompted.
 */
export const HONEYPOT_FIELD = 'subject';

export const CONTACT_MESSAGES = {
  name: 'Please enter your name.',
  email: 'Please enter a valid email address.',
  message: 'Please enter a message.',
  tooLong: 'That is longer than this form accepts.',
  failed: 'Something went wrong sending your message. Please try again or email me directly.',
  challenge: 'The spam check did not pass. Please try again, or email me directly instead.',
} as const;

export type ContactFieldErrors = Partial<Record<'name' | 'email' | 'message', string>>;

/** Every failure the Worker can report; the union keeps both ends of the wire in step. */
export type ContactError =
  | 'method'
  | 'origin'
  | 'content-type'
  | 'too-large'
  | 'malformed'
  | 'invalid'
  | 'challenge'
  | 'delivery'
  | 'server';

export type ContactResponse =
  { ok: true } | { ok: false; error: ContactError; fields?: ContactFieldErrors };
