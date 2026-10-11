const fs = require('fs');
const zlib = require('zlib');

function readPNG(filePath) {
  const buf = fs.readFileSync(filePath);
  let pos = 8;
  let width = 0, height = 0, colorType = 0;
  const idatChunks = [];

  while (pos < buf.length) {
    const length = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    if (type === 'IHDR') {
      width = buf.readUInt32BE(pos + 8);
      height = buf.readUInt32BE(pos + 12);
      colorType = buf[pos + 17];
    } else if (type === 'IDAT') {
      idatChunks.push(buf.subarray(pos + 8, pos + 8 + length));
    }
    pos += 12 + length;
  }

  const compressed = Buffer.concat(idatChunks);
  const decompressed = zlib.inflateSync(compressed);

  const bytesPerPixel = colorType === 6 ? 4 : 3;
  const stride = 1 + width * bytesPerPixel;
  const rgba = Buffer.alloc(width * height * 4);

  let prevRow = Buffer.alloc(width * bytesPerPixel);

  for (let y = 0; y < height; y++) {
    const rowStart = y * stride;
    const filter = decompressed[rowStart];
    const currentRow = Buffer.alloc(width * bytesPerPixel);

    for (let x = 0; x < width * bytesPerPixel; x++) {
      const raw = decompressed[rowStart + 1 + x];
      const a = x >= bytesPerPixel ? currentRow[x - bytesPerPixel] : 0;
      const b = prevRow[x];
      const c = x >= bytesPerPixel ? prevRow[x - bytesPerPixel] : 0;

      let val = 0;
      if (filter === 0) val = raw;
      else if (filter === 1) val = (raw + a) & 0xff;
      else if (filter === 2) val = (raw + b) & 0xff;
      else if (filter === 3) val = (raw + Math.floor((a + b) / 2)) & 0xff;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        let pr = c;
        if (pa <= pb && pa <= pc) pr = a;
        else if (pb <= pc) pr = b;
        val = (raw + pr) & 0xff;
      }
      currentRow[x] = val;
    }
    prevRow = currentRow;

    for (let x = 0; x < width; x++) {
      const dstIdx = (y * width + x) * 4;
      const srcIdx = x * bytesPerPixel;
      if (bytesPerPixel === 4) {
        rgba[dstIdx] = currentRow[srcIdx];
        rgba[dstIdx + 1] = currentRow[srcIdx + 1];
        rgba[dstIdx + 2] = currentRow[srcIdx + 2];
        rgba[dstIdx + 3] = currentRow[srcIdx + 3];
      } else {
        rgba[dstIdx] = currentRow[srcIdx];
        rgba[dstIdx + 1] = currentRow[srcIdx + 1];
        rgba[dstIdx + 2] = currentRow[srcIdx + 2];
        rgba[dstIdx + 3] = 255;
      }
    }
  }

  return { width, height, rgba };
}

function writePNG(filePath, width, height, rgba) {
  const stride = 1 + width * 4;
  const rawData = Buffer.alloc(height * stride);
  for (let y = 0; y < height; y++) {
    rawData[y * stride] = 0; // Filter None
    rgba.copy(rawData, y * stride + 1, y * width * 4, (y + 1) * width * 4);
  }
  const compressed = zlib.deflateSync(rawData);

  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bit
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  function makeChunk(type, data) {
    const chunk = Buffer.alloc(12 + data.length);
    chunk.writeUInt32BE(data.length, 0);
    chunk.write(type, 4, 4, 'ascii');
    data.copy(chunk, 8);
    // CRC
    let crc = -1;
    for (let i = 4; i < 8 + data.length; i++) {
      let byte = chunk[i];
      for (let j = 0; j < 8; j++) {
        if ((crc ^ byte) & 1) crc = (crc >>> 1) ^ 0xedb88320;
        else crc = crc >>> 1;
        byte >>>= 1;
      }
    }
    chunk.writeInt32BE(~crc, 8 + data.length);
    return chunk;
  }

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  fs.writeFileSync(filePath, Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]));
  console.log('Successfully wrote', filePath, width, 'x', height);
}

const src = 'C:/Users/hoang/.gemini/antigravity-ide/brain/5a8377f2-e654-493a-95d3-6758b32c063f/.user_uploaded/media_1791694859698.png';
const img = readPNG(src);
console.log('Decoded PNG:', img.width, img.height);

function crop(cx, cy, cw, ch, outPath, removeBg = true) {
  const outRgba = Buffer.alloc(cw * ch * 4);
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      const srcIdx = ((cy + y) * img.width + (cx + x)) * 4;
      const dstIdx = (y * cw + x) * 4;
      const r = img.rgba[srcIdx];
      const g = img.rgba[srcIdx + 1];
      const b = img.rgba[srcIdx + 2];
      const a = img.rgba[srcIdx + 3];

      // If removeBg is true, remove cream background #FFFEEB / #FDFCE9
      if (removeBg && r > 235 && g > 230 && b > 200 && Math.abs(r - g) < 25) {
        outRgba[dstIdx + 3] = 0;
      } else {
        outRgba[dstIdx] = r;
        outRgba[dstIdx + 1] = g;
        outRgba[dstIdx + 2] = b;
        outRgba[dstIdx + 3] = a;
      }
    }
  }
  writePNG(outPath, cw, ch, outRgba);
}

// 1. Two Hearts with Arrow
crop(65, 95, 290, 215, 'public/images/letter-hearts.png', true);

// 2. Sunflower Quby (chibi with flowers)
crop(530, 205, 125, 115, 'public/images/sticker-sunflower.png', true);

// 3. Dancing Bunny
crop(845, 205, 95, 115, 'public/images/sticker-bunny.png', true);
