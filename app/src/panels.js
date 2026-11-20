// The four cover layouts. Each returns the panels of the cover as fractions of
// the cover's width and height: { x, y, w, h, kind, tilt } where kind is
// "photo", "title" or "backdrop" (a full-bleed photo behind the other panels).
// The cover is drawn on a white sheet, so the gaps between panels read as
// white gutters, the poster's signature look.

/** Panel count of a layout, for sizing the per-panel crop state. */
export function panelCount(layout) {
  return { hero: 4, grid9: 8, tilt: 4, strip: 4 }[layout] ?? 4;
}

/** The title panel's index inside a layout's panel list (-1 when the title is a band). */
export function layoutPanels(layout, W, H) {
  const g = Math.max(6, Math.round(Math.min(W, H) * 0.014)); // white gutter
  if (layout === 'grid9') {
    const cw = (W - 4 * g) / 3;
    const ch = (H - 4 * g) / 3;
    const panels = [];
    let photo = 0;
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const x = g + col * (cw + g);
        const y = g + row * (ch + g);
        if (row === 1 && col === 1) {
          panels.push({ x, y, w: cw, h: ch, kind: 'title', tilt: 0 });
        } else {
          panels.push({ x, y, w: cw, h: ch, kind: 'photo', tilt: 0, photoIndex: photo++ });
        }
      }
    }
    return panels;
  }
  if (layout === 'tilt') {
    const bw = W * 0.30;
    const bh = H * 0.42;
    return [
      { x: 0, y: 0, w: W, h: H, kind: 'backdrop', tilt: 0, photoIndex: 0 },
      { x: W * 0.06, y: H * 0.10, w: bw, h: bh, kind: 'photo', tilt: -0.10, photoIndex: 1 },
      { x: W * 0.36, y: H * 0.07, w: bw, h: bh, kind: 'photo', tilt: 0.03, photoIndex: 2 },
      { x: W * 0.66, y: H * 0.11, w: bw, h: bh, kind: 'photo', tilt: 0.09, photoIndex: 3 },
      { x: 0, y: H * 0.72, w: W, h: H * 0.28, kind: 'title', tilt: 0 },
    ];
  }
  if (layout === 'strip') {
    const band = H * 0.17;
    const heroH = H * 0.53;
    const smallH = H - band - heroH - 3 * g;
    const sw = (W - 4 * g) / 3;
    return [
      { x: 0, y: 0, w: W, h: band, kind: 'title', tilt: 0 },
      { x: g, y: band + g, w: W - 2 * g, h: heroH, kind: 'photo', tilt: 0, photoIndex: 0 },
      { x: g, y: band + heroH + 2 * g, w: sw, h: smallH, kind: 'photo', tilt: 0, photoIndex: 1 },
      { x: 2 * g + sw, y: band + heroH + 2 * g, w: sw, h: smallH, kind: 'photo', tilt: 0, photoIndex: 2 },
      { x: 3 * g + 2 * sw, y: band + heroH + 2 * g, w: sw, h: smallH, kind: 'photo', tilt: 0, photoIndex: 3 },
    ];
  }
  // hero: one tall panel on the left, three stacked on the right.
  const leftW = W * 0.60 - 1.5 * g;
  const rightX = W * 0.60 + 0.5 * g;
  const rightW = W - rightX - g;
  const smallH = (H - 4 * g) / 3;
  return [
    { x: g, y: g, w: leftW, h: H - 2 * g, kind: 'photo', tilt: 0, photoIndex: 0 },
    { x: rightX, y: g, w: rightW, h: smallH, kind: 'photo', tilt: 0, photoIndex: 1 },
    { x: rightX, y: 2 * g + smallH, w: rightW, h: smallH, kind: 'photo', tilt: 0, photoIndex: 2 },
    { x: rightX, y: 3 * g + 2 * smallH, w: rightW, h: smallH, kind: 'photo', tilt: 0, photoIndex: 3 },
    { x: g, y: H - g - H * 0.16, w: leftW, h: H * 0.16, kind: 'title', tilt: 0 },
  ];
}
