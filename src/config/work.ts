/**
 * Project data behind /work/ and /work/<slug>/.
 *
 * Order matters twice over: the first `GRID_SIZE` entries are the card grid,
 * the rest fall into the ALSO row, and the case-study number (`CASE 0N`) is a
 * project's position in this array.
 *
 * Screenshots are captured from the live sites, so they go stale when a project
 * ships a redesign — re-shoot rather than letting a case study lie.
 */
import type { ImageMetadata } from 'astro';

import paperTraderCard from '../assets/work/paper-trader-card.png';
import paperTraderA from '../assets/work/paper-trader-a.png';
import paperTraderB from '../assets/work/paper-trader-b.png';
import paperTraderC from '../assets/work/paper-trader-c.png';
import antsA from '../assets/work/ants-a.png';
import antsB from '../assets/work/ants-b.png';
import antsC from '../assets/work/ants-c.png';
import catsCard from '../assets/work/cats-card.png';
import catsA from '../assets/work/cats-a.png';
import catsB from '../assets/work/cats-b.png';
import catsC from '../assets/work/cats-c.png';

/** Replaces the screenshot well on a project that has nothing public yet. */
export interface LockedPanel {
  /** Mono eyebrow inside the well — the project's index, zero-padded to 3. */
  eyebrow: string;
  headline: string;
  /** Optional line under the headline, inside the well. */
  sub?: string;
  /**
   * Stands in for the name in the card's cap. Set this on a project whose name
   * isn't public yet — the cap needs something in the name's slot or the card
   * loses its rhythm against its neighbours.
   */
  caption?: string;
  /** Stands in for the live URL in the card's meta line. */
  meta: string;
}

/**
 * A project's own link-preview card, replacing the site-wide one on its case
 * study. Worth making only for a project whose design says something the
 * generic card can't — everything else unfurls fine as `og-image.png`.
 */
export interface Share {
  /**
   * PNG under `public/`, root-relative — it goes through `withBase()` and is
   * made absolute against `site` at render, since relative OG paths silently
   * fail in Slack and iMessage. Must be 1200x630, matching the dimensions
   * `Base.astro` declares.
   */
  image: string;
  /** What the card shows, for anyone reading the unfurl with a screen reader. */
  imageAlt: string;
  /** Replaces the generated description on this project's case study. */
  description?: string;
}

export interface Project {
  /**
   * All three are omitted together, and only on a locked project with nothing
   * to link to yet. `locked.caption` and `locked.meta` cover the card.
   */
  name?: string;
  /**
   * Full URL of the live project, protocol included — several of these live
   * under a path rather than at the root of their own domain, so this cannot
   * be a bare host. `displayUrl` strips it down for display.
   */
  url?: string;
  slug?: string;
  role: string;
  /** Present on placeholders. Locked projects get no case study and no links. */
  locked?: LockedPanel;
  /**
   * Grid thumbnail, 16:10 — the well crops to `cover`. Locked projects show
   * their panel instead.
   */
  card?: ImageMetadata;
  /**
   * Overrides the grid thumbnail's alt text. Only needed when the thumbnail
   * isn't a screenshot, since the default calls it one.
   */
  cardAlt?: string;
  /** Case study: hero first, then the two detail shots. */
  shots?: [ImageMetadata, ImageMetadata, ImageMetadata];
  /**
   * A screen recording, for a project that has to be watched rather than
   * visited — anything that only runs locally. It takes over the case study's
   * hero frame and `shots[0]` becomes its poster, so a project with a video
   * still needs all three stills.
   */
  video?: Video;
  /** Per-project case-study opener; falls back to the placeholder below. */
  intro?: string;
  /** Per-project link-preview card; falls back to the site-wide one. */
  share?: Share;
}

/**
 * Video lives in `public/`, not `src/assets` — Astro's asset pipeline handles
 * images, and passing it a video would only mean it gets copied through with a
 * hashed name. Both paths are root-relative and go through `withBase()` at
 * render, like every other internal path on the site.
 */
export interface Video {
  /** MP4 path under `public/`, e.g. `/work/ants-demo.mp4`. Widest support. */
  src: string;
  /** Optional WebM companion, offered to the browser first when present. */
  webm?: string;
  /** What the clip shows, for anyone who can't or won't play it. */
  alt: string;
}

/** TODO: one of these per project once the real write-ups exist. */
export const placeholderIntro =
  'One paragraph on what the problem was, who it was for, and what you actually changed. Two or three sentences is plenty here.';

