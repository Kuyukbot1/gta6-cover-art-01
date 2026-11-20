// Fixed scenes for screenshots: ?shot=editor shows the page with sample
// photos loaded; ?shot=cover shows the cover alone at the requested post
// size. `layout`, `grade`, `photo`, `caption`, `subtitle` and `size` come from
// the query. window.__shotReady is set once the cover is painted.

/**
 * @param {URLSearchParams} query
 * @param {{ loadImage: (url: string) => Promise<HTMLImageElement>,
 *   applyShot: (patch: object) => void }} hooks
 */
export async function runShot(query, hooks) {
  const shot = query.get('shot');
  const photoName = query.get('photo') ?? 'pier';
  const otherName = photoName === 'pier' ? 'boulevard' : 'pier';
  const caption = query.get('caption') ?? 'Neon Sunset';
  const subtitle = query.get('subtitle') ?? 'VICE CITY · EST. 2026';
  if (shot === 'cover') document.body.classList.add('shot-cover');
  const first = await hooks.loadImage(`samples/${photoName}.jpg`);
  const second = await hooks.loadImage(`samples/${otherName}.jpg`);
  hooks.applyShot({
    photos: [first, second],
    assign: [0, 1, 0, 1, 0, 1, 0, 1],
    crops: Array.from({ length: 8 }, () => ({ zoom: 1, ox: 0, oy: 0 })),
    layout: query.get('layout') ?? 'hero',
    grade: query.get('grade') ?? 'neon',
    title: caption,
    subtitle,
    size: query.get('size') ?? '1080x1080',
    selected: 0,
  });
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
