# Personal Site Design System

## 1. Purpose

This design system defines the visual language for a personal website belonging to a senior software engineer.

The site is primarily a **CV and contact site**. It is not intended to function as:

- a blog
- a project portfolio
- a startup landing page
- a developer-themed novelty site
- a heavily branded corporate site

The system should provide enough structure and consistency for a design agent to create coherent page concepts while still leaving room for visual exploration.

The design agent should treat this document as a **set of constraints and principles**, not as a prescribed page layout.

---

# 2. Brand Character

The site should feel:

- **Minimal**
- **Warm**
- **Premium**
- **Professional**
- **Approachable**
- **Precise**
- **Modern**
- **Confident without being showy**

The desired social tone is closer to a **professional meetup** than a corporate boardroom.

It should communicate seniority and competence without appearing stuffy, overly serious, or self-important.

The design may have personality, but should never feel goofy, whimsical, or overly playful.

---

# 3. Core Design Principles

## 3.1 Minimal, Not Sparse

The site should avoid unnecessary decoration, but it should still feel intentionally designed.

Visual interest should come primarily from:

- typography
- proportion
- spacing
- color
- alignment
- subtle asymmetry
- restrained motion
- photography
- small graphic details

Do not create empty space simply for the sake of minimalism.

---

## 3.2 Premium Through Restraint

The site should feel premium because of execution rather than ornamentation.

Prioritize:

- precise spacing
- strong hierarchy
- clean alignment
- deliberate typography
- subtle interaction
- careful photography
- high-quality micro-details

Avoid visual effects whose purpose is simply to make the page look "designed."

---

## 3.3 Warm Personality on a Cool Foundation

The underlying neutral palette should remain cool and crisp.

Warmth should come from:

- the Oxide accent color
- photography
- typography
- human-centered copy
- subtle motion

Avoid cream-heavy, beige-heavy, or overly warm neutral palettes.

---

## 3.4 Technical Without Looking "Developer Themed"

The site belongs to a software engineer, but it should not visually imitate:

- an IDE
- terminal software
- source code
- GitHub
- hacker aesthetics

Technical character should instead appear through details such as:

- precise grids
- restrained monospace typography
- dates and metadata
- systematic spacing
- structured information
- subtle geometric linework

The engineering character should be noticeable only after looking closely.

---

# 4. Theme

The site is **light mode only**.

Do not create or account for a dark mode unless explicitly requested later.

---

# 5. Color System

## 5.1 Neutral Palette

Use a cool-neutral foundation.

| Token | Value | Intended Use |
|---|---:|---|
| `canvas` | `#F7F8FA` | Primary page background |
| `surface` | `#FFFFFF` | Elevated or contained areas |
| `surface-subtle` | `#F0F2F5` | Subtle emphasis or alternate surface |
| `ink` | `#17191D` | Primary text |
| `ink-secondary` | `#626A75` | Secondary text |
| `ink-tertiary` | `#8A929D` | Metadata and de-emphasized text |

Note (2026-08-24): the implementation uses `#686E76` for `ink-tertiary`. `#8A929D` fails the
WCAG AA contrast requirement in section 18 at the sizes metadata is set in. See the revision
note in `docs/ui/README.md`.
| `border` | `#DDE1E6` | Standard divider and border |
| `border-strong` | `#C8CED6` | Stronger interactive boundary |

Do not default to pure black for text.

Do not use warm cream or yellow-tinted backgrounds as the primary neutral foundation.

---

## 5.2 Accent Palette — Oxide

Oxide is the primary accent family.

| Token | Value | Intended Use |
|---|---:|---|
| `oxide-50` | `#F8EEEB` | Very subtle tinted backgrounds |
| `oxide-100` | `#F1DDD7` | Selected or highlighted surfaces |
| `oxide-500` | `#B64834` | Primary accent |
| `oxide-600` | `#9E3C2C` | Hover or stronger emphasis |
| `oxide-700` | `#803126` | High-contrast accent text |

### Accent Usage Principle

> Oxide should attract attention, not paint the interface.

Use it selectively.

Appropriate uses may include:

- links
- hover states
- section markers
- rules
- small icons
- emphasis
- selected states
- decorative linework
- occasional tinted surfaces

