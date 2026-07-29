/** Shared between the landing field and the work-card load-ins. */

/** 20 characters; index 0 is a space and is skipped. */
export const RAMP = " .`'-:;+=*co0O8$@B%#";

export interface CanvasSize {
  w: number;
  h: number;
}

/**
 * Syncs the backing store to the canvas' CSS box at up to 2x DPR, but only when
 * that box actually changed — resetting `width` clears the canvas, so doing it
 * every frame would blank the field. `size` is mutated in place.
 *
 * Returns false while the element still has no layout, which is the caller's
 * cue to skip the frame entirely.
 */
export function fitCanvas(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  size: CanvasSize,
): boolean {
  if (!canvas.getBoundingClientRect().width) return false;
  const w = canvas.offsetWidth;
  const h = canvas.offsetHeight;
  if (size.w !== w || size.h !== h) {
    size.w = w;
    size.h = h;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  return true;
}

export const prefersReducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
