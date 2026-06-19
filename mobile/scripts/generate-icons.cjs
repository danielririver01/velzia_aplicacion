const fs = require('fs');
const path = require('path');
const pngjs = require('pngjs');

const SIZES = {
  'icon.png': 1024,
  'adaptive-icon.png': 1024,
  'favicon.png': 48,
  'splash-icon.png': 1284,
};

function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.sqrt((px - (x1 + t * dx)) ** 2 + (py - (y1 + t * dy)) ** 2);
}

function gradientColor(t) {
  const r1 = 0.949, g1 = 0.275, b1 = 0.051;
  const r2 = 0.976, g2 = 0.451, b2 = 0.086;
  const tr = Math.min(1, Math.max(0, t));
  return {
    r: Math.round((r1 + (r2 - r1) * tr) * 255),
    g: Math.round((g1 + (g2 - g1) * tr) * 255),
    b: Math.round((b1 + (b2 - b1) * tr) * 255),
  };
}

function createIcon(size, type = 'icon') {
  const png = new pngjs.PNG({ width: size, height: size });

  const m = 0.15;
  const cx = size / 2;
  const s = size * (1 - 2 * m);

  const vSpread = 0.32;
  const vTop = 0.20;
  const vBottom = 0.80;
  const vThickness = 0.09;

  const leftTip  = { x: cx - s * vSpread, y: size * (m + vTop) };
  const rightTip = { x: cx + s * vSpread, y: size * (m + vTop) };
  const bottom   = { x: cx,               y: size * (m + vBottom) };

  const segments = [
    [leftTip, bottom],
    [rightTip, bottom],
  ];

  const thicknessHalf = s * vThickness * 0.5;
  const transition = 1.5;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let minDist = Infinity;
      let gradientPos = 0;
      for (const seg of segments) {
        const d = distToSegment(x, y, seg[0].x, seg[0].y, seg[1].x, seg[1].y);
        if (d < minDist) {
          minDist = d;
          const segLen = Math.sqrt(
            (seg[1].x - seg[0].x) ** 2 + (seg[1].y - seg[0].y) ** 2
          );
          const projection =
            ((x - seg[0].x) * (seg[1].x - seg[0].x) +
             (y - seg[0].y) * (seg[1].y - seg[0].y)) / segLen;
          gradientPos = Math.min(1, Math.max(0, projection / segLen));
        }
      }

      // Smooth edge: alpha based on distance from exact edge
      const edgeDist = Math.abs(minDist - thicknessHalf);
      let alpha = 0;
      if (minDist < thicknessHalf - transition) {
        alpha = 255;
      } else if (minDist < thicknessHalf + transition) {
        alpha = Math.round(255 * (1 - (edgeDist / (transition * 2))));
      }

      const idx = (y * size + x) * 4;

      if (alpha > 0) {
        const c = gradientColor(gradientPos);
        png.data[idx] = c.r;
        png.data[idx + 1] = c.g;
        png.data[idx + 2] = c.b;
        png.data[idx + 3] = alpha;
      } else if (type === 'splash') {
        png.data[idx] = 10;
        png.data[idx + 1] = 10;
        png.data[idx + 2] = 10;
        png.data[idx + 3] = 255;
      } else {
        png.data[idx] = 0;
        png.data[idx + 1] = 0;
        png.data[idx + 2] = 0;
        png.data[idx + 3] = 0;
      }
    }
  }

  return pngjs.PNG.sync.write(png);
}

const assetsDir = path.join(__dirname, '..', 'assets');

console.log('Generating icons...');
for (const [filename, size] of Object.entries(SIZES)) {
  const type = filename.replace('.png', '');
  const buffer = createIcon(size, type);
  fs.writeFileSync(path.join(assetsDir, filename), buffer);
  console.log(`  ✓ ${filename} (${size}x${size})`);
}
console.log('Done!');
