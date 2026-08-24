/**
 * Minimal ambient types for the `cloudflare:email` runtime module, which the Workers
 * type package does not declare.
 */
declare module 'cloudflare:email' {
  export class EmailMessage {
    constructor(from: string, to: string, raw: ReadableStream | string);
    readonly from: string;
    readonly to: string;
  }
}
