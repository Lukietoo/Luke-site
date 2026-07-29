/**
 * Project data behind /work/ and /work/<slug>/.
 *
 * Names, hosts, copy and screenshots are all placeholders from the handoff —
 * swap them for real work. Order matters twice over: the first four entries
 * are the 2x2 grid, the rest fall into the ALSO row, and the case-study number
 * (`CASE 0N`) is a project's position in this array.
 */
import type { ImageMetadata } from 'astro';

import meridianCard from '../assets/work/meridian-card.png';
import meridianA from '../assets/work/meridian-a.png';
import meridianB from '../assets/work/meridian-b.png';
import meridianC from '../assets/work/meridian-c.png';
import halfnoteCard from '../assets/work/halfnote-card.png';
import halfnoteA from '../assets/work/halfnote-a.png';
import halfnoteB from '../assets/work/halfnote-b.png';
import halfnoteC from '../assets/work/halfnote-c.png';
import overpassA from '../assets/work/overpass-a.png';
import overpassB from '../assets/work/overpass-b.png';
import overpassC from '../assets/work/overpass-c.png';
import softserveA from '../assets/work/softserve-a.png';
import softserveB from '../assets/work/softserve-b.png';
import softserveC from '../assets/work/softserve-c.png';

/** Replaces the screenshot well on a project that has nothing public yet. */
export interface LockedPanel {
  /** Mono eyebrow inside the well — the project's index, zero-padded to 3. */
  eyebrow: string;
  headline: string;
  sub: string;
  /** Stands in for the host in the card's meta line. */
  meta: string;
}

export interface Project {
  name: string;
  role: string;
  /** Bare host; the case study prefixes https:// for the live link. */
  host: string;
  slug: string;
  /** Present on placeholders. Locked projects get no case study and no links. */
  locked?: LockedPanel;
  /** Grid thumbnail. Locked projects show their panel instead. */
  card?: ImageMetadata;
  /** Case study: hero first, then the two detail shots. */
  shots?: [ImageMetadata, ImageMetadata, ImageMetadata];
  /** Per-project case-study opener; falls back to the placeholder below. */
  intro?: string;
}

/** TODO: one of these per project once the real write-ups exist. */
export const placeholderIntro =
  'One paragraph on what the problem was, who it was for, and what you actually changed. Two or three sentences is plenty here.';

export const projects: Project[] = [
  {
    name: 'Meridian',
    role: 'design + build',
    host: 'meridian.app',
    slug: 'meridian',
    card: meridianCard,
    shots: [meridianA, meridianB, meridianC],
  },
  {
    name: 'Halfnote',
    role: 'design',
    host: 'halfnote.co',
    slug: 'halfnote',
    card: halfnoteCard,
    shots: [halfnoteA, halfnoteB, halfnoteC],
  },
  {
    name: 'Basecase',
    role: 'design + build',
    host: 'basecase.dev',
    slug: 'basecase',
    locked: {
      eyebrow: '003',
      headline: 'building in stealth right now…',
      sub: 'check back later :)',
      meta: 'in stealth',
    },
  },
  {
    name: 'Fieldnote',
    role: 'build',
    host: 'fieldnote.io',
    slug: 'fieldnote',
    locked: {
      eyebrow: '004',
      headline: 'coming soon!',
      sub: 'something new is in the works',
      meta: 'coming soon',
    },
  },
  {
    name: 'Overpass',
    role: 'design',
    host: 'overpass.studio',
    slug: 'overpass',
    shots: [overpassA, overpassB, overpassC],
  },
  {
    name: 'Softserve',
    role: 'design + build',
    host: 'softserve.fm',
    slug: 'softserve',
    shots: [softserveA, softserveB, softserveC],
  },
];

/** The 2x2 card grid. */
export const gridProjects = projects.slice(0, 4);

/** Everything past the grid, listed by name under ALSO. */
export const alsoProjects = projects.slice(4);

/** Only these get a case study, and only these are in the next-> cycle. */
export const openProjects = projects.filter((p) => !p.locked);

/** Zero-padded position in `projects` — the `CASE 0N` eyebrow. */
export function caseNumber(project: Project): string {
  return String(projects.indexOf(project) + 1).padStart(2, '0');
}

/** Next unlocked project, wrapping. Locked entries are skipped entirely. */
export function nextOpen(project: Project): Project {
  const i = openProjects.indexOf(project);
  return openProjects[(Math.max(0, i) + 1) % openProjects.length];
}
