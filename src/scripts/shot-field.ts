import { RAMP, fitCanvas, prefersReducedMotion, type CanvasSize } from './canvas';

/** Each card's field runs for this long, then clears to reveal the screenshot. */
const SHOT_MS = 1180;
/** Card n waits this much longer than card n-1. */
const STAGGER_MS = 200;
/** Lead-in before the first card starts. */
const LEAD_MS = 200;
/** ~19fps. Same deliberately-choppy register as the landing field. */
const FRAME_MS = 52;

interface Shot {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  size: CanvasSize;
  done: boolean;
}

/** Smoothstep, clamped. The three phases of the load-in are all cut from this. */
function ease(u: number): number {
  const c = Math.min(1, Math.max(0, u));
  return c * c * (3 - 2 * c);
}

/**
 * Draws one card's frame of the ASCII load-in.
 *
 * `p` walks 0 -> 1 over SHOT_MS and drives three overlapping phases: the glyphs
 * over-brighten (`boost`), the whole field washes from the dark ground to the
 * page's light one (`wash`), then the canvas fades out (`out`) and the
 * screenshot underneath is simply revealed.
 */
function drawShot(shot: Shot, p: number, ts: number, accent: [number, number, number]): void {
  const { ctx, size } = shot;
  const [ar, ag, ab] = accent;
  const t = ts * 0.0022;
  const scale = size.w > 700 ? 2.2 : size.w > 380 ? 1.35 : 0.95;
  const cw = 6.6 * scale;
  const ch = 10.2 * scale;
  const cols = Math.ceil(size.w / cw);
  const rows = Math.ceil(size.h / ch) + 1;
  const cx = cols * 0.5;
  const cy = rows * 0.5;

  ctx.clearRect(0, 0, size.w, size.h);

  const boost = ease((p - 0.3) / 0.36);
  const wash = ease((p - 0.44) / 0.3);
  const out = ease((p - 0.72) / 0.28);
  if (out >= 1) return;

  ctx.globalAlpha = 1 - out;
  const bg = [
    Math.round(4 + (238 - 4) * wash),
    Math.round(7 + (241 - 7) * wash),
    Math.round(13 + (238 - 13) * wash),
  ];
  ctx.fillStyle = `rgb(${bg[0]},${bg[1]},${bg[2]})`;
  ctx.fillRect(0, 0, size.w, size.h);
  ctx.font = `${(9.4 * scale).toFixed(1)}px "JetBrains Mono", ui-monospace, monospace`;
  ctx.textBaseline = 'top';

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const dx = x - cx;
      // 1.55 corrects for the non-square cell.
      const dy = (y - cy) * 1.55;
      const r = Math.sqrt(dx * dx + dy * dy);
      const a = Math.atan2(dy, dx);

      // Tighter, faster cousin of the landing field: 7 arms, steeper falloff.
      let v = 0.5 + 0.5 * Math.sin(a * 7 + Math.sin(r * 0.16 - t * 1.1) * 1.7 + t * 0.5);
      v *= Math.exp(-r * 0.03);
      v += 0.26 * Math.sin(x * 0.17 + t * 0.7) * Math.cos(y * 0.24 - t * 0.6);
      v += 0.12 * Math.sin(x * 0.33 + y * 0.29 + t * 1.1);
      v += 0.2 * Math.exp(-r * 0.09);
      v *= 0.9;
      if (boost > 0) v = v * (1 + boost * 1.6) + boost * 0.5;

      if (v <= 0.07) continue;
      v = Math.min(1, v);

      const g = RAMP[Math.min(RAMP.length - 1, Math.floor(v * RAMP.length))];
      if (g === ' ') continue;

      const hot = v > 0.86 || boost > 0.45;
      let cr = hot ? 232 : ar;
      let cg = hot ? 244 : ag;
      let cb = hot ? 255 : ab;
      const al = hot ? Math.min(1, 0.55 + v * 0.45) : Math.min(1, 0.12 + v * 0.72);
      // Every glyph lerps to white alongside the ground.
      cr += (255 - cr) * wash;
      cg += (255 - cg) * wash;
      cb += (255 - cb) * wash;

      ctx.fillStyle = `rgba(${Math.round(cr)},${Math.round(cg)},${Math.round(cb)},${al.toFixed(2)})`;
      ctx.fillText(g, x * cw, y * ch);
    }
  }
  ctx.globalAlpha = 1;
}

/**
 * Plays the staggered load-in across every work card, in DOM order, then stops.
 * Under reduced motion the canvases are removed and the screenshots show
 * immediately. Returns a teardown for `pagehide`.
 */
export function playShotFields(
  canvases: HTMLCanvasElement[],
  accentHex: string,
): () => void {
  const drop = () => canvases.forEach((c) => c.remove());
  if (!canvases.length) return () => {};
  if (prefersReducedMotion()) {
    drop();
    return () => {};
  }

  const accent: [number, number, number] = [
    parseInt(accentHex.slice(1, 3), 16),
    parseInt(accentHex.slice(3, 5), 16),
    parseInt(accentHex.slice(5, 7), 16),
  ];

  const shots: Shot[] = [];
  for (const canvas of canvases) {
    const ctx = canvas.getContext('2d');
    if (ctx) shots.push({ canvas, ctx, size: { w: 0, h: 0 }, done: false });
  }

  const start = performance.now();
  let raf = 0;
  let last = 0;

  function loop(ts: number): void {
    if (ts - last < FRAME_MS) {
      raf = requestAnimationFrame(loop);
      return;
    }
    last = ts;

    let running = false;
    shots.forEach((shot, i) => {
      if (shot.done) return;
      running = true;
      const p = Math.min(1, Math.max(0, (ts - start - LEAD_MS - i * STAGGER_MS) / SHOT_MS));
      if (!fitCanvas(shot.canvas, shot.ctx, shot.size)) return;
      drawShot(shot, p, ts, accent);
      if (p >= 1) {
        shot.done = true;
        // Nothing left to reveal — take the canvas out rather than leaving a
        // transparent layer sitting over the screenshot.
        shot.canvas.remove();
      }
    });

    if (running) raf = requestAnimationFrame(loop);
  }

  raf = requestAnimationFrame(loop);
  return () => cancelAnimationFrame(raf);
}
