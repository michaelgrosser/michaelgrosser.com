# MichaelGrosser.com — Technical Specification and Agent Requirements

## Purpose

This repository contains the source for MichaelGrosser.com, a personal professional website. This document is the implementation contract for coding agents working on the site.

The repository is public. Do not commit secrets, credentials, private contact details, private biographical information, unpublished employment information, API tokens, service account data, analytics identifiers that should remain secret, or any other sensitive material. Use environment variables or platform-managed secrets for non-public configuration.

## Product Goals

The site should:

- Present a polished, modern personal/professional presence.
- Feel warm, human, technically credible, and intentionally designed rather than template-driven.
- Be fast, accessible, resilient, privacy-conscious, and inexpensive to operate.
- Be straightforward for future coding agents to understand and extend.
- Prefer static rendering and progressive enhancement over client-side application complexity.
- Preserve visual consistency through a centralized design system rather than ad hoc page-specific styling.

## Technology Stack

### Required

- **Astro** for the site implementation.
- **TypeScript** where scripting is required.
- **Vanilla CSS** for styling. Do not introduce Tailwind, CSS-in-JS, or a component styling framework without an explicit architectural decision.
- **Static generation by default.** Pages should ship as static HTML whenever possible.
- **Cloudflare Workers Static Assets** for production hosting and edge delivery.
- **Cloudflare Worker endpoint** for contact-form processing.
- **Cloudflare Turnstile** for contact-form abuse prevention.
- **Cloudflare Email Service** or an explicitly approved mail provider for delivery of contact submissions.

### Avoid by Default

Do not add the following unless a requirement clearly justifies them:

- React, Vue, Svelte, or another browser-side UI framework.
- A database.
- User accounts or authentication.
- A CMS.
- Runtime server rendering for ordinary pages.
- Large JavaScript dependencies for functionality available with HTML, CSS, or small local scripts.
- Third-party trackers, advertising scripts, or invasive analytics.

## Repository Structure

Target structure:

```text
/
├── public/
│   ├── images/
│   ├── icons/
│   └── ...
├── src/
│   ├── components/
│   ├── layouts/
│   ├── pages/
│   ├── styles/
│   │   ├── tokens.css
│   │   ├── global.css
│   │   ├── typography.css
│   │   └── utilities.css
│   └── content/
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── wrangler.jsonc
└── README.md
```

Agents may refine this structure when useful, but responsibilities should remain obvious and coupling should remain low.

## Design-System Requirements

The implementation must treat the design system as a first-class architectural concern.

### Design Direction

The visual language should be:

- Structured, but not rigidly grid-obvious.
- Clean and editorial rather than dashboard-like.
- Comfortable with selective asymmetry to avoid a generic template feel.
- Restrained rather than decorative.
- Professional without feeling corporate or sterile.
- Consistent across all pages and responsive sizes.

Use asymmetry intentionally. Alignment, rhythm, and hierarchy should remain clear even when elements break from a strict column pattern.

### Design Tokens

All reusable visual values must be centralized as CSS custom properties in `src/styles/tokens.css` or an equivalent single source of truth.

Tokens should cover at minimum:

- Colors
- Typography families
- Typography scale
- Font weights
- Line heights
- Letter spacing
- Spacing scale
- Content widths
- Grid/gutter values
- Border widths
- Border radii
- Shadows, if any
- Transition durations/easing
- Responsive breakpoints where CSS custom properties are practical

Do not scatter literal colors, spacing values, or repeated typographic definitions throughout component styles when they represent design-system concepts.

### Color

The site should use a restrained neutral palette with a warm **Oxide** accent as the primary expressive color.

Requirements:

- Use the Oxide accent selectively for emphasis, interactive states, rules, details, highlighted surfaces, or other intentional moments.
- Do not flood large areas with the accent merely to create visual interest.
- Maintain sufficient text/background contrast under WCAG guidance.
- Centralize all colors as semantic tokens such as `--color-text`, `--color-background`, `--color-surface`, `--color-muted`, `--color-border`, and `--color-accent` rather than coupling components to raw palette names.

Exact token values should follow the approved design-system specification or design reference supplied to the implementation agent. Do not invent replacements when an approved value exists.

### Typography

Typography should provide a clear hierarchy while staying readable and human.

Requirements:

- Define semantic type styles for display/hero text, page headings, section headings, body text, small text, captions/metadata, labels, links, and buttons.
- Prefer fluid sizing with `clamp()` where appropriate rather than many breakpoint-specific font-size overrides.
- Keep comfortable body line length, generally around 60–75 characters for prose.
- Do not rely on font weight alone to communicate state or hierarchy.
- Fonts must be properly licensed for public web use. Prefer open-source or system fonts when practical.
- Self-host font assets when appropriate for performance/privacy; do not commit font files unless their license permits redistribution in a public repository.

### Layout

- Use a coherent responsive grid/container system.
- Preserve strong alignment anchors while allowing selected elements to span, offset, or break the grid for controlled asymmetry.
- Avoid making every section appear as an identical centered rectangle.
- Use whitespace as a primary structural tool.
- Avoid gratuitous cards and boxes where ordinary document flow would communicate hierarchy better.
- Responsive layouts should be designed intentionally, not treated as a scaled-down desktop layout.