export const projects: Project[] = [
  {
    name: 'Paper Trading',
    role: 'design + build',
    url: 'https://lukietoo.github.io/WIP_Mockup/',
    slug: 'paper-trader',
    // The grid shows the project's own card rather than a screenshot of it —
    // same art as the share card below, rendered at 16:10 so the well doesn't
    // crop the headline. The case study still opens on the real dashboard.
    card: paperTraderCard,
    cardAlt:
      'Paper Trading card — a hand-lettered headline beside a paper receipt of the day’s trades',
    shots: [paperTraderA, paperTraderB, paperTraderC],
    intro:
      'An early, experimental mockup of a paper-trading dashboard, inspired by a popular GitHub repo for an AI trading agent. The goal was an easy-to-read interface for following paper trades over time: portfolio value and P&L up top, then positions and a full activity log behind their own tabs.',
    // Built from the "Clay grid" handoff — source in scripts/og-paper-trader.html.
    share: {
      image: '/og-paper-trader.png',
      imageAlt:
        'A torn paper receipt listing NVDA, AAPL, TSLA and SPY with a +$1,052 daily total, beside a hand-lettered headline.',
      description: 'Positions, activity, and P&L — sketched, not shipped.',
    },
  },
  {
    name: 'CATS',
    role: 'build',
    url: 'https://cats.cs61a.org',
    slug: 'cats',
    // Same art as the share card, extended to 16:10 so the well crops none of
    // it. The case study still opens on the typing test itself.
    card: catsCard,
    cardAlt: 'CATS card — the name spelled out across four keycaps beside a cat-eared key',
    shots: [catsA, catsB, catsC],
    intro:
      'Computer Aided Typing Software: a typing test that measures words per minute and accuracy against a generated passage, with an autocorrect option that suggests the intended word from a small edit distance. Built for CS 61A at Berkeley.',
    share: {
      image: '/og-cats.png',
      imageAlt:
        'CATS spelled across four dark keycaps on green, one of them a white key with cat ears, under the line "How fast can you type?"',
      description: 'A typing test that scores speed, accuracy, and your spelling.',
    },
  },
  {
    name: 'Docere',
    role: 'design + build',
    locked: {
      // No `sub` — the card below owns the second line, and two locked cards
      // each carrying one in the same grid reads as a copy-paste.
      eyebrow: '003',
      headline: 'fixing website bugs',
      meta: 'in progress',
    },
  },
  // Unnamed, holding the last slot of the grid until there is real work to put
  // in it. No invented project name — `caption` covers the cap so nothing on
  // the page claims a project that isn't.
  {
    role: 'design + build',
    locked: {
      eyebrow: '004',
      headline: 'coming soon',
      sub: 'building in stealth right now',
      caption: 'Check back soon!',
      meta: 'in stealth',
    },
  },
  {
    name: 'Ants Vs. SomeBees',
    role: 'build',
    url: 'https://cs61a.org/proj/ants/',
    slug: 'ants',
    shots: [antsA, antsB, antsC],
    // Drop a recording in here once there's one to show — it takes over the
    // hero frame and `shots[0]` becomes its poster:
    //   video: { src: '/work/ants-demo.mp4', alt: 'a round of Ants Vs. SomeBees' }
    intro:
      'A tower-defense game in Python, built as the object-oriented programming project for CS 61A at Berkeley. Ants defend a colony against invading bees, and each new ant type is a subclass that bends one rule of the base behaviour — so the work is mostly in getting the inheritance hierarchy to carry its weight.',
  },
];

/** A project with a case study, so it is guaranteed to be named and routable. */
export type OpenProject = Project & { name: string; url: string; slug: string };

/** How many projects lead the page as cards. The rest fall into the ALSO row. */
const GRID_SIZE = 4;

/** The 2x2 card grid. */
export const gridProjects = projects.slice(0, GRID_SIZE);

/**
 * Everything past the grid, listed by name under ALSO. Locked entries are
 * dropped: the row is a list of names that link to case studies, and a locked
 * project has neither.
 */
export const alsoProjects = projects
  .slice(GRID_SIZE)
  .filter((p): p is OpenProject => !p.locked);

/** Only these get a case study, and only these are in the next-> cycle. */
export const openProjects = projects.filter((p): p is OpenProject => !p.locked);

/** The live URL as it reads in copy: no protocol, no trailing slash. */
export function displayUrl(project: OpenProject): string {
  return project.url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

/** Zero-padded position in `projects` — the `CASE 0N` eyebrow. */
export function caseNumber(project: Project): string {
  return String(projects.indexOf(project) + 1).padStart(2, '0');
}

/** Next unlocked project, wrapping. Locked entries are skipped entirely. */
export function nextOpen(project: Project): OpenProject {
  const i = openProjects.indexOf(project);
  return openProjects[(Math.max(0, i) + 1) % openProjects.length];
}
