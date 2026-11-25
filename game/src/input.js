// Copper Ladle Kitchen — pointer + keyboard input, hit-test helpers.
// The canvas is scaled to fit the window; all coordinates are converted
// back to the logical 1280x720 space before hit-testing.

import { W, H } from './config.js';

export const pointer = {
  x: -100, y: -100,   // logical coords
  down: false,
  clicked: null,      // {x, y} of the most recent click, consumed by main
};

const keyHandlers = new Set();
const keyState = {};

export function pointInRect(x, y, r) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

export function pointInCircle(x, y, cx, cy, r) {
  const dx = x - cx, dy = y - cy;
  return dx * dx + dy * dy <= r * r;
}

export function onKey(fn) { keyHandlers.add(fn); }

export function isKeyDown(code) { return !!keyState[code]; }

export function bindInput(canvas, ensureAudio) {
  function toLogical(e) {
    const rect = canvas.getBoundingClientRect();
    const sx = W / rect.width;
    const sy = H / rect.height;
    return { x: (e.clientX - rect.left) * sx, y: (e.clientY - rect.top) * sy };
  }

  canvas.addEventListener('pointermove', (e) => {
    const p = toLogical(e);
    pointer.x = p.x;
    pointer.y = p.y;
  });
  canvas.addEventListener('pointerdown', (e) => {
    ensureAudio();
    const p = toLogical(e);
    pointer.x = p.x;
    pointer.y = p.y;
    pointer.down = true;
    pointer.clicked = { x: p.x, y: p.y };
  });
  canvas.addEventListener('pointerup', () => { pointer.down = false; });
  canvas.addEventListener('pointerleave', () => { pointer.x = -100; pointer.y = -100; });

  window.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    keyState[e.code] = true;
    ensureAudio();
    for (const fn of keyHandlers) fn(e.code, e.key);
    if (['Space', 'ArrowUp', 'ArrowDown'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', (e) => { keyState[e.code] = false; });
}

export function consumeClick() {
  const c = pointer.clicked;
  pointer.clicked = null;
  return c;
}
