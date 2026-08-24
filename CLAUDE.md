# michaelgrosser.com

Personal CV & contact site for Michael Grosser, Principal Software Engineer. Public repo.

## Current state

**The site does not exist yet.** The repo currently contains only `docs/`, `CLAUDE.md`, and
`.gitignore`. A previous Hugo site was deleted in commit `e6587fc`; do not resurrect it or
treat `public/` in git history as reference.

## Source of truth — read in this order

| File | Authority |
|---|---|
| `docs/ui/README.md` | **Pixel-level spec for the one page.** Colors, sizes, spacing, copy, hover behavior, breakpoints. Final and authoritative. |
| `docs/ui/reference/Personal Site Design System.md` | The design system: brand character, token values, principles, anti-patterns. Read for *why*; the README wins on *what*. |
| `docs/technical/TECHNICAL_SPEC.md` | Stack, architecture, a11y, security, testing, deployment contract. |
| `docs/ui/design/*.dc.html` | **Reference only — never port.** Design prototypes using an internal runtime (`support.js`, `<x-dc>`, `{{ }}` holes, `style-hover`, `<sc-if>`). Recreate the behavior in Astro; do not copy the markup, the inline styles, or `support.js`. |
| `docs/ui/reference/resume.md` | Source résumé content, transcribed from `resume.pdf`. The PDF is git-ignored and stays local; the personal email address and phone number on it are redacted from the Markdown. |

To view a prototype: `npx serve "docs/ui/design"` — `file://` will not load `support.js`.

`Personal Site (option explorations).dc.html` is dead context: option 3A won and became
`Michael Grosser Site.dc.html`.

## Scope

**One page, one route.** Sticky nav → hero (`#top`) → `01 Experience` → `02 Expertise` →
`03 Education & Certification` → `04 Contact` → footer. No blog, no portfolio, no project
pages, no About page, no dark mode.

Two non-content routes exist for infrastructure reasons and are not exceptions to the
above: `sitemap.xml` and `404.astro`. The 404 page is what lets Cloudflare answer unmatched
paths from static assets instead of spending a Worker invocation — see README § Routing.

The technical spec lists possible future page categories (About, Work, case studies). Those
are *not* in scope — build the architecture so they'd be easy to add, but don't add them.

## Stack

- **Astro**, static output. TypeScript where scripting is needed.
- **Vanilla CSS only.** No Tailwind, no CSS-in-JS, no UI framework (React/Vue/Svelte).
- **Cloudflare Workers Static Assets** for hosting; a Worker handles `POST /api/contact`
  only. `wrangler.jsonc` is versioned; secrets live in Cloudflare, never in git.
- Cloudflare Turnstile + honeypot + server-side validation for the contact form.
- Total client JS should be roughly: a mobile-menu toggle and a small form-submit handler.
  If a change adds more than that, justify it.

Target structure is in `TECHNICAL_SPEC.md` § Repository Structure.

## Design rules that get violated most often

- **No literal hex/spacing values in component CSS.** Everything lives in
  `src/styles/tokens.css` as semantic custom properties (`--color-accent`, not `--oxide-500`
  at the point of use). Don't tweak a token to fix one component.
- **Light mode only.** No `prefers-color-scheme` handling.
- **Oxide (`#B64834`) is an accent, not a theme.** It should occupy a small fraction of the
  page: the hero band tint, the primary button, active timeline dot, links, hover states.
- **No shadows anywhere.** No gradients. No cards-around-everything — use whitespace,
  hairlines, and type for structure.
- The prototype fakes responsiveness with `!important` overrides on `data-r` attributes.
  Reimplement as normal cascade at the ≤1000 / ≤760 / ≤700px breakpoints described in
  `docs/ui/README.md`.
- `outline: 2px solid #B64834; outline-offset: 3px` on `:focus-visible` — never remove it.
- Honor `prefers-reduced-motion`.
- Target WCAG 2.2 AA and ~95+ Lighthouse across all four categories.

## Assets — all must be self-hosted

The prototype hotlinks CDNs. Production must not.

