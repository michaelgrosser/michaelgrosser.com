# Handoff: michaelgrosser.com — single-page CV & contact site

Target repo: `C:\Users\micha\Workspace\michaelgrosser.com`

## Overview

A single-page personal site for Michael Grosser, Principal Software Engineer. It is a CV and contact site — no blog, no project portfolio, no additional routes. Sections, in order: sticky nav → hero → 01 Experience → 02 Expertise (tech logos) → 03 Education & Certification → 04 Contact (copy + form) → footer.

## About the design files

The files in `design/` are **design references written as HTML prototypes** — they show intended look and behavior, not production code to lift. `Michael Grosser Site.dc.html` uses an internal design-prototyping runtime (`support.js`, `<x-dc>`, `{{ }}` holes, `style-hover` attributes, `<sc-if>`), so it will not run in a normal build. **Recreate it** in whatever stack you pick for the repo.

Recommended stack if the repo is empty: **Astro** or **Next.js (static export)** with plain CSS/CSS modules or Tailwind, deployed to Cloudflare Pages (Cloudflare email obfuscation is already the plan for the address). The design is static; no client framework is required beyond the mobile-menu toggle.

To view the prototype locally: serve the `design/` folder over HTTP (e.g. `npx serve design`) and open `Michael Grosser Site.dc.html` — opening from `file://` will not load `support.js` correctly.

## Fidelity

**High-fidelity.** All colors, type sizes, spacing, radii, transitions and copy below are final. Recreate pixel-for-pixel; the values in this README are authoritative and match the prototype.

---

## Design tokens

### Color
| Token | Hex | Use |
|---|---|---|
| canvas | `#F7F8FA` | page background |
| surface | `#FFFFFF` | nav, contact section, footer |
| surface-subtle | `#F0F2F5` | mobile-menu dividers |
| ink | `#17191D` | primary text |
| ink-secondary | `#626A75` | body copy |
| ink-tertiary | `#686E76` | mono metadata |
| border | `#DDE1E6` | rules, icon buttons |
| border-control | `#868E99` | form inputs (see revision 2) |
| border-strong | `#C8CED6` | timeline dots (past roles) |
| oxide-50 | `#F8EEEB` | hero band, hover tints |
| oxide-100 | `#F1DDD7` | icon-button borders on the hero band |
| oxide-500 | `#B64834` | primary accent, buttons, active dot |
| oxide-600 | `#9E3C2C` | button hover |
| oxide-700 | `#803126` | accent text/icons on oxide-50 |

Light mode only. No dark mode. No gradients.

**Revisions (2026-08-24, approved by Michael).** Three specified values were changed for
WCAG 2.2 AA; everything else in this document is as originally written, and the
design-system reference still lists the originals.

1. `ink-tertiary` was `#8A929D`. At the sizes the mono metadata uses it, that measured
   2.8–3.1:1 against canvas, surface and the oxide-50 hover tint — a 1.4.3 failure on every
   mono label on the page. `#686E76` is the lightest value on the same hue that reaches
   4.5:1 on canvas and surface.
2. **Form inputs use a `#868E99` border** (3.31:1 on white) rather than the `#DDE1E6`
   below. A white field on the white contact surface has nothing but that border to show
   where the control is, which puts it under 1.4.11 (3:1). Every other rule and hairline on
   the page — including the icon buttons — keeps `#DDE1E6`, because those are decorative or
   are identified by the glyph inside them.
3. **Expertise logos rest at `opacity: 0.76`**, not `0.72`. The marks are the whole content
   of section 02 with no text labels, so they are graphical objects required to understand
   the content; 0.72 measured 2.95:1 and 0.76 measures 3.19:1. The change is not visible
   side by side.

**Addition:** below 700px the contact form's Name and Email fields stack to one column. The
breakpoint list further down does not mention the form; side by side at that width leaves
155px fields, and it is why the prototype itself scrolls sideways at 390px.

