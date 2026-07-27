import type { FieldConfig } from '../config/site';

/** 20 characters; index 0 is a space and is skipped. */
const RAMP = " .`'-:;+=*co0O8$@B%#";

/** ~14fps. Deliberately slow and filmic, not 60fps. */
const FRAME_MS = 68;
const TIME_STEP = 0.075;
export const WHITEOUT_MS = 820;

export interface AsciiField {
  /** Ramps the field to maximum brightness over WHITEOUT_MS. */
  startWhiteout(): void;
  destroy(): void;
}

/**
 * Renders the animated ASCII field. `container` is the element the pointer is
 * tracked against; `canvas` fills it.
 */
export function createAsciiField(
  canvas: HTMLCanvasElement,
  container: HTMLElement,
  config: FieldConfig,
): AsciiField {
  const ctx = canvas.getContext('2d');
  if (!ctx) return { startWhiteout() {}, destroy() {} };

  const ar = parseInt(config.accent.slice(1, 3), 16);
  const ag = parseInt(config.accent.slice(3, 5), 16);
  const ab = parseInt(config.accent.slice(5, 7), 16);

  // Every one of these changes per frame — none of it belongs in framework state.
  let w = 0;
  let h = 0;
  let t = 0;
  let last = 0;
  let raf = 0;
  let fxStart = 0;
  let whiteout = false;
  const ptr = { x: -999, y: -999 };

  /** Resizes the backing store only when the CSS size actually changed. */
  function fit(): boolean {
    if (!canvas.getBoundingClientRect().width) return false;
    const nw = canvas.offsetWidth;
    const nh = canvas.offsetHeight;
    if (w !== nw || h !== nh) {
      w = nw;
      h = nh;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(nw * dpr);
      canvas.height = Math.round(nh * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    return true;
  }

  function draw(): void {
    if (!fit()) return;

    const scale = config.glyphScale * (w < 560 ? 1.35 : 1);
    const cw = 6.6 * scale;
    const ch = 10.2 * scale;
    const cols = Math.ceil(w / cw);
    const rows = Math.ceil(h / ch);
    // Field origin sits slightly above true center.
    const cx = cols * 0.5;
    const cy = rows * 0.46;
    const calm = config.calmRadius;
    const mob = w < 560;
    const edgeR = cols * 0.46;
    const boost = whiteout
      ? Math.min(1, (performance.now() - fxStart) / WHITEOUT_MS)
      : 0;

    ctx!.fillStyle = '#04070d';
    ctx!.fillRect(0, 0, w, h);
    ctx!.font = `${(9.4 * scale).toFixed(1)}px "JetBrains Mono", ui-monospace, monospace`;
    ctx!.textBaseline = 'top';

    const pcol = ptr.x / cw;
    const prow = ptr.y / ch;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const dx = x - cx;
        // 1.6 corrects for the non-square cell.
        const dy = (y - cy) * 1.6;
        const r = Math.sqrt(dx * dx + dy * dy);
        const a = Math.atan2(dy, dx);

        // 9-armed rotating star
        let v = 0.5 + 0.5 * Math.sin(a * 9 + Math.sin(r * 0.07 - t * 0.8) * 1.7 + t * 0.3);
        v *= Math.exp(-r * 0.016); // falloff to edges
        v += 0.22 * Math.sin(x * 0.09 + t * 0.5) * Math.cos(y * 0.15 - t * 0.4); // slow cross-drift
        v += 0.1 * Math.sin(x * 0.31 + y * 0.27 + t * 0.9); // fine diagonal grain
        v += 0.16 * Math.exp(-r * 0.05); // soft core lift

        // pointer bloom
        const pdx = x - pcol;
        const pdy = (y - prow) * 1.6;
        v += 0.85 * Math.exp(-Math.sqrt(pdx * pdx + pdy * pdy) * 0.14);

        // Inverted energy: sparse at center, dense at edges — keeps the title legible.
        v *= 0.1 + 0.9 * Math.min(1, r / (cols * calm));
        v *= 0.9;
        if (boost > 0) v = v * (1 + boost * 1.6) + boost * 0.5;

        if (v <= 0.06) continue;
        v = Math.min(1, v);

        const g = RAMP[Math.min(RAMP.length - 1, Math.floor(v * RAMP.length))];
        if (g === ' ') continue;

        // On mobile, bright white glyphs are confined to the outer edges so
        // they don't clash with the white title.
        const hot = mob
          ? (v > 0.86 && r > edgeR) || boost > 0.45
          : v > 0.86 || boost > 0.45;
        if (mob && v > 0.86 && r <= edgeR) v = 0.8;

        ctx!.fillStyle = hot
          ? `rgba(232,244,255,${Math.min(1, 0.55 + v * 0.45).toFixed(2)})`
          : `rgba(${ar},${ag},${ab},${Math.min(1, 0.12 + v * 0.72).toFixed(2)})`;
        ctx!.fillText(g, x * cw, y * ch);
      }
    }
  }

  function loop(ts: number): void {
    raf = requestAnimationFrame(loop);
    if (ts - last < FRAME_MS) return;
    last = ts;
    t += TIME_STEP * config.speed;
    draw();
  }

  // Maps client coords into canvas space, accounting for any CSS scale.
  function onMove(e: MouseEvent): void {
    const r = container.getBoundingClientRect();
    ptr.x = (e.clientX - r.left) * (container.offsetWidth / r.width);
    ptr.y = (e.clientY - r.top) * (container.offsetHeight / r.height);
  }

  function onLeave(): void {
    ptr.x = -999;
    ptr.y = -999;
  }

  container.addEventListener('mousemove', onMove);
  container.addEventListener('mouseleave', onLeave);
  raf = requestAnimationFrame(loop);

  return {
    startWhiteout() {
      whiteout = true;
      fxStart = performance.now();
    },
    destroy() {
      cancelAnimationFrame(raf);
      container.removeEventListener('mousemove', onMove);
      container.removeEventListener('mouseleave', onLeave);
    },
  };
}
