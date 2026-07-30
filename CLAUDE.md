# Luke-site

Luke To's personal site — Astro, published to GitHub Pages under `/Luke-site`.
See `README.md` for the file layout, the ASCII field's tuning parameters, and
what's still placeholder.

## Build

Requires **Node >= 22.12** (Astro 6). This machine's default `node` is nvm's
v20, which Astro refuses to run on:

```bash
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
```

Every internal path — routes, favicon, OG image, prefetch — must go through
`withBase()` from `src/config/site.ts`, because the site is served under a base
path. A hardcoded `/about` works in `npm run dev` and 404s in production.

## Agent skills

### Issue tracker

Issues live in this repo's GitHub Issues, driven through the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles, each label string equal to its role name. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context — `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
