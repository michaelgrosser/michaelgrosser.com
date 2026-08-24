/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** Cloudflare Turnstile site key. Public by design; the secret half lives in Cloudflare. */
  readonly PUBLIC_TURNSTILE_SITE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  /** Injected by the Turnstile script when a site key is configured. */
  turnstile?: { reset: (widget?: string) => void };
}