### Typography
- Primary: **Encode Sans Semi Expanded** (Google Fonts), weights 400 / 500 / 600.
- Mono: **Fira Mono** (Google Fonts), weight 400 — metadata only, uppercase, letter-spacing `0.06em`–`0.1em`.
- Scale used: h1 `60px/1.04, 600, -0.025em`; section heading (contact) `38px/1.08, 600, -0.025em`; year numerals `46px/1, 600, -0.025em`; role title `24px, 600, -0.015em`; education title `20px, 600, -0.01em`; large body `20px/1.6, 400`; body `17px/1.62, 400`; nav `15px, 500`; mono labels `11–12px`.
- Body paragraphs use `text-wrap: pretty`.

### Spacing / shape / motion
- 4px base scale: 4 / 8 / 12 / 16 / 24 / 32 / 40 / 56 / 64 / 96.
- Container: `max-width: 1100px`, horizontal padding `32px`.
- Radii: 10px (buttons, inputs, icon buttons, hover tints), 16px (portrait).
- Transitions: 160ms ease (links, borders, buttons), 200–220ms ease (hover tints, logo lift). No shadows anywhere.
- `@media (prefers-reduced-motion: reduce) { * { transition: none !important } }`.

---

## Sections

### Sticky nav
- `position: sticky; top: 0; z-index: 10;` background `rgba(255,255,255,0.92)` + `backdrop-filter: blur(8px)`, bottom border `1px solid #DDE1E6`.
- Inner row: max-width 1100, padding `20px 32px`, space-between.
- Left: "Michael Grosser" — 16px/600, `-0.01em`, ink, links to `#top`.
- Right (desktop): Experience · Expertise · Education (ink-secondary, hover → ink) and Contact (oxide-500, hover → oxide-700); 15px/500, gap 32px.
- **≤760px**: links hidden; a 46×46 hamburger button appears on the right (1px `#DDE1E6` border, radius 10, hover border oxide-500). Icon: Phosphor `list` 24px; when open, Phosphor `x` 22px, `aria-expanded` bound to state.
- Open state renders a panel below the bar: white, top border `#DDE1E6`, padding `8px 32px 20px`, one link per row at 17px/500 with `14px 0` padding and `1px solid #F0F2F5` dividers (last row no divider, oxide-500). Selecting a link closes the menu.

### Hero (`#top`)
- Band background `#F8EEEB`, padding `96px 32px 64px`.
- Grid `1fr 300px`, gap 64, `align-items: end`.
- Left column, gap 24: mono eyebrow `SOFTWARE ENGINEERING LEADER · CHICAGO, IL` (12px, `0.1em`, oxide-700) → `h1` "Michael Grosser" → intro paragraph (20px/1.6, ink-secondary, max-width 620px): "I'm a principal software engineer who enjoys turning complicated systems into something simpler, faster, and easier to build on. I've spent 20+ years working across hands-on engineering, architecture, and technical leadership."
- Action row (gap 24, align center, padding-top 8): primary link **Get in touch** → `#contact` (oxide-500 bg, white 16px/500, radius 10, padding `13px 24px`, hover oxide-600), then four 46×46 icon buttons — email (`mailto:michael@michaelgrosser.com`), LinkedIn, X, GitHub — white fill, `1px solid #F1DDD7`, radius 10, oxide-700 glyph, hover: border oxide-500 + `translateY(-2px)`.
- Portrait: `photo.png`, 300px wide, `aspect-ratio: 3/4`, `object-fit: cover`, `object-position: 50% 20%`, radius 16, `filter: saturate(0.9)`, and `margin-bottom: -128px` so it overhangs into the next section.

### 01 Experience (`#experience`)
- Padding `96px 32px 0`. Header row: mono `01 / EXPERIENCE`, flexible 1px `#DDE1E6` hairline, mono `2010 — PRESENT` on the right; 40px below.
- Five rows, each a grid `200px 1fr` with `padding: 20px 20px 20px 0; margin-left: -20px; border-radius: 10px`.
  - Left cell: year numeral (46px/600) with `padding-left: 20px`.
  - Right cell: `padding-left: 40px; border-left: 1px solid #DDE1E6; position: relative`, gap 12. A 7×7 dot sits at `left: -4px; top: 8px` (oxide-500 on the current role, `#C8CED6` on the rest). Contents: role title (24px/600), mono `COMPANY · RANGE` (12px, ink-tertiary), body paragraph (17px/1.62, max-width 680px).
  - **Hover (the one signature interaction):** background → `#F8EEEB`, `transform: translateX(4px)`, both 220ms ease.
