/**
 * Bundles public/favicon-{16,32,48}.png into public/favicon.ico:
 *
 *   node scripts/favicon-ico.mjs
 *
 * The three PNGs are the design handoff's, so this only ever repackages them —
 * it doesn't resize, and the .ico is worth nothing if they drift. Re-run it if
 * they're replaced.
 *
 * An .ico is a 6-byte header, one 16-byte directory entry per image, then the
 * payloads. The payloads are stored as PNG rather than the old BMP form, which
 * every browser since IE11 reads and which keeps the file a tenth the size.
 * Only the .ico container is hand-rolled here; nothing re-encodes the images.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const PUBLIC = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
const SIZES = [16, 32, 48];

const images = await Promise.all(
  SIZES.map(async (size) => ({
    size,
    png: await readFile(join(PUBLIC, `favicon-${size}.png`)),
  })),
);

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // 1 = icon, 2 = cursor
header.writeUInt16LE(images.length, 4);

// Payloads start after the header and the whole directory, so the offsets can
// only be computed once every entry's size is known.
let offset = 6 + images.length * 16;
const entries = images.map(({ size, png }) => {
  const entry = Buffer.alloc(16);
  // 0 means 256 in this byte, which is why the format tops out there.
  entry.writeUInt8(size % 256, 0); // width
  entry.writeUInt8(size % 256, 1); // height
  entry.writeUInt8(0, 2); // palette size, 0 for truecolor
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // color planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(offset, 12);
  offset += png.length;
  return entry;
});

const out = join(PUBLIC, 'favicon.ico');
await writeFile(out, Buffer.concat([header, ...entries, ...images.map((i) => i.png)]));
console.log(`${out}: ${SIZES.join('/')} — ${offset} bytes`);
