const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

// Genera build/icon.png (256x256) y build/icon.ico (multi-tamaño) sin dependencias externas
const buildDir = path.resolve(__dirname, "..", "build");
fs.mkdirSync(buildDir, { recursive: true });

// Tabla CRC32 para chunks PNG
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c >>> 0;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function encodePNG(width, height, rgba) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filter None
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });

  return Buffer.concat([
    signature,
    makeChunk("IHDR", ihdr),
    makeChunk("IDAT", idat),
    makeChunk("IEND", Buffer.alloc(0))
  ]);
}

function roundedRectMask(x, y, rx, ry, rw, rh, radius) {
  const cx = Math.max(rx + radius, Math.min(x, rx + rw - radius));
  const cy = Math.max(ry + radius, Math.min(y, ry + rh - radius));
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  return Math.max(0, Math.min(1, radius + 0.5 - dist));
}

function blendPixel(buf, idx, r, g, b, a) {
  if (a <= 0) return;
  const sa = Math.min(1, a);
  const da = buf[idx + 3] / 255;
  const outA = sa + da * (1 - sa);
  if (outA <= 0) return;
  buf[idx] = Math.round((r * sa + buf[idx] * da * (1 - sa)) / outA);
  buf[idx + 1] = Math.round((g * sa + buf[idx + 1] * da * (1 - sa)) / outA);
  buf[idx + 2] = Math.round((b * sa + buf[idx + 2] * da * (1 - sa)) / outA);
  buf[idx + 3] = Math.round(outA * 255);
}

function renderIconRGBA(size) {
  const rgba = Buffer.alloc(size * size * 4);
  const s = size / 256;

  // Coordenadas en espacio 256x256
  const pad = 12 * s;
  const bgSize = size - pad * 2;
  const bgRadius = 52 * s;

  // Calendario interno
  const calX = 46 * s;
  const calY = 56 * s;
  const calW = 164 * s;
  const calH = 152 * s;
  const calR = 22 * s;
  const headerH = 42 * s;

  // Bloques horarios dentro de la grilla (3 columnas x 2 filas aprox)
  const blocks = [
    { x: 62 * s, y: 112 * s, w: 40 * s, h: 36 * s, color: [59, 130, 246] },   // Azul
    { x: 108 * s, y: 112 * s, w: 40 * s, h: 68 * s, color: [16, 185, 129] },  // Verde (aprobada/cursando)
    { x: 154 * s, y: 112 * s, w: 40 * s, h: 30 * s, color: [99, 102, 241] },  // Índigo
    { x: 62 * s, y: 154 * s, w: 40 * s, h: 38 * s, color: [245, 158, 11] },   // Ámbar
    { x: 154 * s, y: 148 * s, w: 40 * s, h: 44 * s, color: [14, 165, 233] }   // Celeste
  ];

  // Anillos superiores del calendario
  const rings = [
    { x: 86 * s, y: 40 * s, w: 18 * s, h: 32 * s },
    { x: 152 * s, y: 40 * s, w: 18 * s, h: 32 * s }
  ];

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const t = (x + y) / (size * 2);

      // Fondo degradado azul marino -> índigo vibrante
      const bgAlpha = roundedRectMask(x + 0.5, y + 0.5, pad, pad, bgSize, bgSize, bgRadius);
      if (bgAlpha > 0) {
        const r = Math.round(30 + t * 38);
        const g = Math.round(41 + t * 52);
        const b = Math.round(120 + t * 115);
        blendPixel(rgba, idx, r, g, b, bgAlpha);
      }

      // Cuerpo blanco del calendario
      const calAlpha = roundedRectMask(x + 0.5, y + 0.5, calX, calY, calW, calH, calR);
      if (calAlpha > 0) {
        if (y + 0.5 < calY + headerH) {
          // Cabecera azul celeste
          blendPixel(rgba, idx, 56, 189, 248, calAlpha);
        } else {
          // Cuerpo blanco limpio
          blendPixel(rgba, idx, 248, 250, 252, calAlpha);
        }
      }

      // Anillos superiores
      for (const ring of rings) {
        const ra = roundedRectMask(x + 0.5, y + 0.5, ring.x, ring.y, ring.w, ring.h, 8 * s);
        if (ra > 0) {
          blendPixel(rgba, idx, 224, 242, 254, ra);
        }
      }

      // Bloques horarios de colores
      for (const blk of blocks) {
        const ba = roundedRectMask(x + 0.5, y + 0.5, blk.x, blk.y, blk.w, blk.h, 7 * s);
        if (ba > 0) {
          blendPixel(rgba, idx, blk.color[0], blk.color[1], blk.color[2], ba);
        }
      }
    }
  }

  return rgba;
}

function buildICO(pngEntries) {
  // Header ICO (6 bytes) + N entradas de directorio (16 bytes c/u) + datos PNG
  const count = pngEntries.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);     // reserved
  header.writeUInt16LE(1, 2);     // type: ICO
  header.writeUInt16LE(count, 4); // count

  let offset = 6 + count * 16;
  const dirEntries = [];
  const dataChunks = [];

  for (const { size, png } of pngEntries) {
    const entry = Buffer.alloc(16);
    entry[0] = size >= 256 ? 0 : size;
    entry[1] = size >= 256 ? 0 : size;
    entry[2] = 0; // color palette
    entry[3] = 0; // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    dirEntries.push(entry);
    dataChunks.push(png);
    offset += png.length;
  }

  return Buffer.concat([header, ...dirEntries, ...dataChunks]);
}

const sizes = [16, 32, 48, 64, 128, 256];
const entries = sizes.map(size => ({
  size,
  png: encodePNG(size, size, renderIconRGBA(size))
}));

const png256 = entries.find(e => e.size === 256).png;
fs.writeFileSync(path.join(buildDir, "icon.png"), png256);
fs.writeFileSync(path.join(buildDir, "icon.ico"), buildICO(entries));

console.log("Íconos generados correctamente en build/icon.png y build/icon.ico.");
