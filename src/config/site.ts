/**
 * Single place for the things the handoff flagged as placeholders, plus the
 * ASCII field's four tweakable parameters.
 */

/**
 * Prefixes a site-root path with the configured base. The site is published
 * under /Luke-site on GitHub Pages, so every internal path — routes, favicon,
 * OG image, prefetch — has to go through this. Works in both .astro frontmatter
 * and client scripts; Vite inlines BASE_URL at build time.
 */
export function withBase(path = '/'): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

/** ASCII field tuning. Defaults and ranges are from the handoff README. */
export interface FieldConfig {
  /** Glyph color. Offered alternates: #5fe0cf, #d9a441, #8fffb0 */
  accent: string;
  /** Time multiplier. Range 0 – 2.5 */
  speed: number;
  /** Glyph + cell size. Range 0.7 – 2.4 */
  glyphScale: number;
  /** Size of the sparse center pocket. Range 0.05 – 0.4 */
  calmRadius: number;
}

export const fieldDefaults: FieldConfig = {
  accent: '#7aa8ff',
  speed: 1,
  glyphScale: 1.8,
  calmRadius: 0.18,
};

export const links = {
  linkedin: 'https://www.linkedin.com/in/luketo/',
  x: 'https://x.com/Lukietoo',
  github: 'https://github.com/Lukietoo',
  instagram: 'https://www.instagram.com/lukietoo/',
  calendly: 'https://calendly.com/luketruongto-berkeley/30min',
};

/** All final. Nothing here is a placeholder. */
export const copy = {
  name: 'Luke To',
  role: 'Student @ UC Berkeley & Founder',
  /**
   * Landing page: renders as "currently building <this>", unlinked. The work
   * has no public name yet — when it gets one, this becomes the link text.
   */
  buildingNow: 'tools for telling your own story',
  lifeStory: [
    { age: 'AGE 12', text: 'built a working cardboard PC to play video games.' },
    {
      age: 'AGE 13',
      text: 'started building on Roblox, learned to code just to bring my ideas to life.',
    },
    { age: 'AGE 15', text: 'one of my games hit 1000 plays for the first time.' },
    {
      age: 'AGE 17',
      text: 'became obsessed with storytelling, and building in order to tell stories.',
    },
    {
      age: 'AGE 19',
      text: "stories are how we make sense of being alive. Now I'm trying to build tools that help anyone turn theirs into one worth telling.",
    },
  ] as { age: string; text: string }[],
  /** The "what i'm building now" paragraph, one line per entry. */
  building: [
    'Tools that help anyone turn their own story into one worth telling.',
    'Still early, still unnamed.',
  ],
  beliefs: [
    "there's no such thing as embarrassment",
    'an audience of one still counts',
    "curiosity doesn't need a roadmap",
  ],
};
