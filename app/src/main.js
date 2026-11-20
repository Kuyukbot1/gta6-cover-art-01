// Wires the page: load photos, pick a layout and grade, edit the caption,
// drag panels to crop, export the cover as a PNG. A `?shot=` query sets up a
// fixed scene for a screenshot instead (./shots.js).
import { drawCover, createCoverCanvas } from './cover.js';
import { panelCount, layoutPanels } from './panels.js';
import { GRADES } from './grades.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const titleInput = document.getElementById('title');
const subtitleInput = document.getElementById('subtitle');
const status = document.getElementById('status');
const thumbs = document.getElementById('thumbs');
const zoomInput = document.getElementById('zoom');

export const SIZES = {
  '1080x1080': [1080, 1080],
  '1080x1350': [1080, 1350],
  '1920x1080': [1920, 1080],
};

/** The cover state: everything drawCover needs, nothing else. */
export function freshState() {
  return {
    layout: 'hero',
    grade: 'neon',
    title: 'NEON SUNSET',
    subtitle: 'VICE CITY · EST. 2026',
    decor: true,
    photos: [],
    // assign[panel] = index into photos: which photo fills each panel.
    assign: [0, 1, 2, 3, 4, 5, 6, 7],
    crops: Array.from({ length: 8 }, () => ({ zoom: 1, ox: 0, oy: 0 })),
    selected: 0,
    size: '1080x1080',
  };
}

export let state = freshState();

// --- Undo / redo: a stack of plain state snapshots (photos stay live). ---
const undoStack = [];
const redoStack = [];
function snapshot() {
  const { photos, ...rest } = state;
  return JSON.parse(JSON.stringify(rest));
}
function pushHistory() {
  undoStack.push(snapshot());
  if (undoStack.length > 40) undoStack.shift();
  redoStack.length = 0;
}
function restore(snap) {
  const photos = state.photos;
  state = { ...freshState(), ...snap, photos };
  syncControls();
  redraw();
}
function undo() {
  if (!undoStack.length) return;
  redoStack.push(snapshot());
  restore(undoStack.pop());
}
function redo() {
  if (!redoStack.length) return;
  undoStack.push(snapshot());
  restore(redoStack.pop());
}

// --- Rendering ---
export function redraw() {
  const [w, h] = SIZES[state.size];
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  drawCover(canvas, state);
  renderThumbs();
}

function renderThumbs() {
  thumbs.innerHTML = '';
  state.photos.forEach((img, i) => {
    const t = document.createElement('img');
    t.src = img.src;
    t.alt = `Photo ${i + 1}`;
    t.title = `Photo ${i + 1} — click to put it in the selected panel`;
    if (state.assign.includes(i)) t.classList.add('assigned');
    t.addEventListener('click', () => {
      pushHistory();
      state.assign[state.selected] = i;
      redraw();
    });
    thumbs.appendChild(t);
  });
}

function syncControls() {
  titleInput.value = state.title;
  subtitleInput.value = state.subtitle;
  document.getElementById('decor').checked = state.decor;
  zoomInput.value = String(state.crops[state.selected]?.zoom ?? 1);
  document.querySelectorAll('#layouts .chip').forEach((b) =>
    b.classList.toggle('active', b.dataset.layout === state.layout));
  document.querySelectorAll('#grades .chip').forEach((b) =>
    b.classList.toggle('active', b.dataset.grade === state.grade));
  document.querySelectorAll('#sizes .chip').forEach((b) =>
    b.classList.toggle('active', b.dataset.size === state.size));
}

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

async function addPhotoFiles(files) {
  for (const file of files) {
    if (state.photos.length >= 8) break;
    const img = await loadImage(URL.createObjectURL(file));
    state.photos.push(img);
  }
  // Fill every panel with the photos in order, cycling.
  const count = panelCount(state.layout);
  for (let p = 0; p < count; p++) state.assign[p] = p % state.photos.length;
  pushHistory();
  redraw();
}