- Rows (year → title → mono → copy):
  1. **2024** — Principal Software Engineer, Toast Tables — `TOAST · PRESENT` — "Principal Software Engineer for the Toast Tables Reservations & Waitlist platform, working across backend, frontend, and infrastructure."
  2. **2022** — Principal Engineer / Sr. Engineering Manager, Guest Platform — `TOAST · 2022 — 2024` — "Tech lead manager for the Digital Ordering Platform, specializing in designing re-usable systems for Online Ordering and other guest-facing services."
  3. **2021** — Consultant, Enterprise Architecture — `INSPIRE11 · 2021 — 2022` — "Consulted with Enterprise clients to design their migrations from on prem to the cloud."
  4. **2015** — Vice President of Engineering — `NEIGHBORHOODS.COM · 2015 — 2021` — "Built the internal engineering organization to 30+ people across backend, frontend, DevOps, data science and QA, and designed the cloud-native platform behind ~10M listings and ~100M parcel records."
  5. **2010** — Practice Director, eCommerce · Sr. Technical Architect — `GORILLA GROUP · 2010 — 2015` — "Architectural lead for high-volume B2B and B2C commerce platforms, and for the practice's move to cloud-based hosting and reproducible developer environments."

### 02 Expertise (`#technical`)
- Padding `96px 32px 0`; header row: mono `02 / EXPERTISE` + hairline.
- One wrapping flex row, `gap: 56px`, `align-items: center`, padding `8px 0 4px`.
- Logos only — **no text labels**; the product name lives in `alt` and `title`. Each: `height: 38px; width: auto; opacity: 0.72`, hover → `opacity: 1; translateY(-2px)` (200ms).
- Order: **Claude** (tinted oxide-500 so it reads first), Kotlin, Java (OpenJDK mark), TypeScript, Python, PostgreSQL, Amazon Web Services, Cloudflare, Kubernetes, Terraform, React, Go.

### 03 Education & Certification (`#education`)
- Padding `96px 32px`; header row: mono `03 / EDUCATION & CERTIFICATION` + hairline, 32px below.
- Two equal columns, gap 32. Each item: `border-top: 2px solid #17191D`, `padding: 20px 16px 16px`, `border-radius: 0 0 10px 10px`, gap 8 — mono date range, title (20px/600), optional detail line (17px, ink-secondary).
- **Hover:** background → `#F8EEEB` and top border → oxide-500 (220ms). Neither item is highlighted by default.
- Items: `2004 — 2009` Florida Gulf Coast University / "Bachelors of Science"; `2021 — 2024` AWS Certified Solutions Architect Professional.

### 04 Contact (`#contact`)
- White background, top border `#DDE1E6`, padding `96px 32px`. Grid `1fr 1fr`, gap 96.
- Left: mono `04 / CONTACT`; heading "Happy to talk systems, teams, or AI-assisted delivery." (38px/1.08, 600); paragraph "The form reaches me directly. I'm also easy to find in the usual places." (17px, max-width 420px); then a row (gap 12) of four 46×46 icon buttons — email, LinkedIn, X, GitHub — `1px solid #DDE1E6`, radius 10, ink glyphs, hover border oxide-500 + `translateY(-2px)`.
- Right: form, column gap 16. Name + Email side by side (`1fr 1fr`, gap 16), then Message (`rows=5`, vertical resize). Labels are mono 11px `0.08em` ink-tertiary, uppercase, above each field. Inputs: `1px solid #DDE1E6`, radius 10, padding `14px 16px`, 16px ink text, white fill.
- Submit: oxide-500 button, white 16px/500, radius 10, padding `14px 26px`, flex row with 10px gap and an 18px white Phosphor `paper-plane-tilt` glyph after the label "Send"; hover oxide-600.

### Footer
White, top border `#DDE1E6`, padding 32. Max-width 1100 row, space-between, mono 12px ink-tertiary: `MICHAEL GROSSER` and `© 2026`.

---

## Interactions & behavior

