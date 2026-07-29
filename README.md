# Luke To — personal site

Live at **https://lukietoo.github.io/Luke-site/**

Static site built with Astro, recreated from `design_handoff_personal_site/`
(see that folder's README for the design spec, and `production/` inside it for
the newer spec covering work + case studies).

- `/` — full-viewport dark terminal splash with the animated ASCII field.
- `/about/` — light, document-like about page.
- `/work/` — 2x2 grid of project cards, each with its own ASCII load-in.
- `/work/<slug>/` — case study, one per unlocked project.

Clicking `LEARN MORE` plays the 820ms whiteout, then navigates at 780ms.

The prototype was a single component behind a hash router (`#/work/meridian`).
Here every screen is a real Astro page, so the back arrows and card clicks are
plain `<a>` links rather than the spec's `<button>` + `history` calls.

## Requirements

**Node >= 22.12** (Astro 6). This machine's default `node` is nvm's v20, which
Astro refuses to run on. Either:

```bash
nvm install 22 && nvm use
```

or use the Homebrew build already installed:

```bash
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
```

## Commands

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds and
publishes to GitHub Pages.

Because this is a **project** site, everything is served under `/Luke-site`
(`base` in `astro.config.mjs`). Any internal path — routes, favicon, OG image,
prefetch — must go through `withBase()` from `src/config/site.ts`. A hardcoded
`/about` works in `npm run dev` and 404s in production.

If you later move to a custom domain or to the `Lukietoo.github.io` repo, drop
`base` and the `withBase()` calls collapse to no-ops.

## Layout

| Path | What |
|---|---|
| `src/pages/index.astro` | Landing — markup, styles, whiteout + motion toggle |
| `src/pages/about.astro` | About page |
| `src/pages/work/index.astro` | Work grid |
| `src/pages/work/[slug].astro` | Case study, one page per unlocked project |
| `src/scripts/ascii-field.ts` | Landing canvas, ported from the prototype's `draw()` |
| `src/scripts/shot-field.ts` | Per-card load-in, ported from `drawShot()` |
| `src/scripts/canvas.ts` | Glyph ramp + DPR fit, shared by both renderers |
| `src/config/site.ts` | Field parameters, all `href`s, placeholder copy |
| `src/config/work.ts` | Project data, screenshot imports, case ordering |
| `src/components/SocialIcon.astro` | X / LinkedIn / GitHub / Instagram paths |
| `src/components/ChromeBar.astro` | Fake browser chrome above every screenshot |
| `src/layouts/Base.astro` | Document head — title, meta, OG/Twitter |
| `src/styles/global.css` | Keyframes (verbatim from the handoff) + reduced-motion |

## Work and case studies

`src/config/work.ts` is the only file to touch when the projects change. Order
in the `projects` array does three things at once: the first four entries are
the 2x2 grid, the rest become the ALSO row, and a project's index is its
`CASE 0N` number.

A project with a `locked` panel is a placeholder — it renders the stealth /
coming-soon well instead of a screenshot, its name is dimmed, it gets no links,
and `getStaticPaths` skips it, so `/work/basecase/` is a genuine 404. Deleting
its `locked` block and adding `card` + `shots` is all it takes to publish it.

Each grid card plays a 1180ms ASCII load-in (staggered 200ms) that burns away to
reveal the screenshot underneath — locked cards included. Under
`prefers-reduced-motion` the canvases are dropped and the shots show at once.

## Tuning the ASCII field

All four tweakable parameters live in `src/config/site.ts` as `fieldDefaults`:

| Name | Default | Range |
|---|---|---|
| `accent` | `#7aa8ff` | also `#5fe0cf`, `#d9a441`, `#8fffb0` |
| `speed` | `1` | 0 – 2.5 |
| `glyphScale` | `1.8` | 0.7 – 2.4 |
| `calmRadius` | `0.18` | 0.05 – 0.4 |

If the name on the landing page ever changes from "Luke To", recompute **both**
the `typeIn` end width in `src/styles/global.css` and the `steps(7, end)` count
in `index.astro` — 7 characters x (0.6em advance - 0.02em letter-spacing).

The work page's headline types in the same way: `typeWork` ends at `13ch` and
`work/index.astro` uses `steps(13, end)`. If "selected work" changes, both
numbers have to change with it.

## Still to fill in

1. **Real `href`s** — every link in `src/config/site.ts` still points at a bare
   domain or `#`: the four socials, Calendly, `Project Name`, and the two inline
   body links.
2. **Final copy** — `copy` in `src/config/site.ts` holds the placeholder life
   story rows, beliefs, role line, and project name. The "what i'm building now"
   paragraph is still inline in `about.astro`.
3. **Real projects** — every name, host and write-up in `src/config/work.ts` is
   a placeholder from the handoff, and `src/assets/work/*.png` are generated
   flat-grey 16:10 stand-ins. Replace the images at the same paths and the
   `<Image>` tags need no edits. Case-study prose falls back to
   `placeholderIntro`; give a project its own `intro` to override.
4. **Calendly icon** — currently a neutral calendar glyph in `about.astro`.
   Drop in the official mark from Calendly's brand page when you have it.
5. **`site` in `astro.config.mjs`** — set to the real domain; it's what builds
   the absolute canonical and OG URLs.
6. **`public/og-image.png`** — a generated 1200x630 placeholder. Worth replacing
   with a properly typeset card (it renders in a system mono, not JetBrains Mono).