// --- Controls ---
document.getElementById('photos').addEventListener('change', (e) => {
  if (e.target.files.length) addPhotoFiles([...e.target.files]);
});
document.getElementById('samples').addEventListener('click', async () => {
  const loaded = [];
  for (const name of ['boulevard', 'pier']) {
    try { loaded.push(await loadImage(`samples/${name}.jpg`)); } catch { /* sample missing */ }
  }
  if (!loaded.length) return;
  pushHistory();
  state.photos = loaded;
  const count = panelCount(state.layout);
  for (let p = 0; p < count; p++) state.assign[p] = p % loaded.length;
  state.crops = Array.from({ length: 8 }, () => ({ zoom: 1, ox: 0, oy: 0 }));
  redraw();
});
document.getElementById('fillAll').addEventListener('click', () => {
  if (!state.photos.length) return;
  pushHistory();
  for (let p = 0; p < panelCount(state.layout); p++) state.assign[p] = 0;
  redraw();
});
document.querySelectorAll('#layouts .chip').forEach((b) => {
  b.addEventListener('click', () => {
    pushHistory();
    state.layout = b.dataset.layout;
    state.selected = 0;
    syncControls();
    redraw();
  });
});
document.querySelectorAll('#grades .chip').forEach((b) => {
  b.addEventListener('click', () => {
    pushHistory();
    state.grade = b.dataset.grade;
    syncControls();
    redraw();
  });
});
document.querySelectorAll('#sizes .chip').forEach((b) => {
  b.addEventListener('click', () => {
    state.size = b.dataset.size;
    syncControls();
    redraw();
  });
});
document.getElementById('decor').addEventListener('change', (e) => {
  pushHistory();
  state.decor = e.target.checked;
  redraw();
});
titleInput.addEventListener('input', () => { state.title = titleInput.value; redraw(); });
subtitleInput.addEventListener('input', () => { state.subtitle = subtitleInput.value; redraw(); });
titleInput.addEventListener('change', pushHistory);
subtitleInput.addEventListener('change', pushHistory);
zoomInput.addEventListener('input', () => {
  const crop = state.crops[state.selected];
  crop.zoom = Number(zoomInput.value);
  redraw();
});
zoomInput.addEventListener('change', pushHistory);
document.getElementById('undo').addEventListener('click', undo);
document.getElementById('redo').addEventListener('click', redo);

// --- Drag a panel to pan its photo; click a panel to select it. ---
let drag = null;
function panelAt(clientX, clientY) {
  const r = canvas.getBoundingClientRect();
  const x = (clientX - r.left) * (canvas.width / r.width);
  const y = (clientY - r.top) * (canvas.height / r.height);
  const panels = layoutPanels(state.layout, canvas.width, canvas.height)
    .filter((p) => p.kind === 'photo' || p.kind === 'backdrop');
  for (let i = panels.length - 1; i >= 0; i--) {
    const p = panels[i];
    if (x >= p.x && x <= p.x + p.w && y >= p.y && y <= p.y + p.h) return p.photoIndex;
  }
  return null;
}
canvas.addEventListener('pointerdown', (e) => {
  const idx = panelAt(e.clientX, e.clientY);
  if (idx === null) return;
  state.selected = idx;
  zoomInput.value = String(state.crops[idx]?.zoom ?? 1);
  const img = state.photos[state.assign[idx] ?? idx];
  drag = { idx, lastX: e.clientX, lastY: e.clientY, moved: false, img };
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag || !drag.img) return;
  const r = canvas.getBoundingClientRect();
  const scaleX = canvas.width / r.width;
  const scaleY = canvas.height / r.height;
  const dx = (e.clientX - drag.lastX) * scaleX;
  const dy = (e.clientY - drag.lastY) * scaleY;
  if (Math.abs(dx) + Math.abs(dy) > 0) drag.moved = true;
  const crop = state.crops[drag.idx];
  const panels = layoutPanels(state.layout, canvas.width, canvas.height);
  const panel = panels.find((p) => p.photoIndex === drag.idx && p.kind !== 'title') ?? panels[drag.idx];
  const imgScale = Math.max(panel.w / drag.img.naturalWidth, panel.h / drag.img.naturalHeight) * crop.zoom;
  const maxX = Math.max(1, (drag.img.naturalWidth * imgScale - panel.w) / 2);
  const maxY = Math.max(1, (drag.img.naturalHeight * imgScale - panel.h) / 2);
  crop.ox = Math.max(-1, Math.min(1, crop.ox + dx / maxX));
  crop.oy = Math.max(-1, Math.min(1, crop.oy + dy / maxY));
  drag.lastX = e.clientX;
  drag.lastY = e.clientY;
  redraw();
});
canvas.addEventListener('pointerup', () => {
  if (drag?.moved) pushHistory();
  drag = null;
});

// --- Export ---
function downloadPNG(canvasEl, name) {
  return new Promise((resolve) => {
    canvasEl.toBlob((blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      resolve(blob);
    }, 'image/png');
  });
}
async function exportSize(key) {
  const [w, h] = SIZES[key];
  const out = createCoverCanvas(w, h, state);
  const blob = await downloadPNG(out, `cover-${w}x${h}.png`);
  status.textContent = `Saved cover-${w}x${h}.png (${Math.round(blob.size / 1024)} KiB PNG)`;
  return blob;
}
document.getElementById('export').addEventListener('click', () => exportSize(state.size));
document.getElementById('exportAll').addEventListener('click', async () => {
  for (const key of Object.keys(SIZES)) await exportSize(key);
  status.textContent = 'Saved all 3 sizes: 1080x1080, 1080x1350, 1920x1080.';
});

// --- Boot: a fixed screenshot scene, or the live editor. ---
const query = new URLSearchParams(location.search);
if (query.get('shot')) {
  runShot(query, {
    loadImage,
    applyShot: (patch) => {
      pushHistory();
      Object.assign(state, patch);
      syncControls();
      redraw();
    },
    redraw,
    state: () => state,
    setState: (next) => { state = next; },
  });
} else {
  redraw();
}