### Components

Create reusable Astro components when a visual or behavioral pattern repeats or represents a meaningful design-system primitive.

Likely primitives include:

- Header/navigation
- Footer
- Section heading
- Buttons/links
- Project/work cards
- Content callouts
- Image/media treatment
- Contact form controls
- Social/external-link treatments

Avoid over-componentization. A component should express a reusable concept, not merely wrap a small fragment of markup once.

### Imagery

- Use responsive images and Astro image tooling where appropriate.
- Provide explicit image dimensions to minimize layout shift.
- Use modern formats when practical.
- Do not upscale low-resolution source imagery.
- Decorative images should use empty alt text; meaningful images need concise, useful alt text.
- Preserve intended crops across responsive layouts with explicit art direction where needed.

### Motion

Motion should be subtle and purposeful.

- Prefer CSS transitions over animation libraries.
- Use animation primarily for state changes, hover/focus feedback, or restrained entrance effects.
- Avoid long, theatrical page-load sequences, parallax-heavy experiences, or scroll hijacking.
- Honor `prefers-reduced-motion` and remove nonessential movement for those users.

## Pages and Content Architecture

The initial implementation should support a small professional personal site without hard-coding the architecture so tightly that adding project or writing pages becomes difficult.

Expected page categories may include:

- Home
- About
- Work/projects
- Individual project/case-study pages
- Contact

Agents should not invent personal claims, employment details, metrics, testimonials, client names, biographies, project descriptions, or contact details. Content must come from an approved public source or explicit user direction.

Content that is repeated or expected to grow should be represented as structured data/content rather than duplicated markup.

## Navigation

- Use semantic `<nav>` markup.
- Current location must be identifiable visually and, where appropriate, with `aria-current`.
- Navigation must be keyboard accessible.
- Mobile navigation must work without requiring a large client-side framework.
- External links should be distinguishable when that distinction matters to the user experience.

## Contact Form

The site must provide a working contact form.

### Client Requirements

Recommended fields:

- Name
- Email
- Message
- Hidden honeypot field
- Turnstile token

Requirements:

- Use proper `<label>` elements.
- Use native HTML validation where appropriate, supplemented by server validation.
- Clearly expose submitting, success, and failure states.
- Do not clear user-entered text on a failed submission.
- The form must remain usable with keyboard-only navigation.
- JavaScript enhancement is acceptable, but the implementation should remain lightweight.

### Server Requirements

Implement a Cloudflare Worker route, expected to be:

```text
POST /api/contact
```

The Worker must:

1. Accept only the expected HTTP method/content type.
2. Validate and normalize all submitted fields server-side.
3. Enforce conservative maximum lengths.
4. Reject malformed email addresses.
5. Reject submissions with a populated honeypot field.
6. Verify the Cloudflare Turnstile token server-side.
7. Avoid reflecting unsanitized submission content into HTML.
8. Send the submission to a configured destination address.
9. Return a small, stable JSON response contract.
10. Avoid retaining message contents unless a future requirement explicitly calls for persistence.

### Email Delivery

- The sender address used by the mail service should belong to a domain under site control.
- The visitor-provided address should be used as `Reply-To`, not forged as the message `From` address.
- Destination email addresses and mail configuration should be provided through Cloudflare configuration/secrets where possible rather than duplicated throughout source code.
- Never commit API keys or secret tokens.

### Abuse Prevention

Use multiple inexpensive layers:

- Turnstile
- Honeypot field
- Server-side validation
- Conservative message-size limits
- Cloudflare rate limiting or Worker-side throttling if abuse becomes material

Do not add invasive fingerprinting or unnecessary visitor tracking.

## Public Email Address

If an email address is displayed directly on the site:

- Allow Cloudflare Email Address Obfuscation to protect it from simple scrapers where compatible with the rendered markup.
- Do not implement homemade reversible obfuscation that harms accessibility or copy/paste behavior without a clear reason.
- Treat obfuscation as a spam-reduction measure, not as a security boundary.

## Accessibility

Target **WCAG 2.2 AA** as the implementation standard.

At minimum:

- Semantic HTML landmarks and heading hierarchy.
- Full keyboard operability.
- Visible `:focus-visible` states.
- Adequate color contrast.
- Form labels and useful error messaging.
- Descriptive alt text for meaningful imagery.
- No interaction that depends solely on hover.
- Touch targets of reasonable size.
- Respect `prefers-reduced-motion`.
- Avoid unnecessary ARIA when native HTML semantics are sufficient.
- Test at 200% browser zoom for basic usability and content reflow.

## Responsive Requirements

Test at representative narrow, medium, and wide viewport sizes rather than coding solely to specific device models.

The site must:

- Avoid horizontal scrolling at normal zoom.
- Reflow typography and layout cleanly.
- Preserve readable line lengths.
- Maintain useful whitespace without excessive empty space on small screens.
- Keep navigation and interactive controls usable on touch devices.
- Avoid breakpoint-specific duplication of content.

## Performance

