/**
 * Single place for the things the handoff flagged as placeholders, plus the
 * ASCII field's four tweakable parameters.
 */

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

/** TODO: all of these are the prototype's placeholder destinations. */
export const links = {
  linkedin: 'https://linkedin.com/',
  x: 'https://x.com/',
  github: 'https://github.com/',
  instagram: 'https://instagram.com/',
  calendly: 'https://calendly.com/',
  /** "View work" CTA — destination TBD */
  work: '#',
  /** "currently building <Project Name>" on the landing page */
  project: '#',
  /** Trailing link on the last life-story row */
  known: '#',
  /** "the side thing" inline link */
  sideProject: '#',
};

/** TODO: placeholder copy — the handoff says final copy is coming separately. */
export const copy = {
  name: 'Luke To',
  role: 'Student @ UC Berkeley & Founder',
  projectName: 'Project Name',
  lifeStory: [
    { age: 'AGE 00', text: 'first thing that pointed you here' },
    { age: 'AGE 00', text: 'the obsession that stuck' },
    { age: 'AGE 00', text: 'the first thing you shipped' },
    { age: 'AGE 00', text: 'the thing that failed, usefully' },
    // The trailing link must stay in the same grid cell as its text — see the
    // README's note about the value column collapsing and wrapping it away.
    { age: 'AGE 00', text: "what you're known for now,", link: 'Link' },
  ] as { age: string; text: string; link?: string }[],
  beliefs: [
    "a belief you'd defend at a party",
    'something > something else',
    'a thing most people get wrong',
  ],
};