| Element | Behavior |
|---|---|
| Nav links / "Get in touch" | in-page anchors (`#experience`, `#technical`, `#education`, `#contact`, `#top`) |
| Hamburger | toggles `menuOpen`; icon swaps list ↔ x; `aria-expanded` reflects state |
| Mobile menu link | navigates and sets `menuOpen: false` |
| Experience row | hover: oxide-50 tint + 4px shift right, 220ms ease |
| Education item | hover: oxide-50 tint + oxide top rule, 220ms ease |
| Expertise logo | hover: opacity 0.72 → 1, `translateY(-2px)`, 200ms |
| Icon buttons | hover: border → oxide-500, `translateY(-2px)`, 160ms |
| Focus | `outline: 2px solid #B64834; outline-offset: 3px` on `:focus-visible` for links, buttons, inputs — do not remove |
| Reduced motion | all transitions disabled |

### Contact form (to be built)
The prototype form is non-functional. Implementation needs: required Name (text), required Email (validated), required Message; inline error text under the offending field in oxide-700; disabled/pending state on submit; a success message replacing the form body. Suggested backend for Cloudflare Pages: a Pages Function posting to an email API (Resend/SES) with Turnstile for spam. The email address should be rendered through Cloudflare's email obfuscation.

### State
Only one piece of UI state: `menuOpen: boolean` (mobile nav). Plus form state if you build the form: field values, validation errors, submit status (`idle | submitting | success | error`).

---

## Responsive behavior

Two breakpoints, implemented with `!important` overrides in the prototype — reimplement as normal cascade rules.

**≤1000px**
- Hero → single column, gap 40; portrait 260px wide, `order: -1` (above the copy), overhang removed (`margin-bottom: 0`).
- Contact → single column, gap 48.
- Experience rows → grid `120px 1fr`; year numerals 32px.

**≤760px**
- Desktop nav links hidden; hamburger shown.

**≤700px**
- `h1` → 40px.
- Hero section padding → `72px 24px 48px`; hero gap 32; portrait `width: 100%; max-width: 320px; aspect-ratio: 4/5`; action row wraps with 16px gap.
- Education pair → single column.
- Experience rows → single column, gap 12, right cell `padding-left: 20px`.

Keep the 44px+ minimum tap target on every nav item, icon button and form control.

---

## Assets

- `design/photo.png` — the portrait (from the user's `ProfilePhoto.PNG`). Ship a properly sized/compressed version (AVIF/WebP + fallback), cropped 3:4 with `object-position: 50% 20%`.
- Icons: **Phosphor Icons, Regular** — `envelope-simple`, `linkedin-logo`, `x-logo`, `list`, `x`, `paper-plane-tilt`. The prototype pulls them from `cdn.jsdelivr.net/npm/@phosphor-icons/core@2/assets/regular/*.svg` and colors them via CSS `mask-image`; in production install `@phosphor-icons/*` (or inline the SVGs) and use `currentColor`.
- GitHub mark: the standard Octocat, from Simple Icons (`simple-icons@13/icons/github.svg`), also mask-colored.
- Tech logos: Simple Icons for Claude, Kotlin, OpenJDK, TypeScript, Python, PostgreSQL, Cloudflare, Kubernetes, Terraform, React, Go (`cdn.simpleicons.org/<slug>/626A75`) and `simple-icons@13/icons/amazonwebservices.svg` for AWS. **Self-host these** rather than hotlinking the CDN, and check each vendor's trademark guidance before shipping.
- Fonts: self-host Encode Sans Semi Expanded and Fira Mono (`font-display: swap`) instead of the Google Fonts CDN.

## Files in this bundle

```
design/Michael Grosser Site.dc.html              the approved design (serve over HTTP to view)
design/support.js                                prototype runtime — reference only, do not port
design/photo.png                                 portrait asset
design/Personal Site (option explorations).dc.html   earlier layout options (context only; option 3A won)
reference/Personal Site Design System.md         the authoritative design system — read this first
reference/resume.md                              source résumé content (transcribed; resume.pdf is git-ignored)
```

Content note: only what appears in the résumé and the copy above is approved. Do not invent metrics, testimonials, projects or a location beyond the "CHICAGO, IL" the user set in the hero eyebrow.