Do not automatically make every button, icon, label, and heading Oxide.

As a general visual guideline, Oxide should occupy only a small portion of the overall page.

---

## 5.3 Gradient Policy

Do not use decorative gradients by default.

Explicitly avoid:

- blue-purple gradients
- neon gradients
- blurred gradient blobs
- gradient text
- glowing gradient backgrounds

Any future gradient use should require an explicit design rationale.

---

# 6. Typography

## 6.1 Primary Typeface

**Encode Sans Semi Expanded**

Use as the primary typeface throughout the site.

Preferred weights:

- `400` — body text
- `500` — navigation, controls, emphasized body copy
- `600` — most headings
- `700` — occasional high-impact display use

Avoid relying heavily on weights above `700`.

The slightly expanded proportions are part of the site's visual personality and should not be aggressively compressed through letter spacing.

---

## 6.2 Monospace Typeface

**Fira Mono**

Use only as a technical accent.

Preferred weights:

- `400` — default
- `500` — limited emphasis

Fira Mono should typically appear at smaller sizes than the surrounding primary typography.

Appropriate uses include:

- dates
- section labels
- location metadata
- short technology lists
- small identifiers
- supporting labels

Example:

```text
2022 — PRESENT
```

or:

```text
EXPERIENCE / 02
```

Do not use Fira Mono for:

- body paragraphs
- major headings
- long descriptions
- all navigation
- every piece of technical information

The monospace typography should feel like a subtle engineering detail rather than a theme.

---

# 7. Type Scale

Use the following approximate desktop scale.

These are system ranges, not rigid page-layout requirements.

| Role | Suggested Size |
|---|---:|
| Display | `56–72px` |
| H1 | `44–56px` |
| H2 | `32–40px` |
| H3 | `22–26px` |
| Large Body | `20px` |
| Body | `17–18px` |
| Small | `13–14px` |
| Mono Label | `11–13px` |

---

## 7.1 Display Typography

Recommended characteristics:

```css
font-weight: 600;
letter-spacing: -0.025em;
line-height: 1.02–1.08;
```

Avoid extremely oversized SaaS-style hero typography.

Large type may be used as a visual element, but should remain proportional to a CV-oriented site.

---

## 7.2 Section Headings

Recommended characteristics:

```css
font-weight: 600;
letter-spacing: -0.015em;
line-height: 1.1–1.2;
```

---

## 7.3 Body Copy

Recommended characteristics:

```css
font-weight: 400;
letter-spacing: normal;
line-height: 1.55–1.65;
```

Body copy should prioritize readability over visual density.

---

# 8. Spacing System

Use a **4px base spacing unit**.

Preferred spacing scale:

```text
4
8
12
16
24
32
48
64
96
128
```

Use spacing consistently rather than inventing arbitrary values.

---

## 8.1 Vertical Rhythm

The site should generally feel spacious.

Desktop section separation may commonly fall within:

```text
64–128px
```

The design should not become so spacious that users must scroll excessively through small amounts of content.

Use hierarchy and grouping to balance premium whitespace with efficient information density.

---

# 9. Layout System

## 9.1 Overall Width

Recommended primary content container:

```text
1100–1200px max-width
```

Long-form text should use a significantly narrower reading measure.

---

## 9.2 Grid Philosophy

The site should use a **strong underlying grid**, but should not always make that grid visually obvious.

Layouts may use:

- multiple columns
- offset content
- asymmetric alignments
- occasional full-width elements
- deliberate breaks from the primary column structure

The design should feel orderly without looking mechanically modular.

---

## 9.3 Asymmetry

Moderate asymmetry is encouraged for:

- major highlights
- selected experience
- prominent information
- photography
- section transitions

Asymmetry should feel deliberate and balanced, not random.

---

## 9.4 Responsiveness

Responsive layouts should preserve:

- hierarchy
- spacing relationships
- typographic character
- information clarity

Avoid simply shrinking desktop layouts proportionally.

On small screens:

- reduce decorative offsets
- collapse multi-column structures appropriately
- preserve comfortable margins
- reduce display typography carefully
- prioritize reading order
- avoid excessive horizontal complexity

---

# 10. Surface Philosophy

## 10.1 Avoid Card-Heavy Layouts

Do not wrap every unit of information in a card.

