# Luke To — personal site

Two-page static site built with Astro, recreated from
`design_handoff_personal_site/` (see that folder's README for the design spec).

- `/` — full-viewport dark terminal splash with the animated ASCII field.
- `/about` — light, document-like about page.

Clicking `LEARN MORE` plays the 820ms whiteout, then navigates at 780ms.

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

## Layout

| Path | What |
|---|---|
| `src/pages/index.astro` | Landing — markup, styles, whiteout trigger |
| `src/pages/about.astro` | About page |
| `src/scripts/ascii-field.ts` | Canvas renderer, ported from the prototype's `draw()` |
| `src/config/site.ts` | Field parameters, all `href`s, placeholder copy |
| `src/components/SocialIcon.astro` | X / LinkedIn / GitHub / Instagram paths |
| `src/layouts/Base.astro` | Document head — title, meta, OG/Twitter |
| `src/styles/global.css` | Keyframes (verbatim from the handoff) + reduced-motion |

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

## Still to fill in

1. **Real `href`s** — every link in `src/config/site.ts` still points at a bare
   domain or `#`: the four socials, Calendly, `View work`, `Project Name`, and
   the two inline body links.
2. **Final copy** — `copy` in `src/config/site.ts` holds the placeholder life
   story rows, beliefs, role line, and project name. The "what i'm building now"
   paragraph is still inline in `about.astro`.
3. **Calendly icon** — currently a neutral calendar glyph in `about.astro`.
   Drop in the official mark from Calendly's brand page when you have it.
4. **`site` in `astro.config.mjs`** — set to the real domain; it's what builds
   the absolute canonical and OG URLs.
5. **`public/og-image.png`** — a generated 1200x630 placeholder. Worth replacing
   with a properly typeset card (it renders in a system mono, not JetBrains Mono).
