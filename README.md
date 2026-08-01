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

The prototype was a single component behind a hash router (`#/work/<slug>`).
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
| `src/layouts/Base.astro` | Document head — title, meta, icons, OG/Twitter |
| `src/pages/site.webmanifest.ts` | PWA manifest, a route so its paths get the base |
| `src/styles/global.css` | Keyframes (verbatim from the handoff) + reduced-motion |

## Work and case studies

`src/config/work.ts` is the only file to touch when the projects change. Order
in the `projects` array does three things at once: the first `GRID_SIZE` entries
are the card grid, the rest become the ALSO row, and a project's index is its
`CASE 0N` number.

`url` is the full URL including protocol — several projects live under a path
rather than at the root of their own domain, so it can't be a bare host.
`displayUrl()` strips the protocol and trailing slash for the meta line and the
case study's LIVE row.

A project with a `video` shows a recording in the case study's hero frame
instead of `shots[0]`, which becomes the poster — so it still needs all three
stills. Video files go in `public/`, not `src/assets`: Astro's asset pipeline
only optimises images. It renders with controls and no autoplay, and is
letterboxed rather than cropped. Use it for anything that can't be linked
because it only runs locally.

A project with a `locked` panel has nothing public yet — it renders the
coming-soon well instead of a screenshot, its name is dimmed, it gets no links,
and `getStaticPaths` skips it, so `/work/docere/` is a genuine 404. Deleting its
`locked` block and adding `url`, `slug`, `card` + `shots` publishes it.

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
2. **Case-study prose** — the `intro` on each project in `src/config/work.ts`
   describes what the project *is*, not what Luke did on it. Rewrite them in his
   own voice. A project with no `intro` falls back to `placeholderIntro`.
   `src/assets/work/*.png` are 1440x900 screenshots captured from the live sites
   at `deviceScaleFactor: 1.5`; re-shoot at those dimensions when a project
   changes and the `<Image>` tags need no edits. The `ants-*` three are the
   exception — they're the game's own art, cut out of its spec page rather than
   shots of it, and every well is 16:10, so anything dropped in there wants
   trimming or padding to that ratio instead of cropping by the `cover`.
3. **Calendly icon** — currently a neutral calendar glyph in `about.astro`.
   Drop in the official mark from Calendly's brand page when you have it.
4. **`site` in `astro.config.mjs`** — currently `https://lukietoo.github.io`,
   which is where Pages serves it. Point it at a custom domain if you get one;
   it's what builds the absolute canonical and OG URLs.

## The link-preview cards

`public/og-image.png` is 1200x630 (the OG spec, 1.91:1) and is the card for
every page — only `og:title` and `og:description` vary. `twitter:card` is
`summary_large_image`, so it unfurls as a full-width banner.

The one in the repo is the design handoff's own render, downsampled from its
2400x1260 master. `scripts/og-image.html` reproduces that design — same field
math, type and pocket — but its field is seeded from a different roll, so
re-running the script gives the same card with a different scatter of glyphs,
not the file that's checked in.

They're generated, not hand-made. Edit the source HTML and re-run the script,
which takes a source and a destination:

```bash
npm i --no-save puppeteer-core
node scripts/og-image.mjs
node scripts/og-image.mjs scripts/og-paper-trader.html public/og-paper-trader.png
```

That renders the card at 2x through the machine's Chrome and downsamples to
1200x630, so the type is properly antialiased. Each source declares the
webfaces it can't ship without in `<meta name="og-font-check">`, and the script
aborts rather than writing a file if one hasn't arrived from Google Fonts —
otherwise it would silently ship the card set in a fallback face, which is
exactly the bug that made the first one need replacing. A source declaring no
check at all is an error too, not a pass.

`Base.astro` declares the card's `og:image:width`/`height` so a scraper can
reserve the space before fetching. If you change a card's dimensions, change
them there too — nothing checks that they agree.

### A project's own card

A case study can replace the site-wide card by setting `share` on its entry in
`src/config/work.ts` — a root-relative path under `public/`, its alt text, and
an optional description that replaces the generated one. `Base.astro` takes
`ogImage`/`ogImageAlt` for the same thing on a one-off page.

`og-paper-trader.png` has a source in `scripts/`; `og-cats.png` doesn't — it's a
design handoff's own render, downsampled from 2400x1260. `cats-card.png` is that
same art with the flat green extended top and bottom to reach the grid's 16:10,
so the well crops nothing off the sides.

## The favicon

The mark is the ASCII field boiled down to a 3x3 matrix with the calm pocket in
the middle. Every raster size came from the design handoff; `public/favicon.svg`
is the same geometry redrawn as vectors, and is what scaling browsers use.

| File | Where it's used |
|---|---|
| `favicon.svg` | `rel=icon`, preferred by anything that can scale |
| `favicon.ico` | `rel=icon`, and the `/favicon.ico` crawlers fetch unasked |
| `favicon-16.png`, `favicon-32.png` | `rel=icon` for browsers that read neither |
| `favicon-48.png` | Not linked — the third size inside the `.ico` |
| `apple-touch-icon-180.png` | iOS home screen; square, iOS applies the mask |
| `favicon-512-square.png`, `maskable-512.png` | The manifest's two icons |

The `.ico` is a repack, not a re-render — it bundles the three PNGs as-is:

```bash
node scripts/favicon-ico.mjs
```

`src/pages/site.webmanifest.ts` builds the manifest as a route rather than a
static file so `start_url` and the icon paths pick up the base; a literal `/`
in a `public/site.webmanifest` would point off the top of the domain.
`theme-color` isn't in there — `Base.astro` emits it per page from the `ground`
prop, so mobile browser chrome follows the page it's on.

`paper-trader` is the only one so far: `scripts/og-paper-trader.html` renders
the "Clay grid" receipt from its design handoff. It's inline SVG, with every
coordinate in the 1200x630 canvas — the handoff calls those final, so change
them deliberately. Two things there aren't obvious:

- `xml:space="preserve"` on the ticker rows is load-bearing. The labels are
  padded with runs of spaces so the `xNN` column lines up, and SVG collapses
  whitespace without it.
- The `ogSketch` filter goes on the slip and the rule under the headline, never
  on text — displaced type stops being legible at unfurl size.

Slack and X cache OG images hard. When a card's art changes, ship it under a new
filename rather than overwriting the old path, or the stale one keeps unfurling.
