# michaelgrosser.com

The personal CV and contact site for Michael Grosser: one static page, one Worker route.

- **Framework:** [Astro](https://astro.build) in static mode, vanilla CSS, no UI framework.
- **Hosting:** Cloudflare Workers Static Assets.
- **Server code:** a single Worker handling `POST /api/contact`.

The design contract lives in [`docs/ui/README.md`](docs/ui/README.md); the engineering
contract lives in [`docs/technical/TECHNICAL_SPEC.md`](docs/technical/TECHNICAL_SPEC.md).
Both are authoritative — read them before changing anything visual or structural.

## Commands

| Command                 | What it does                                          |
| ----------------------- | ----------------------------------------------------- |
| `npm run dev`           | Astro dev server                                      |
| `npm run build`         | Static build into `dist/`                             |
| `npm run preview`       | Serve the built site                                  |
| `npm run format:check`  | Prettier                                              |
| `npm run lint`          | ESLint                                                |
| `npm run typecheck`     | `astro check` plus a TypeScript pass over `worker/`   |
| `npm run test`          | Vitest unit tests (validation, MIME building, Worker) |
| `npm run test:e2e`      | Playwright browser tests (builds first)               |
| `npm run review`        | Screenshot/axe sweep into `.review/` (see below)      |
| `npm run check:release` | Refuses a build that cannot work in production        |
| `npm run deploy`        | Build, release check, `wrangler deploy`               |

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
5. sends the message through Cloudflare Email with the visitor's address as `Reply-To`;
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

2. **Email.** In Cloudflare Email Routing, verify `michael@michaelgrosser.com` as a
   destination address so the `send_email` binding in `wrangler.jsonc` can deliver to it.
   That address is both `CONTACT_FROM` and `CONTACT_TO` — it is the only address the site
   publishes, and `From` must stay on a domain under site control. The visitor's address
   is used as `Reply-To`, never forged as `From`.

3. **DNS.** `www.michaelgrosser.com` is the canonical host — every canonical URL, `og:url`
   and the sitemap point at it. `wrangler.jsonc` declares it as a custom domain, so
   `wrangler deploy` creates the record itself; if a `www` record already exists in
   Cloudflare DNS, delete it first or the deploy will refuse to overwrite it.

   The apex does not serve the site. Point it at www with a Cloudflare **Redirect Rule**:
   match hostname `michaelgrosser.com`, redirect to
   `concat("https://www.michaelgrosser.com", http.request.uri.path)`, status 301, with
   _preserve query string_ on. A redirect rule needs something proxied on the apex to fire
   against, so add a proxied `AAAA` record for `@` pointing at `100::` if there isn't one.
   Neither touches the apex `MX`, so mail is unaffected.

4. **Deploy.** Push to `main`. See _Deployment_ below.

Security headers, including the Content-Security-Policy, are in `public/_headers`. The CSP
allows only `self` plus `challenges.cloudflare.com`, which is why the build emits no inline
`<style>` or `<script>`. The one concession is `'unsafe-inline'` in `style-src`: Turnstile
styles its own widget container in this document and Cloudflare documents that as a
requirement. Nothing else on the page relies on it.

## Deployment

`main` deploys itself. `.github/workflows/ci.yml` runs the five gates plus the browser
suite on every pull request, and on a push to `main` it builds with the production
Turnstile key, runs the release check, and calls `wrangler deploy`. Nothing deploys that
has not passed the gates first.

Configure it once, in **Settings → Secrets and variables → Actions**:

| Scope                               | Name                        | Value                                                                                        |
| ----------------------------------- | --------------------------- | -------------------------------------------------------------------------------------------- |
| Repository **variable**             | `PUBLIC_TURNSTILE_SITE_KEY` | The Turnstile site key. Public, and pull-request jobs cannot read environment-scoped values. |
| `production` environment **secret** | `CLOUDFLARE_API_TOKEN`      | An _Edit Cloudflare Workers_ token.                                                          |
| `production` environment **secret** | `CLOUDFLARE_ACCOUNT_ID`     | Kept beside the token so deploy credentials live in one place.                               |

Create the environment under **Settings → Environments**, and restrict its deployment
branches to `main`. That is what stops a workflow on any other branch from reading the
deploy token.

The Worker's own secrets — `TURNSTILE_SECRET_KEY` and `RESEND_API_KEY` — are **not** in
GitHub. They live in Cloudflare, survive every deploy, and are set once: either with
`wrangler secret put`, or in the dashboard under the Worker's Settings → Variables and
Secrets. Until both exist the form fails closed with a 500.

Do not also connect Cloudflare's Workers Builds Git integration. Two pipelines watching
`main` means every push deploys twice.

Preview deployments for pull requests are not set up. `wrangler versions upload` needs the
Worker to already exist, so it is a follow-up to the first deploy rather than part of it —
and a preview shares the live Worker's secrets, so a form submission from one sends real
mail.

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