Default structural tools should be:

- whitespace
- alignment
- typography
- borders
- rules
- background changes

Use contained surfaces only when containment improves comprehension or interaction.

---

## 10.2 Surface Treatment

When containers are appropriate:

- use subtle borders
- use little or no shadow
- use moderate corner radii
- keep surface contrast restrained

Avoid floating, heavily elevated UI.

---

# 11. Shape Language

The geometry should feel:

- precise
- modern
- slightly softened
- never bubbly

Recommended radii:

| Token | Value |
|---|---:|
| `radius-small` | `6px` |
| `radius-standard` | `10px` |
| `radius-large` | `14px` |
| `radius-image` | `16px` |

Avoid excessive pill-shaped UI.

Use circles only when the shape has a meaningful reason to be circular.

---

# 12. Borders and Rules

Borders should generally be:

```css
1px solid var(--border);
```

Use `border-strong` where greater definition is required.

Thin horizontal or vertical rules may be used as visual structure or decoration.

Decorative linework is encouraged when subtle.

Potential visual language may include:

- short Oxide rules
- extended hairlines
- small corner marks
- geometric separators
- understated section markers

The specific application should be explored during actual page design.

---

# 13. Shadows

Use shadows sparingly.

Default surfaces should generally rely on:

- contrast
- borders
- spacing

rather than elevation.

If a shadow is required, it should be soft, subtle, and low-opacity.

Avoid:

- large blurred shadows
- dramatic floating-card effects
- colored shadows
- glowing shadows

---

# 14. Iconography

Preferred icon family:

**Phosphor Icons — Regular**

Use icons only where they improve comprehension.

Likely appropriate cases include:

- email
- LinkedIn
- GitHub
- external link indicators
- location
- contact actions

Typical icon size:

```text
16–20px
```

Avoid:

- decorative icon overload
- placing every icon inside a colored square
- using icons where text is clearer

---

# 15. Photography

Photography should provide human warmth.

Preferred characteristics:

- natural lighting
- relaxed but professional
- simple or contextual environment
- restrained color treatment
- high-quality crop

Preferred presentation:

- rectangular or softly rounded crop
- integrated naturally into the layout

Avoid:

- circular employee-directory avatars
- heavy filters
- gradient overlays
- artificial depth effects
- parallax for its own sake
- overly formal corporate headshots

---

# 16. Motion System

Motion should communicate:

- focus
- responsiveness
- hierarchy
- polish

It should never exist purely as spectacle.

---

## 16.1 Timing Tokens

| Motion Type | Duration |
|---|---:|
| Immediate feedback | `120–160ms` |
| Standard transition | `200–240ms` |
| Larger contextual transition | `300–400ms` |

Use smooth deceleration.

Avoid overly elastic or bouncy easing.

---

## 16.2 Appropriate Motion

Examples include:

- subtle color transition
- border emphasis
- slight background tint
- opacity transition
- small vertical movement
- mild emphasis of selected content
- restrained reveal of supporting metadata

If scaling is used:

```text
Maximum typical scale: 1.01–1.015
```

If vertical translation is used:

```text
Typical range: 2–12px
```

---

## 16.3 Scroll Animation

If content animates into view:

- animate once
- keep movement short
- combine small translation with opacity
- do not delay content unnecessarily

Avoid staged animations where every small element enters separately.

---

## 16.4 Reduced Motion

Respect:

```css
@media (prefers-reduced-motion: reduce)
```

Nonessential animation should be removed or greatly simplified.

---

# 17. Interaction States

Interactive elements should have clear:

- default
- hover
- focus
- active
- visited states where appropriate

Do not rely solely on color changes for accessibility.

Keyboard focus must remain obvious.

Preferred focus styling may combine:

- border change
- outline
- subtle Oxide emphasis

Do not remove native focus visibility without providing an equivalent or better replacement.

---

# 18. Accessibility

Design for at least **WCAG AA** contrast standards.

Requirements include:

- readable body text contrast
- keyboard-accessible interaction
- visible focus states
- sufficient target sizes
- reduced-motion support
- meaningful semantic structure
- text alternatives for imagery
- no critical information communicated by color alone

Decorative text should never become so small or low-contrast that it compromises usability.

---

# 19. Visual Density

