/**
 * Stand-in for the `cloudflare:email` runtime module, which only exists inside the
 * Workers runtime. Vitest aliases the import to this file; see vitest.config.ts.
 */
export class EmailMessage {
  constructor(
    readonly from: string,
    readonly to: string,
    readonly raw: string,
  ) {}
}