- **`docs/ui/design/photo.png` is 3.6 MB.** Ship a resized, compressed AVIF/WebP + fallback,
  cropped 3:4, `object-position: 50% 20%`. Never ship the source PNG.
- **Fonts:** Encode Sans Semi Expanded (400/500/600) and Fira Mono (400). Self-host with
  `font-display: swap`; do not use the Google Fonts CDN. Confirm the license permits
  redistribution before committing font files to this public repo.
- **Icons:** Phosphor Regular — `envelope-simple`, `linkedin-logo`, `x-logo`, `list`, `x`,
  `paper-plane-tilt`. Inline the SVGs and color with `currentColor` rather than the
  prototype's `mask-image` + CDN URL trick.
- **Tech logos:** Simple Icons, vendored locally. Check each vendor's trademark guidance
  before shipping.

## Content rules

Content comes from the résumé, `docs/ui/README.md`, or explicit user direction — nothing
else. **Do not invent** metrics, testimonials, projects, clients, job details, dates, or
biography. The approved copy is verbatim in `docs/ui/README.md`; the only stated location is
"CHICAGO, IL" in the hero eyebrow.

`michael@michaelgrosser.com` is intended to be public (rendered through Cloudflare Email
Address Obfuscation). No other contact details belong in the repo.

The social URLs in the prototype are confirmed correct and may be used as-is:
`linkedin.com/in/michaelgrosser`, `x.com/michaelgrosser`, `github.com/michaelgrosser`.

## Before you call work done

Once `package.json` exists, run: `npm run format:check`, `npm run lint`, `npm run typecheck`,
`npm run test`, `npm run build`. Tooling target is Prettier, ESLint, `astro check`, Vitest,
and a small Playwright suite (home renders, nav works, form validation, form success/failure
against a mocked endpoint, no obvious a11y violations).

Don't write tests that assert framework behavior or implementation details.

## Environment

Windows 11, PowerShell primary. Paths in these docs are Windows-absolute; keep npm scripts
cross-platform (avoid shell-specific syntax in `package.json`).

## When a request conflicts with the docs

Say so and stop — don't quietly work around a requirement in `TECHNICAL_SPEC.md` or change
a design value from `docs/ui/README.md` to make something easier. Surface the conflict so
the spec can be revised on purpose.

## Reviewing your own work

Michael should never be the first to find a bug or a spec mismatch. After any change to the
page, the Worker, or the styles, run the `self-review` skill — it builds, captures the page
in a real browser at every breakpoint, has you *look* at the screenshots, runs axe, and then
dispatches both review agents.

Two review personas live in `.claude/agents/`, with deliberately disjoint scope:

- **`correctness-reviewer`** — Worker logic, form behavior, build output, secrets,
  dependencies, CI/CD, and whether résumé content matches the source.
- **`design-a11y-reviewer`** — fidelity to `docs/ui/README.md`, token discipline,
  design-system principles, responsive behavior, and WCAG 2.2 AA.

Dispatch them concurrently; neither needs the other's output.

The browser harness is `scripts/review/capture.mjs`, writing to `.review/` (gitignored). Its
hover captures depend on `data-review` attributes — `experience-row`, `education-item`,
`logo`, `icon-button`, `primary-button` — so add those attributes as you build the
components, or those states never get checked.

Reading CSS is not the same as seeing the page. Do not skip the visual step.

### Browser access

Two MCP browser stacks are available:

- **chrome-devtools MCP** — own Chrome instance. The interactive/diagnostic layer, plus
  `lighthouse_audit` (the ~95+ check) and `emulate` for CPU/network throttling. Verified
  working; the design prototype renders in it with CDN fonts and icons intact, so the
  captured baseline is a real pixel reference.
- **claude-in-chrome MCP** — drives Michael's actual Chrome with his logged-in session.
  Reserved for authenticated work such as the Cloudflare dashboard. Ask before opening tabs
  in his browser.

`scripts/review/capture.mjs` (Playwright) stays the deterministic sweep — all viewports,
hover states, overflow numbers, axe, one command, CI-runnable. Use the MCP to diagnose what
the sweep flags.
