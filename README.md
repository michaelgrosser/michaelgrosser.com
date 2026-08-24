# michaelgrosser.com

The personal CV and contact site for Michael Grosser: one static page, one Worker route.

- **Framework:** [Astro](https://astro.build) in static mode, vanilla CSS, no UI framework.
- **Hosting:** Cloudflare Workers Static Assets.
- **Server code:** a single Worker handling `POST /api/contact`.

The design contract lives in [`docs/ui/README.md`](docs/ui/README.md); the engineering
contract lives in [`docs/technical/TECHNICAL_SPEC.md`](docs/technical/TECHNICAL_SPEC.md).
Both are authoritative — read them before changing anything visual or structural.

## Commands

| Command                 | What it does                                             |
| ----------------------- | -------------------------------------------------------- |
| `npm run dev`           | Astro dev server                                         |
| `npm run build`         | Static build into `dist/`                                |
| `npm run preview`       | Serve the built site                                     |
| `npm run format:check`  | Prettier                                                 |
| `npm run lint`          | ESLint                                                   |
| `npm run typecheck`     | `astro check` plus a TypeScript pass over `worker/`      |
| `npm run test`          | Vitest unit tests (validation, message building, Worker) |
| `npm run test:e2e`      | Playwright browser tests (builds first)                  |
| `npm run review`        | Screenshot/axe sweep into `.review/` (see below)         |
| `npm run check:release` | Refuses a build that cannot work in production           |
| `npm run deploy`        | Build, release check, `wrangler deploy`                  |

Run the first five before calling any change done.

## Layout

```text
public/            static assets served as-is: fonts, favicons, robots.txt, _headers
src/
  assets/          images processed at build time
  components/      one component per section, plus Icon/Button/IconButton primitives
  data/            content and the contact contract shared with the Worker
  icons/           vendored SVGs, inlined at build time
  layouts/         document shell: metadata, fonts, global styles
  pages/           index.astro and the generated sitemap
  scripts/         the two pieces of client-side JavaScript
  styles/          tokens.css, typography.css, global.css, utilities.css
worker/            the Cloudflare Worker and its pure helpers
scripts/review/    self-review capture harness
tests/             unit (Vitest) and e2e (Playwright)
```

Every reusable visual value is a semantic custom property in `src/styles/tokens.css`.
Components must not hard-code colours, spacing, radii or durations.

## Contact form

The browser posts JSON to `POST /api/contact`. The Worker:

1. accepts only `POST` with `application/json`, from its own origin;
2. re-validates and normalizes every field, enforcing the limits in `src/data/contact.ts`;
3. rejects a filled honeypot (answering as if it succeeded);
4. verifies the Turnstile token server-side;
5. hands the message to Resend with the visitor's address as `Reply-To`;
6. returns `{ "ok": true }` or `{ "ok": false, "error": "...", "fields": { ... } }`.

Submissions are never persisted or logged.

### Before the first deploy

1. **Turnstile.** Create a widget for `michaelgrosser.com`, then:
   - put the **site key** in `PUBLIC_TURNSTILE_SITE_KEY` — it is public by design, so a
     local `.env` (see `.env.example`) or the build environment is fine;
   - store the **secret key**: `npx wrangler secret put TURNSTILE_SECRET_KEY`.

   The Worker refuses every submission while that secret is unset.

   Without the site key the build still succeeds — tests and the review harness need to
   run anywhere — but it falls back to Cloudflare's always-passes _test_ key, which the
   production secret rejects. That build would take submissions and drop every one of
   them, so `npm run check:release` fails on it and `npm run deploy` will not ship it.
   **Deploy with `npm run deploy`, not `wrangler deploy` directly**, or that check is
   skipped.

2. **Email.** Verify `michaelgrosser.com` in Resend and add the DNS records it generates:
   an `MX` and an SPF `TXT` on `send.michaelgrosser.com`, and a DKIM `TXT` at
   `resend._domainkey`. None of them touch the apex `MX`, so existing mail on this domain
   is unaffected — which is why delivery does not use Cloudflare Email Routing, whose
   `send_email` binding would require the apex `MX` to point at Cloudflare.

   Then create a sending-scoped API key and store it:
   `npx wrangler secret put RESEND_API_KEY`.

   `CONTACT_FROM` and `CONTACT_TO` are both `michael@michaelgrosser.com` — the only
   address the site publishes, and `From` has to stay on a domain under site control. The
   visitor's address is used as `Reply-To`, never forged as `From`. The Worker refuses
   every submission while either secret is missing.

3. **Deploy.** `npm run build && npx wrangler deploy`.

Security headers, including the Content-Security-Policy, are in `public/_headers`. The CSP
allows only `self` plus `challenges.cloudflare.com`, which is why the build emits no inline
`<style>` or `<script>`. The one concession is `'unsafe-inline'` in `style-src`: Turnstile
styles its own widget container in this document and Cloudflare documents that as a
requirement. Nothing else on the page relies on it.

## Self-review

`npm run review` builds nothing itself — run `npm run build` first — then renders the site
and the approved design prototype at seven widths, captures hover, focus and open-menu
states, measures horizontal overflow, and runs axe. Output lands in `.review/` (gitignored).

Reading the CSS is not the same as looking at the page: read the PNGs.

## Third-party assets

| Asset                                 | Source                   | Licence                                              |
| ------------------------------------- | ------------------------ | ---------------------------------------------------- |
| Encode Sans Semi Expanded 400/500/600 | Google Fonts             | SIL Open Font License 1.1                            |
| Fira Mono 400                         | Google Fonts             | SIL Open Font License 1.1                            |
| UI icons                              | Phosphor Icons (Regular) | MIT                                                  |
| GitHub mark, technology marks         | Simple Icons             | CC0 artwork; each mark remains its owner's trademark |

Font licences are committed alongside the files in `public/fonts/`. The technology marks
identify the technologies they represent and are not used as endorsements.
