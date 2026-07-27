import { defineConfig } from 'astro/config';

export default defineConfig({
  // Published as a GitHub Pages project site, so everything lives under /Luke-site.
  // Internal links go through withBase() in src/config/site.ts — see that helper
  // before hardcoding any absolute path.
  site: 'https://lukietoo.github.io',
  base: '/Luke-site',
});
