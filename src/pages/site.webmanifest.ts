/**
 * The PWA manifest, built as a route rather than dropped in `public/` because
 * every path inside it has to carry the `/Luke-site` base — a literal `/` here
 * would send an installed icon request to the top of the domain. Emits
 * `/site.webmanifest`, which is what `Base.astro` links.
 */
import type { APIRoute } from 'astro';
import { withBase } from '../config/site';

const manifest = {
  name: 'Luke To',
  short_name: 'Luke To',
  start_url: withBase('/'),
  display: 'standalone',
  background_color: '#04070d',
  theme_color: '#04070d',
  icons: [
    {
      src: withBase('/favicon-512-square.png'),
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any',
    },
    // Padded so Android can crop it to whatever shape the launcher uses.
    {
      src: withBase('/maskable-512.png'),
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable',
    },
  ],
};

export const GET: APIRoute = () =>
  new Response(JSON.stringify(manifest, null, 2), {
    headers: { 'content-type': 'application/manifest+json' },
  });
