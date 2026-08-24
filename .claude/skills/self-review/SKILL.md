---
name: self-review
description: Run the full self-check on michaelgrosser.com before handing work to Michael — build, capture the page in a real browser at every breakpoint, look at the screenshots, run axe, fix what is wrong, then dispatch the correctness and design/a11y review agents and fix their findings too. Use after finishing any task that changes the page, the Worker, or the styles.
---

# Self-review

The goal: **Michael should never be the one to find a bug or a spec mismatch.** Do not report
work as done until this loop has run and its findings are fixed.

Do not skip the visual step because the CSS "looks right." Reading CSS is not the same as
seeing the page — most fidelity bugs on this site (a wrong gap, an overlapping portrait, a
hover that shifts a row the wrong way) are invisible in source and obvious in a screenshot.

## Browser tooling — two stacks, different jobs

**`scripts/review/capture.mjs` (Playwright)** — the deterministic sweep. Every viewport,
every hover state, overflow numbers, axe, in one command. Use it for the routine pass and
for anything you want reproducible. It is also what CI can run later.

**chrome-devtools MCP** (`mcp__plugin_chrome-devtools-mcp_chrome-devtools__*`) — the
interactive layer. Use it to *diagnose* what the sweep flags: drive the page, evaluate
script against live computed styles, hover an element and inspect the result, read console
and network. It also provides two things Playwright does not:

- `lighthouse_audit` — the direct check on the ~95+ target across all four categories.
- `emulate` — CPU and network throttling for realistic Core Web Vitals.

The `chrome-devtools-mcp:a11y-debugging` skill is a useful companion for contrast, focus
order, and tap-target work.

**claude-in-chrome MCP** (`mcp__claude-in-chrome__*`) — drives Michael's real Chrome with
his session. Do not use it for routine review; it is for things that need to be logged in,
such as checking the Cloudflare dashboard after a deploy. Ask before opening tabs in his
browser.

Verified working: the prototype renders in Chrome with its CDN fonts and icons intact, so
`baseline/` is a genuine pixel reference, not just a layout sketch.

## 1. Static gates

```
npm run format:check && npm run lint && npm run typecheck && npm run test && npm run build
```

Fix anything that fails before continuing. A failing build makes every later step meaningless.

## 2. Capture the page in a real browser

```
node scripts/review/capture.mjs
```

This writes to `.review/` (gitignored):

- `current/` — full-page screenshots at seven widths straddling the ≤1000 / ≤760 / ≤700
  breakpoints, plus hover states and the first keyboard focus stop.
- `baseline/` — the approved prototype (`docs/ui/design/Michael Grosser Site.dc.html`)
  rendered at the same widths.
- `report.json` — horizontal overflow per viewport, console errors, axe violations.

The hover captures depend on `data-review` attributes on the experience row, education item,
logo, icon button, and primary button. Add them as you build those components, or the hover
states go uncaptured and unchecked.

## 3. Actually look at the screenshots

**Read the PNGs.** This is the step that catches what nothing else does.

For each viewport, compare `current/` against `baseline/` and against the values in
`docs/ui/README.md`:

- Does the portrait overhang the next section correctly at desktop, and lose the overhang
  below 1000px?
- Do the experience rows hold the 200px / 1fr grid, and collapse correctly at each step?
- Is the hero band the right height, with the eyebrow, h1, paragraph, and action row spaced
  as specified?
- Do the logos sit on one wrapping row at 38px with no text labels?
- Does the mobile menu open below the bar, with dividers and the accent-colored last row?
- Is the focus ring clearly visible in `focus-first-tab-stop.png`?

If the baseline warning appears in `report.json`, the prototype rendered without its CDN
fonts and icons — compare layout and proportion, not pixels, and lean on the written spec.

## 3b. Lighthouse

Run `lighthouse_audit` against the built site via chrome-devtools MCP. The target is ~95+
for Performance, Accessibility, Best Practices, and SEO. Investigate any category that
misses; do not tune for the score at the expense of the real experience.

## 4. Check the report

- `horizontalOverflow` must be `0` at every width. Anything positive is a blocking bug.
- `consoleErrors` must be empty for `current`.
- Every axe violation is either fixed or explicitly justified — no silent passes.

## 5. Fix, then re-capture

Fix what you found and run the harness again. Repeat until the screenshots match the spec
and the report is clean. Do not proceed to review with known problems outstanding — the
review agents are there to catch what you missed, not to triage what you already know.

## 6. Dispatch both review agents

Run them **concurrently in a single message** — they cover disjoint ground and neither needs
the other's output:

- `correctness-reviewer` — Worker logic, form behavior, build output, secrets, dependencies,
  CI/CD, and factual accuracy of résumé content.
- `design-a11y-reviewer` — spec fidelity, token discipline, design-system principles,
  responsive behavior, and WCAG 2.2 AA.

Give each the diff scope (branch or working tree) and tell `design-a11y-reviewer` that
`.review/` is already populated so it can read the screenshots rather than re-running the
harness.

## 7. Act on findings

Fix everything in **Blocking**. Fix **Should fix** unless there is a real reason not to.
Re-run the static gates after fixing.

Treat agent findings as claims to verify, not verdicts. If a finding is wrong, say so and
explain why rather than making a change to satisfy it — a wrong "fix" applied to a correct
implementation is worse than the finding.

## 8. Report to Michael

State plainly:
- what changed,
- what the harness and both reviewers found,
- what you fixed,
- anything you deliberately did not fix, and why,
- any check that could not be run, and why.

Never claim a check passed that you did not run.
