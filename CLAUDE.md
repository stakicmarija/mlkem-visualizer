# ML-KEM-768 Visualizer

Interactive, step-by-step visualization of ML-KEM (FIPS 203) -- KeyGen,
Encapsulation, and Decapsulation -- built for a diploma thesis. The goal is
to teach the algorithm by making every intermediate value (seeds, matrices,
polynomials, transformations) visible and explorable.

## Tech stack

- React + Vite
- Plain CSS with custom properties (design tokens) -- no CSS-in-JS, no
  Tailwind. Tokens live in `src/index.css`.
- Fonts: IBM Plex Mono (primary), IBM Plex Sans Condensed (index labels
  only), both via `@fontsource`.
- No backend. All cryptographic values are precomputed offline with
  `kyber-py` (see `generate_data.py` in the project root) and shipped as a
  static JSON file at `src/data/mlkem_768_data.json`. Components read from
  this JSON -- never compute crypto in the browser.

## Architecture

Three algorithm pages (KeyGen, Encaps, Decaps) share one layout shell, so
that layout logic is written once, not duplicated three times. Steps for
each algorithm are organized separately, one file per step's center
content.

Before starting any task, check what already exists (`components/`,
`pages/`, `steps/`) and reuse it rather than rebuilding -- don't assume the
repo is empty.

Even a single-use page should be broken into sub-components where the page
itself repeats a visual pattern (e.g. the same circle or panel shown more
than once) -- don't write the same JSX twice. Exact component names will be
specified per task, but folder placement follows one fixed rule:

- components/layout/ -- components that frame the page itself and stay
in a fixed position regardless of content. These define page
structure.
- components/shared/ -- components used within a page's content, reused
across different contexts. These are building blocks, not structure.

## Design tokens (already defined in `src/index.css`)

Primitives (`--c-*`) hold raw hex/rgba values from Figma. Components should
only ever reference **semantic tokens** (`--color-*`), never primitives
directly -- if a new use case comes up, add a new semantic alias rather than
reaching for a raw `--c-*` value in a component.

Semantic color roles already defined:
- `--color-text`, `--color-bg`, `--color-text-secondary`
- `--color-surface` -- panel backgrounds (GENERATED VALUES box, cards)
- `--color-inactive` -- pending/disabled state (unchecked steps, dimmed text)
- `--color-border` -- dividers, step-tree lines
- `--color-button-primary-bg` / `--color-button-primary-hover` -- Start/Next
- `--color-button-secondary-bg` / `--color-button-secondary-hover` -- Prev
- `--color-accent` -- active step dots, checkmarks, home page circles
- `--color-formula-bg` -- the yellow formula box on every step
- `--color-transform` -- G / PRF / NTT / SampleNTT boxes and their arrows
- `--color-matrix-a` / `--color-matrix-a-tint` -- matrix A, always this color
- `--color-secret-s` / `--color-secret-s-tint` -- secret vector s, always
- `--color-noise-e` / `--color-noise-e-tint` -- error vectors e/e1/e2, always
- `--color-public-t` / `--color-public-t-tint` -- public key t, always
- `--color-cbd-x-bits`, `--color-cbd-y-bits` -- CBD bit-counting widget

Each cryptographic object (A, s, e, t) keeps its assigned color everywhere
in the app -- never reuse one of these colors for a different object.

Typography classes (already defined): `.th1`, `.th2`, `.label`,
`.body-text`, `.formula`, `.btn-text`, `.micro-label`, `.index-text`. Use
these instead of writing new font-size/weight declarations.

When A, s, e, or t appear as INPUTS to an operation (not being newly 
generated for the first time), always use the compact tinted-block 
style (single label centered, e.g. "A" or "s"), not the detailed 
per-index cell style. The detailed style is reserved only for the step 
where that value is FIRST generated (e.g. "Expand matrix A" for A, 
"Generate secret vector" for s).

## Interaction rules

- A chevron (`›`) next to a value means it's clickable and opens an
  `InfoPopup` with its content. Only values that have been generated show a
  chevron -- pending values show a plain checkbox, no chevron, not
  clickable.
- Graphite transform boxes (G, PRF, H, J, NTT, SampleNTT) are always
  clickable -- click opens a popup explaining what the function does
  (plain-language, not the internal math -- e.g. explain NTT as "same
  polynomial, different representation, makes multiplication fast," not the
  butterfly network internals).
- Steps that only delegate to a deeper layer (e.g. "Run internal
  algorithm", "Generate PKE key pair") are not separate screens the user
  navigates through -- clicking Next marks them done (green) in the
  StepTree instantly and proceeds straight to the first step with real
  content.
- Small "CBD-sampled" values (s, e, y, e1, e2) display signed coefficients
  (-eta to +eta), not the mod-q canonical form -- this is precomputed in the
  JSON as `coeffs_signed`. Large uniformly-random values (A, t, u, v)
  display the mod-q form (`coeffs`).

## Code style

- Keep comments moderate: explain non-obvious *why*, not line-by-line
  *what*. Component and prop names should be self-explanatory enough that
  most lines need no comment.
- Build static UI first. Animations come later, in a dedicated pass, once
  every screen exists -- don't add motion while still getting layout and
  data right.
- No localStorage, no backend calls, no external state management library
  needed for a project this size -- plain React state is enough.

## Commands
- `npm run dev` -- start dev server