// The cover engine: draws the whole poster — white-guttered photo panels,
// a sunset grade on every photo, a code-drawn title block (sky, sun, skyline,
// palms, halftone), grain and vignette — onto any canvas at any size.
// Pure canvas 2D, no network, and deterministic: the only randomness is a
// fixed-seed grain tile, so the same state always draws the same cover.

import { layoutPanels } from './panels.js';
import { GRADES, gradePhoto } from './grades.js';
import { drawSun, drawSkyline, drawPalm, drawHalftone, drawGrain, drawVignette } from './decor.js';

/** Draws one photo cover-fit inside `rect`, honouring the panel's crop. */
export function drawPhotoInRect(ctx, img, rect, crop) {
  const zoom = crop?.zoom ?? 1;
  const ox = crop?.ox ?? 0;
  const oy = crop?.oy ?? 0;
  const scale = Math.max(rect.w / img.naturalWidth, rect.h / img.naturalHeight) * zoom;
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  const maxShiftX = Math.max(0, (dw - rect.w) / 2);
  const maxShiftY = Math.max(0, (dh - rect.h) / 2);
  const dx = rect.x + (rect.w - dw) / 2 + ox * maxShiftX;
  const dy = rect.y + (rect.h - dh) / 2 + oy * maxShiftY;
  ctx.drawImage(img, dx, dy, dw, dh);
}

/** A sunset-gradient placeholder for a panel with no photo yet. */
export function drawEmptyPanel(ctx, rect, grade, seed) {
  const sky = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
  sky.addColorStop(0, grade.skyTop);
  sky.addColorStop(0.55, grade.skyMid);
  sky.addColorStop(1, grade.skyBottom);
  ctx.fillStyle = sky;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  drawSun(ctx, rect.x + rect.w / 2, rect.y + rect.h * 0.42, Math.min(rect.w, rect.h) * 0.26,
    grade.sunCore, grade.sunEdge, grade.skyMid);
  drawSkyline(ctx, { x: rect.x, y: rect.y + rect.h * 0.62, w: rect.w, h: rect.h * 0.38 },
    seed, 'rgba(16, 6, 32, 0.92)', '#ffd65a');
}

/** Shrinks `text` until it fits `maxWidth`, returning the font size used. */
export function fitTitleFont(ctx, text, maxWidth, startSize) {
  let size = startSize;
  ctx.font = `900 ${size}px "Arial Black", "Liberation Sans", "DejaVu Sans", sans-serif`;
  while (size > 14 && ctx.measureText(text).width > maxWidth) {
    size = Math.max(14, size - 2);
    ctx.font = `900 ${size}px "Arial Black", "Liberation Sans", "DejaVu Sans", sans-serif`;
  }
  return size;
}

