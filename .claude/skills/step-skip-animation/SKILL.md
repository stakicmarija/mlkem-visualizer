---
name: step-skip-animation
description: Use whenever wiring Next/Prev navigation for an algorithm page's StepTree (KeyGen, Encaps, Decaps) — specifically when the step list contains transition/delegate steps that get skipped over (e.g. "Run internal algorithm", group-label children with no built content). Also use when asked to add or adjust the "skip animation" / "steps lighting up" behavior.
---

# StepTree skip animation

When `Next` jumps over two or more non-content ("transition") steps in one
click, the StepTree lights each skipped step up in sequence — pending →
done, one at a time — before the landed-on step's content appears. This is
a general navigation behavior, not something built per-page.

## When this applies

Any forward navigation (`goNext`) where the next real, content-bearing
step is more than one position away in the flat `navSteps` list — i.e.
one or more steps in between are transition/delegate steps (marked in a
`TRANSITION_IDS` set) with no real content of their own. Group-label rows
("Internal", "K-PKE") that sit between the current and target step are
part of this same visual sweep, since `StepTree` derives their state from
step position too.

A single-step advance (the common case — most `Next` clicks) is **not**
animated: both the tree and the content update immediately, no delay.

## Exact timing

- **80–100ms** between each step lighting up (pending → done).
- **No fade, no scale, no easing flourish** — it's an instant class swap
  per tick, not a transition effect.
- **No pause after the last step lights up** — the target step's content
  appears in the same tick as the last light-up, not after an additional
  delay.
- Total sequence for a typical skip (~4 steps) stays **under 500ms**.

## Implementation: reuse the shared hook, don't reimplement

This is already built as `frontend/src/utils/useStepNavigation.js`. Every
algorithm page should call it rather than hand-rolling `currentStepIndex`
state:

```js
const { currentStepIndex, treeIndex, goNext, goPrev, isAnimating } =
  useStepNavigation(navSteps, TRANSITION_IDS)
```

- `currentStepIndex` — drives step **content** (formula box, step
  component, params, generated values). Only updates once, at the end of
  a skip animation.
- `treeIndex` — pass this to `<AlgorithmPage currentStepIndex={treeIndex}>`
  (which forwards it to `<StepTree>`). This is what animates through the
  skipped steps mid-sequence.
- `isAnimating` — fold into the Next button's disabled check
  (`canGoNext={!isAnimating && ...}`) so a double-click mid-sequence can't
  race the animation.
- `goPrev` stays instant/unanimated by design — there's no "completing
  steps" narrative to narrate when moving backward. The calling page still
  wraps it for its own page-level behavior (e.g. navigating to a different
  route when `currentStepIndex === 0`).

Reference implementation: `frontend/src/pages/KeyGenPage.jsx`. When
building `EncapsPage`/`DecapsPage`, wire `useStepNavigation` the same way
— define that page's own `TRANSITION_IDS` set, then follow the same
`currentStepIndex` (content) vs `treeIndex` (tree) split shown there.
