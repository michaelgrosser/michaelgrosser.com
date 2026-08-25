# Addendum: contact form "send" animation

Applies to **04 Contact** in `README.md`. Everything else in that section is unchanged.

Reference implementation: `design/Michael Grosser Site.dc.html` (contact section + the `mg*`
keyframes in its `<style>` block). The values below are authoritative and match it.

## The idea

On submit, the form folds itself up like a letter, the folded packet slides into the Send
button, the button strips away leaving only its paper-plane glyph, and the plane takes off.
A confirmation card replaces the form. Total ~1.08s.

## Structure required

Add these hooks to the existing contact markup (no visual change at rest):

| Hook                                        | Element                                                                                                                                       |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| wrapper `[data-send="wrap"]` + `data-phase` | new `position: relative` div wrapping the `<form>` and the success card                                                                        |
| `[data-fold="sheet"]`                       | new div inside the form wrapping **both** field groups; `display:flex; flex-direction:column; gap:16px; transform-origin: 50% 100%; transform-style: preserve-3d` |
| `[data-fold="row"]`                         | the existing Name+Email grid; add `transform-origin: 50% 0%; backface-visibility: hidden`                                                      |
| `[data-fold="msg"]`                         | the existing Message group; same two properties                                                                                                |
| `[data-fold="btn"]`                         | the submit button                                                                                                                             |
| `[data-fold="label"]`                       | new `<span>` around the button's text; `display:inline-block; overflow:hidden; white-space:nowrap`                                             |
| `[data-fold="icon"]`                        | the button's paper-plane glyph; add `flex: none`                                                                                              |

The form itself gets `perspective: 1400px`. The submit button keeps its normal inline
padding of `14px 26px` — the vanish keyframe animates the horizontal padding, so if you
change that padding, change the keyframe to match.

`data-phase` on the wrapper is the only new state: `idle | sending | sent`.

## Measured custom properties

The packet must fly to wherever the button actually is, so measure at submit time and set
three things on the wrapper before switching to `sending`:

```js
const w = wrap.getBoundingClientRect();
const s = sheet.getBoundingClientRect();
const b = button.getBoundingClientRect();
wrap.style.minHeight = w.height + 'px'; // reserve space, no page jump
wrap.style.setProperty('--dx', b.left + b.width / 2 - (s.left + s.width / 2) + 'px');
wrap.style.setProperty('--dy', b.top + b.height / 2 - (s.top + s.height / 2) + 'px');
```

Clear `minHeight` when you flip to `sent`, and again on reset.

## Keyframes

```css
@keyframes mgFoldPanel {
  0% {
    transform: rotateX(0deg);
    opacity: 1;
  }
  70% {
    opacity: 0.9;
  }
  100% {
    transform: rotateX(-88deg);
    opacity: 0.55;
  }
}
@keyframes mgPacket {
  0% {
    transform: translate(0px, 0px) scale(1, 1) rotate(0deg);
    opacity: 1;
  }
  28% {
    transform: translate(0px, 0px) scale(0.94, 0.12) rotate(0deg);
    opacity: 1;
  }
  38% {
    transform: translate(0px, -10px) scale(0.9, 0.1) rotate(-1deg);
    opacity: 1;
  }
  100% {
    transform: translate(var(--dx, 0px), var(--dy, 120px)) scale(0.06, 0.02) rotate(-6deg);
    opacity: 0;
  }
}
@keyframes mgGulp {
  0% {
    transform: scale(1);
  }
  40% {
    transform: scale(1.09, 0.9);
  }
  70% {
    transform: scale(0.97, 1.04);
  }
  100% {
    transform: scale(1);
  }
}
@keyframes mgBtnVanish {
  0% {
    background-color: #b64834;
    padding-left: 26px;
    padding-right: 26px;
  }
  100% {
    background-color: rgba(182, 72, 52, 0);
    padding-left: 0px;
    padding-right: 0px;
  }
}
@keyframes mgLabelVanish {
  0% {
    opacity: 1;
    max-width: 120px;
  }
  100% {
    opacity: 0;
    max-width: 0px;
  }
}
@keyframes mgRecolor {
  from {
    background-color: #ffffff;
  }
  to {
    background-color: #b64834;
  }
}
@keyframes mgTakeoff {
  0% {
    transform: translate(0px, 0px) rotate(0deg) scale(1);
    opacity: 1;
  }
  18% {
    transform: translate(-5px, 7px) rotate(7deg) scale(1.18);
    opacity: 1;
  }
  46% {
    transform: translate(70px, -58px) rotate(-8deg) scale(1.05);
    opacity: 1;
  }
  100% {
    transform: translate(420px, -280px) rotate(-22deg) scale(0.45);
    opacity: 0;
  }
}
@keyframes mgSent {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
```

`mgRecolor` / `mgTakeoff` assume the glyph is a CSS `mask-image` span colored with
`background-color` (as in the prototype). If you inline the SVG and use `currentColor`
instead, swap those two properties for `color` and keep the timing identical.

## Timeline