/** The title block: gradient sky, slatted sun, skyline, palms, big caption. */
export function drawTitleBlock(ctx, rect, state, grade) {
  const { title, subtitle, decor } = state;
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  const sky = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
  sky.addColorStop(0, grade.skyTop);
  sky.addColorStop(0.55, grade.skyMid);
  sky.addColorStop(1, grade.skyBottom);
  ctx.fillStyle = sky;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  if (decor) {
    drawHalftone(ctx, { x: rect.x, y: rect.y, w: rect.w, h: rect.h * 0.30 }, 'rgba(255,255,255,0.20)', 7);
    drawSun(ctx, rect.x + rect.w * 0.82, rect.y + rect.h * 0.52, Math.min(rect.w, rect.h) * 0.30,
      grade.sunCore, grade.sunEdge, grade.skyMid);
    drawSkyline(ctx, { x: rect.x, y: rect.y + rect.h * 0.60, w: rect.w, h: rect.h * 0.40 },
      21, 'rgba(16, 6, 32, 0.95)', '#ffd65a');
    drawPalm(ctx, rect.x + rect.w * 0.06, rect.y + rect.h * 0.98, rect.h * 0.55, 'rgba(12, 4, 24, 0.95)');
    drawPalm(ctx, rect.x + rect.w * 0.94, rect.y + rect.h * 0.98, rect.h * 0.45, 'rgba(12, 4, 24, 0.95)');
  }
  const text = (title || 'UNTITLED').trim().toUpperCase();
  const pad = rect.w * 0.04;
  const size = fitTitleFont(ctx, text, rect.w - pad * 2, Math.min(rect.h * 0.52, rect.w * 0.16));
  const cx = rect.x + rect.w / 2;
  const baseline = rect.y + rect.h * 0.62;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const fill = ctx.createLinearGradient(0, baseline - size, 0, baseline + size * 0.12);
  fill.addColorStop(0, grade.titleFill);
  fill.addColorStop(1, grade.sunCore);
  ctx.lineJoin = 'round';
  ctx.strokeStyle = grade.titleStroke;
  ctx.lineWidth = Math.max(2, size * 0.09);
  ctx.strokeText(text, cx, baseline);
  ctx.fillStyle = fill;
  ctx.fillText(text, cx, baseline);
  const sub = (subtitle || '').trim().toUpperCase();
  if (sub) {
    const subSize = Math.max(11, Math.min(size * 0.22, rect.h * 0.13));
    ctx.font = `700 ${subSize}px "Liberation Sans", "DejaVu Sans", sans-serif`;
    try { ctx.letterSpacing = `${Math.max(2, subSize * 0.28)}px`; } catch { /* older canvas: no letter spacing */ }
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.fillText(sub, cx, baseline + subSize * 1.9);
    try { ctx.letterSpacing = '0px'; } catch { /* reset */ }
  }
  ctx.restore();
}

/** Draws the full cover for `state` onto `canvas` at its own pixel size. */
export function drawCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const grade = GRADES[state.grade] ?? GRADES.neon;
  ctx.fillStyle = '#ffffff'; // the white gutters
  ctx.fillRect(0, 0, W, H);
  const panels = layoutPanels(state.layout, W, H);
  const photos = state.photos ?? [];
  const crops = state.crops ?? [];
  const assign = state.assign ?? [];
  for (const panel of panels) {
    if (panel.kind === 'title') continue; // titles paint last, over the photos
    const img = photos[assign[panel.photoIndex] ?? panel.photoIndex];
    const crop = crops[panel.photoIndex];
    ctx.save();
    if (panel.tilt) {
      ctx.translate(panel.x + panel.w / 2, panel.y + panel.h / 2);
      ctx.rotate(panel.tilt);
      ctx.translate(-panel.w / 2, -panel.h / 2);
      ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
      ctx.shadowBlur = Math.min(W, H) * 0.02;
      ctx.shadowOffsetY = Math.min(W, H) * 0.008;
    }
    const inner = panel.tilt
      ? { x: 0, y: 0, w: panel.w, h: panel.h }
      : { x: panel.x, y: panel.y, w: panel.w, h: panel.h };
    // White polaroid-style frame around tilted snapshots.
    if (panel.tilt) {
      ctx.fillStyle = '#ffffff';
      const frame = Math.min(W, H) * 0.012;
      ctx.fillRect(-frame, -frame, panel.w + frame * 2, panel.h + frame * 2);
    }
    ctx.beginPath();
    ctx.rect(inner.x, inner.y, inner.w, inner.h);
    ctx.clip();
    if (img) {
      drawPhotoInRect(ctx, img, inner, crop);
      gradePhoto(ctx, grade, inner);
    } else {
      drawEmptyPanel(ctx, inner, grade, 100 + panel.photoIndex * 17);
    }
    ctx.restore();
  }
  for (const panel of panels) {
    if (panel.kind === 'title') drawTitleBlock(ctx, panel, state, grade);
  }
  drawGrain(ctx, W, H, 20261119);
  drawVignette(ctx, W, H);
}

/** Renders the cover for `state` onto a fresh canvas of `width` x `height`. */
export function createCoverCanvas(width, height, state) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  drawCover(canvas, state);
  return canvas;
}
