/**
 * Rasterizes a card. Defaults to public/og-image.png from og-image.html at the
 * 1200x630 OG spec; pass a source, a destination and a size to build another:
 *
 *   npm i --no-save puppeteer-core
 *   node scripts/og-image.mjs
 *   node scripts/og-image.mjs scripts/og-paper-trader.html public/og-paper-trader.png
 *   node scripts/og-image.mjs 'scripts/og-paper-trader.html?tall' src/assets/work/paper-trader-card.png 1200x750
 *
 * The source may carry a query string, which reaches the page as
 * `location.search` — that's how one card file yields more than one crop.
 * Quote it, or the shell eats the `?`.
 *
 * `sharp` already ships with Astro's image pipeline; `puppeteer-core` does not,
 * hence the --no-save install. It drives the Chrome already on this machine
 * rather than downloading its own, so CHROME below is the only macOS-ism.
 *
 * Renders at 2x and downsamples so the type gets real antialiasing instead of
 * 1x hinting.
 */
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import puppeteer from 'puppeteer-core';
import sharp from 'sharp';

const HERE = dirname(fileURLToPath(import.meta.url));
// Split before resolving: a query string is part of the URL, not of the path,
// and resolve() would fold it into the filename.
const [rawSource, query] = (process.argv[2] ?? join(HERE, 'og-image.html')).split('?');
// Resolved, because a relative argv path would turn into an unreachable
// file:// URL below.
const htmlPath = resolve(rawSource);
const pageUrl = `file://${htmlPath}${query ? `?${query}` : ''}`;
const outPath = resolve(process.argv[3] ?? join(HERE, '..', 'public', 'og-image.png'));

const size = process.argv[4] ?? '1200x630';
const [width, height] = size.split('x').map(Number);
if (!width || !height) {
  console.error(`bad size "${size}" — expected WIDTHxHEIGHT, e.g. 1200x630`);
  process.exit(1);
}

const CHROME =
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--hide-scrollbars', '--force-color-profile=srgb'],
});
const page = await browser.newPage();
await page.setViewport({ width, height, deviceScaleFactor: 2 });
await page.goto(pageUrl, { waitUntil: 'networkidle0' });

// Google Fonts must be in before the screenshot or the card renders in fallback
// faces and the whole point of regenerating it is lost. Each card names the
// faces it can't ship without in <meta name="og-font-check">; a card that names
// none has no safety net, so treat that as a mistake rather than a pass.
await page.evaluate(() => document.fonts.ready);
const fontChecks = await page.$$eval('meta[name="og-font-check"]', (tags) =>
  tags.map((tag) => tag.content),
);
const missing = await page.evaluate(
  (checks) => checks.filter((check) => !document.fonts.check(check)),
  fontChecks,
);
if (!fontChecks.length || missing.length) {
  console.error(
    fontChecks.length
      ? `did not load: ${missing.join(', ')} — aborting rather than shipping fallback type`
      : `${htmlPath} declares no <meta name="og-font-check"> — add one per webfont it needs`,
  );
  await browser.close();
  process.exit(1);
}

const big = await page.screenshot({ type: 'png' });
await browser.close();

await sharp(big)
  .resize(width, height, { fit: 'fill' })
  .png({ compressionLevel: 9, palette: false })
  .toFile(outPath);

const meta = await sharp(outPath).metadata();
console.log(`${outPath}: ${meta.width}x${meta.height}`);
