// The five sunset grades. Each grade is a pair of colour ramps: a warm wash
// laid over a photo (soft-light) and a dusk tint rising from the bottom
// (overlay), plus the palette the title block is painted with. All values are
// fixed constants, so a grade renders identically on every run.

export const GRADES = {
  neon: {
    label: 'Neon Sunset',
    washTop: 'rgba(255, 94, 168, 0.30)', washBottom: 'rgba(255, 122, 24, 0.34)',
    duskTop: 'rgba(123, 47, 247, 0.00)', duskBottom: 'rgba(123, 47, 247, 0.42)',
    skyTop: '#2b1055', skyMid: '#ff2e88', skyBottom: '#ff7a18',
    sunCore: '#ffe259', sunEdge: '#ff7a18', titleFill: '#ffffff', titleStroke: '#1c0b2e',
  },
  vice: {
    label: 'Vice Nights',
    washTop: 'rgba(0, 229, 255, 0.26)', washBottom: 'rgba(255, 46, 136, 0.32)',
    duskTop: 'rgba(20, 10, 60, 0.00)', duskBottom: 'rgba(20, 10, 60, 0.45)',
    skyTop: '#0b1035', skyMid: '#c724b1', skyBottom: '#00e5ff',
    sunCore: '#a5f3ff', sunEdge: '#ff2e88', titleFill: '#ffffff', titleStroke: '#0b1035',
  },
  gold: {
    label: 'Golden Hour',
    washTop: 'rgba(255, 214, 90, 0.28)', washBottom: 'rgba(255, 122, 24, 0.36)',
    duskTop: 'rgba(120, 40, 0, 0.00)', duskBottom: 'rgba(120, 40, 0, 0.38)',
    skyTop: '#3d1e08', skyMid: '#ff9a3d', skyBottom: '#ffd65a',
    sunCore: '#fff3b0', sunEdge: '#ff9a3d', titleFill: '#fff8ec', titleStroke: '#3d1e08',
  },
  pink: {
    label: 'Hot Pink',
    washTop: 'rgba(255, 46, 136, 0.34)', washBottom: 'rgba(255, 94, 168, 0.30)',
    duskTop: 'rgba(90, 0, 60, 0.00)', duskBottom: 'rgba(90, 0, 60, 0.45)',
    skyTop: '#3d0a3d', skyMid: '#ff2e88', skyBottom: '#ff9ad5',
    sunCore: '#ffd6f2', sunEdge: '#ff2e88', titleFill: '#ffffff', titleStroke: '#3d0a3d',
  },
  noir: {
    label: 'Mono Noir',
    washTop: 'rgba(255, 255, 255, 0.10)', washBottom: 'rgba(0, 0, 0, 0.28)',
    duskTop: 'rgba(0, 0, 0, 0.00)', duskBottom: 'rgba(0, 0, 0, 0.55)',
    skyTop: '#101014', skyMid: '#5a5a68', skyBottom: '#e8e8f0',
    sunCore: '#f5f5f5', sunEdge: '#9a9aa8', titleFill: '#ffffff', titleStroke: '#101014',
  },
};

/** Applies a grade's wash + dusk tint over a photo already drawn in `rect`. */
export function gradePhoto(ctx, grade, rect) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  const wash = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
  wash.addColorStop(0, grade.washTop);
  wash.addColorStop(1, grade.washBottom);
  ctx.globalCompositeOperation = 'soft-light';
  ctx.fillStyle = wash;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  const dusk = ctx.createLinearGradient(rect.x, rect.y + rect.h * 0.35, rect.x, rect.y + rect.h);
  dusk.addColorStop(0, grade.duskTop);
  dusk.addColorStop(1, grade.duskBottom);
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = dusk;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.restore();
}