The default should lean **spacious rather than dense**.

However:

> Spaciousness should not create unnecessary scrolling.

Use clear grouping and information hierarchy so sections can remain visually breathable without becoming excessively tall.

---

# 20. Information Presentation

The design system intentionally does **not** prescribe a specific résumé layout.

The design agent may explore:

- editorial rows
- structured columns
- timelines
- subtle highlighted regions
- asymmetric emphasis
- background changes
- rules and dividers
- oversized typographic elements
- hover-driven emphasis

These should be treated as design explorations rather than fixed system requirements.

---

# 21. Decorative Vocabulary

Subtle graphic detail is encouraged.

Acceptable elements include:

- hairlines
- geometric separators
- short accent rules
- section numbering
- corner details
- restrained technical metadata
- offset typography
- small grid-derived ornaments

Decorative elements should:

- reinforce structure
- contribute rhythm
- remain visually quiet

They should not become illustrations or major focal points unless intentionally introduced later.

---

# 22. Anti-Pattern Rules

The following should **not** appear unless explicitly requested.

## Do Not Use

- purple-blue gradients
- decorative gradients
- glowing blobs
- glassmorphism
- giant rounded bento-card layouts
- gradient-highlighted heading text
- fake terminal windows
- decorative code snippets
- technology-logo clouds
- excessive pill badges
- excessive icons
- background particles
- neon accents
- abstract 3D blobs
- dramatic drop shadows
- scroll-jacking
- cursor-following effects
- gratuitous parallax
- meaningless numerical statistics
- fake metrics used only for visual interest
- generic dashboard UI motifs
- every section enclosed in a card
- every technology rendered as a badge

---

# 23. AI Design Guardrails

When using this system with a design agent:

1. Do not invent UI components simply to fill empty space.
2. Do not add generic sections because personal-site templates commonly contain them.
3. Do not invent statistics, testimonials, projects, clients, or accomplishments.
4. Do not turn the site into a SaaS landing page.
5. Do not visually over-emphasize the fact that the subject is a software engineer.
6. Avoid current AI-generated website clichés.
7. Prefer one strong visual idea over many weak decorative ideas.
8. Preserve generous whitespace.
9. Use Oxide sparingly.
10. Let typography and information structure do most of the visual work.
11. Allow asymmetry where it makes important information more memorable.
12. Keep decorative elements subordinate to content.
13. Prioritize clarity over novelty.
14. Do not assume every section requires a unique visual treatment.
15. Avoid unnecessary motion.

---

# 24. Design Freedom

This system intentionally leaves the following open for exploration:

- exact page composition
- section ordering
- experience presentation
- use of timelines
- placement of photography
- degree of asymmetry
- placement of Oxide accents
- use of background bands
- use of oversized typography
- specific hover behavior
- recurring graphic motif
- exact navigation treatment

The design agent should explore these areas while remaining inside the system.

---

# 25. Summary Tokens

```text
STYLE
Minimal
Warm
Premium
Precise
Approachable
Light mode only

FONTS
Primary: Encode Sans Semi Expanded
Mono: Fira Mono

COLORS
Canvas:          #F7F8FA
Surface:         #FFFFFF
Surface Subtle:  #F0F2F5

Ink:             #17191D
Ink Secondary:   #626A75
Ink Tertiary:    #8A929D

Border:          #DDE1E6
Border Strong:   #C8CED6

Oxide 50:        #F8EEEB
Oxide 100:       #F1DDD7
Oxide 500:       #B64834
Oxide 600:       #9E3C2C
Oxide 700:       #803126

SPACING
4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128

RADII
6 / 10 / 14 / 16

LAYOUT
1100–1200px maximum primary content width
Structured grid with occasional deliberate breaks
Moderate asymmetry encouraged

MOTION
120–160ms immediate
200–240ms standard
300–400ms contextual

VISUAL PRIORITY
Typography
Whitespace
Alignment
Color
Subtle linework
Photography
Restrained interaction
```

# 26. Core Direction

The target is a site that feels like a **well-designed independent professional presence**, not a résumé template and not a technology-company marketing page.

The visual language should combine:

**premium restraint + human warmth + precise technical detail**

The result should feel distinctive without looking like it is trying hard to be distinctive.