Performance is a core requirement, not a post-launch optimization.

Guidelines:

- Ship minimal JavaScript.
- Prefer zero-JavaScript components where practical.
- Avoid heavy dependency bundles.
- Compress and resize imagery appropriately.
- Preload only genuinely critical resources.
- Limit third-party origins and scripts.
- Avoid render-blocking resources that do not materially improve the experience.

Target production Lighthouse scores of approximately 95+ for Performance, Accessibility, Best Practices, and SEO on representative pages, while prioritizing real user experience over score-gaming.

Core Web Vitals should fall within Google's "good" thresholds under normal production conditions.

## SEO and Metadata

Every public page should support:

- Unique `<title>`
- Meta description
- Canonical URL
- Open Graph metadata
- Social-sharing image when available
- Appropriate robots directives

Also provide:

- `sitemap.xml`
- `robots.txt`
- Favicons/site icons
- Structured data only when the content genuinely matches the schema being used

Do not keyword-stuff metadata or visible content.

## Privacy

- Do not add trackers by default.
- Do not persist contact-form submissions unless explicitly required.
- Do not expose secrets in built assets, page source, repository files, or client-side environment variables.
- Avoid collecting information that the site does not need.
- If analytics are added later, prefer a privacy-respecting solution with minimal cookie/consent burden.

## Security

- Treat all form input as untrusted.
- Keep secrets exclusively in platform secret/configuration storage.
- Apply appropriate HTTP security headers through Cloudflare or application configuration.
- Avoid inline script where practical so a useful Content Security Policy remains feasible.
- Keep dependencies current and minimize dependency count.
- Never weaken browser security controls merely to silence an integration problem.

Recommended headers to evaluate include:

- `Content-Security-Policy`
- `Referrer-Policy`
- `X-Content-Type-Options`
- `Permissions-Policy`
- `Strict-Transport-Security`

Header values must be validated against the actual site's runtime needs before deployment.

## Testing and Quality Gates

Before merging implementation work, agents should run the relevant automated checks locally.

The project should eventually provide scripts equivalent to:

```text
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
```

Recommended tooling:

- Prettier for formatting.
- ESLint where TypeScript/JavaScript linting adds value.
- Astro's type/check tooling.
- Vitest for meaningful unit tests.
- Playwright for a small set of critical browser-level flows.

Critical browser-level tests should eventually cover at least:

- Home page renders successfully.
- Primary navigation works.
- Contact form client validation behaves correctly.
- Contact-form success/failure UI behaves correctly using a mocked endpoint.
- Important pages have no obvious accessibility violations.

Do not create low-value tests that merely duplicate framework behavior or assert implementation details without protecting user-visible behavior.

## Code Quality Rules for Agents

- Favor simple, readable code over clever abstractions.
- Match established project patterns before introducing new ones.
- Keep components focused and interfaces small.
- Do not introduce a dependency for trivial functionality that can be implemented safely in a few lines.
- Remove unused code rather than commenting it out.
- Do not leave TODOs without enough context for a future agent to understand the missing decision.
- Do not silently change design-system tokens to solve isolated component problems.
- Do not hard-code user-specific content into reusable components.
- Keep build output and local tooling artifacts out of version control.
- All changes should leave the repository buildable unless the task is explicitly an intermediate scaffolding step.

## Dependency Policy

Before adding a package, an agent should be able to explain:

1. What concrete requirement it solves.
2. Why existing platform/framework/browser capabilities are insufficient.
3. Whether it runs at build time, server runtime, or in the browser.
4. Its effect on client bundle size, if any.

Prefer widely used, actively maintained packages with narrow responsibilities.

## Deployment

Target platform: **Cloudflare Workers Static Assets**.

Expected deployment behavior:

- Static Astro output is served through Cloudflare's edge network.
- Worker code handles only routes that require server-side behavior, principally `/api/contact`.
- Production deployment is associated with the repository's primary branch.
- Non-production branches should be eligible for preview deployments where the Cloudflare integration supports them.
- Secrets are configured in Cloudflare, not checked into Git.

The implementation should keep infrastructure configuration versioned where it is safe to do so, including `wrangler.jsonc` and non-secret deployment metadata.

## Agent Workflow

For implementation tasks:

1. Read this document before making architectural changes.
2. Inspect existing code and reuse established patterns.
3. Make the smallest coherent change that satisfies the requirement.
4. Add or update tests where behavior warrants them.
5. Run formatting, static analysis, tests, and the production build.
6. Review generated client output for unnecessary JavaScript or dependencies when relevant.
7. Summarize architectural decisions or deviations in the pull request.

If a requested change conflicts with this document, do not quietly work around the requirement. Surface the conflict so the specification can be intentionally revised.

## Non-Goals

Unless requirements change, this project is not intended to become:

- A single-page application.
- A general-purpose content-management platform.
- An authenticated web application.
- A data-heavy backend service.
- A showcase for unnecessary framework complexity.
- A repository containing private personal data.

The preferred implementation is a small, durable, high-quality website that takes advantage of static HTML, modern CSS, Astro's build-time composition, and narrowly scoped Cloudflare server functionality.
