// Code-drawn poster art: a slatted synthwave sun, a city skyline, palm trees,
// halftone dots, film grain and a vignette. Everything is drawn from fixed
// seeds, so the same cover renders byte-identical on every run.

/** Deterministic PRNG (mulberry32) — the only randomness in the app. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A synthwave sun: a gradient disc with horizontal slats cut out low down. */
export function drawSun(ctx, cx, cy, r, core, edge, bg) {
  ctx.save();
  const grad = ctx.createLinearGradient(cx, cy - r, cx, cy + r);
  grad.addColorStop(0, core);
  grad.addColorStop(1, edge);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  // Slats: background-coloured bars, thicker toward the bottom of the disc.
  ctx.fillStyle = bg;
  let y = cy + r * 0.05;
  let thick = r * 0.03;
  while (y < cy + r) {
    ctx.fillRect(cx - r - 1, y, r * 2 + 2, thick);
    y += thick + r * 0.13;
    thick *= 1.55;
  }
  ctx.restore();
}

/** A deterministic skyline silhouette with lit windows, along the bottom of `rect`. */
export function drawSkyline(ctx, rect, seed, color, windowColor) {
  const rnd = mulberry32(seed);
  const base = rect.y + rect.h;
  ctx.save();
  ctx.fillStyle = color;
  let x = rect.x;
  while (x < rect.x + rect.w) {
    const bw = rect.w * (0.05 + rnd() * 0.09);
    const bh = rect.h * (0.25 + rnd() * 0.65);
    const top = base - bh;
    ctx.fillRect(x, top, bw, bh);
    // A rooftop antenna on some towers.
    if (rnd() > 0.6) ctx.fillRect(x + bw / 2 - 1, top - rect.h * 0.12, 2, rect.h * 0.12);
    // Lit windows.
    ctx.fillStyle = windowColor;
    const cols = Math.max(1, Math.floor(bw / (rect.w * 0.02)));
    const rows = Math.max(1, Math.floor(bh / (rect.h * 0.09)));
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        if (rnd() > 0.55) {
          ctx.fillRect(x + 3 + c * (bw - 6) / cols, top + 5 + r * (bh - 8) / rows, 2.5, 3.5);
        }
      }
    }
    ctx.fillStyle = color;
    x += bw + rect.w * 0.012;
  }
  ctx.restore();
}

/** A palm tree: a curved trunk and seven arcing fronds. */
export function drawPalm(ctx, x, y, s, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineCap = 'round';
  // Trunk, leaning slightly.
  ctx.lineWidth = s * 0.09;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + s * 0.12, y - s * 0.55, x + s * 0.28, y - s * 0.95);
  ctx.stroke();
  const topX = x + s * 0.28;
  const topY = y - s * 0.95;
  // Fronds.
  ctx.lineWidth = s * 0.05;
  for (let i = 0; i < 7; i++) {
    const ang = Math.PI * (0.08 + i * 0.14);
    const len = s * (0.42 + (i % 3) * 0.06);
    const ex = topX + Math.cos(ang) * len;
    const ey = topY - Math.sin(ang) * len * 0.55 + len * 0.18;
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.quadraticCurveTo(topX + Math.cos(ang) * len * 0.5, topY - Math.sin(ang) * len * 0.7, ex, ey);
    ctx.stroke();
  }
  // Coconuts.
  ctx.beginPath(); ctx.arc(topX - s * 0.03, topY + s * 0.04, s * 0.045, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(topX + s * 0.05, topY + s * 0.05, s * 0.04, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

/** Halftone dots fading down across `rect`. */
export function drawHalftone(ctx, rect, color, seed) {
  const rnd = mulberry32(seed);
  ctx.save();
  ctx.fillStyle = color;
  const step = Math.max(10, rect.w / 46);
  for (let y = rect.y + step / 2; y < rect.y + rect.h; y += step) {
    const fade = 1 - (y - rect.y) / rect.h;
    for (let x = rect.x + step / 2; x < rect.x + rect.w; x += step) {
      const r = step * 0.28 * fade * (0.7 + rnd() * 0.6);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

let grainTile = null;
/** Film grain from one seeded 128px tile, pattern-filled at low alpha. */
export function drawGrain(ctx, W, H, seed) {
  if (!grainTile) {
    grainTile = document.createElement('canvas');
    grainTile.width = 128;
    grainTile.height = 128;
    const g = grainTile.getContext('2d');
    const img = g.createImageData(128, 128);
    const rnd = mulberry32(seed);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.floor(rnd() * 255);
      img.data[i] = v; img.data[i + 1] = v; img.data[i + 2] = v; img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
  }
  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = ctx.createPattern(grainTile, 'repeat');
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

/** A soft dark vignette around the cover's edges. */
export function drawVignette(ctx, W, H) {
  ctx.save();
  const grad = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.42, W / 2, H / 2, Math.max(W, H) * 0.75);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
  grad.addColorStop(1, 'rgba(10, 4, 20, 0.28)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}