```css
[data-send='wrap'][data-phase='sending'] form {
  pointer-events: none;
}
[data-send='wrap'][data-phase='sending'] [data-fold='msg'] {
  animation: mgFoldPanel 300ms cubic-bezier(0.6, 0, 0.3, 1) forwards;
}
[data-send='wrap'][data-phase='sending'] [data-fold='row'] {
  animation: mgFoldPanel 300ms 90ms cubic-bezier(0.6, 0, 0.3, 1) forwards;
}
[data-send='wrap'][data-phase='sending'] [data-fold='sheet'] {
  animation: mgPacket 500ms 320ms cubic-bezier(0.5, 0, 0.75, 0.3) forwards;
}
[data-send='wrap'][data-phase='sending'] [data-fold='btn'] {
  animation:
    mgBtnVanish 112ms cubic-bezier(0.4, 0, 0.2, 1) forwards,
    mgGulp 120ms 700ms cubic-bezier(0.3, 1.5, 0.5, 1) both;
}
[data-send='wrap'][data-phase='sending'] [data-fold='label'] {
  animation: mgLabelVanish 104ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
[data-send='wrap'][data-phase='sending'] [data-fold='icon'] {
  animation:
    mgRecolor 96ms cubic-bezier(0.4, 0, 0.2, 1) forwards,
    mgTakeoff 288ms 780ms cubic-bezier(0.3, 0, 0.45, 1) forwards;
}
[data-send='wrap'][data-phase='sent'] form {
  display: none !important;
}
```

`!important` is required on the last rule only because the prototype sets `display: flex`
inline on the form; in production, drop it (or unmount the form) — but the form **must** be
gone in the `sent` state or the confirmation stacks under a live form.

Beat summary: 0ms message panel folds → 90ms name/email row folds, button simultaneously
sheds its fill + label and the glyph recolors to oxide-500 → 320ms the flattened sheet
slides into the button → 700ms button gulp → 780ms plane takes off → **1080ms** switch
`data-phase` to `sent`.

## Sent state

Replace the form with a confirmation card in the same column (animation
`mgSent 420ms cubic-bezier(.2,.8,.3,1) both`, `role="status"`):

- Card: `padding: 32px; border: 1px solid #F1DDD7; background: #FCF6F4; border-radius: 12px;`
  column, `gap: 14px`, items flex-start.
- 30×30 oxide-500 Phosphor `envelope-simple-open` glyph.
- "Message sent." — 24px/600, `-0.015em`, ink.
- "Thanks — it landed in my inbox. I usually reply within a day or two." — 16px/1.6,
  ink-secondary, max-width 380px.
- `SEND ANOTHER` — bare button, Fira Mono 12px, `0.08em`, oxide-500; resets fields and
  returns `data-phase` to `idle`.

`#FCF6F4` is a new value (a lighter oxide wash than `oxide-50`) — add it to the design
system as `oxide-25` or substitute `#F8EEEB` if you'd rather not grow the palette.

## Wiring to the real submit

The prototype fires the animation on click with no network call. In production:

1. Validate first. On validation failure, do **not** animate — show inline errors as
   specified in the README.
2. Start the animation and the POST at the same time. The animation is fixed-length
   (1080ms); if the request is still in flight when it ends, hold at the plane-gone state
   (form hidden, no card) with a small mono `SENDING…` line until it resolves.
3. On error: skip the card, restore `data-phase="idle"`, clear `min-height`, and show an
   error message above the form — the user's typed values must still be there, so never
   clear fields until success.
4. Turnstile, if used, should be verified before the animation starts.

## Accessibility

- `prefers-reduced-motion: reduce` — the site rule is now
  `* { transition: none !important; animation: none !important; }`. Additionally, the
  submit handler checks `matchMedia('(prefers-reduced-motion: reduce)').matches` and jumps
  straight to `sent` with no `sending` phase.
- Form is `pointer-events: none` while sending; also set `disabled` on the real controls so
  keyboard users can't retype into a folding form.
- The confirmation card is `role="status"` so it is announced; move focus to it on success.
- The whole sequence is decorative — nothing about the result is conveyed by motion alone.

---

## Implementation notes (added during the build)

- The glyph is an **inline SVG coloured with `currentColor`**, not a `mask-image` span, so
  `mgRecolor` animates `color` rather than `background-color`, per the note above.
  `mgTakeoff` only touches `transform`/`opacity` and is unchanged.
- `#FCF6F4` was added to the palette as `oxide-25`, surfaced as
  `--color-surface-sent`.
- `mgBtnVanish` reads `var(--submit-padding-inline)` and `var(--color-accent)` rather than
  literals, so the keyframe cannot drift from the button's real padding. The zero-alpha end
  colour is a token (`--color-accent-transparent`) because animating to `transparent` fades
  through grey in some engines.
- `display: none !important` was dropped from the `sent` rule as the addendum permits — the
  production form carries no inline `display`.
- Turnstile's token is obtained **before** the animation starts, so the sequence never
  begins on a submission that cannot be sent.
