// Copper Ladle Kitchen — game loop + wiring: input -> kitchen -> render.
// Canvas is scaled to fit the window while keeping the 1280x720 logical size.

import { W, H, INGREDIENTS, LAYOUT } from './config.js';
import { newGame, startShift, update, pickIngredient, addIngredientToPlate, chopHeld, serveOrder, trashPlate, togglePause, matchingOrder, loadBest } from './kitchen.js';
import { drawKitchen, binRect } from './render.js';
import { bindInput, consumeClick, onKey, pointer, pointInRect } from './input.js';
import { ensureAudio, setMuted, isMuted } from './audio.js';
import { applyShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const params = new URLSearchParams(window.location.search);
let state = applyShot(params);
if (!state) {
  state = newGame();
  loadBest(state);
}
state.muted = isMuted();

// Test/debug hook (read-only state access for automated verification).
window.__copperLadle = { get state() { return state; } };

const buttons = {}; // filled by drawHud each frame: {pause, mute}

function fitCanvas() {
  const scale = Math.min(window.innerWidth / W, window.innerHeight / H);
  canvas.style.width = `${Math.floor(W * scale)}px`;
  canvas.style.height = `${Math.floor(H * scale)}px`;
}
window.addEventListener('resize', fitCanvas);
fitCanvas();

bindInput(canvas, ensureAudio);

function handleClick(c) {
  ensureAudio();
  if (state.phase === 'title') { startShift(state); return; }
  if (state.phase === 'over') return; // R restarts
  if (state.phase === 'paused') { togglePause(state); return; }

  // HUD buttons first.
  if (buttons.pause && pointInRect(c.x, c.y, buttons.pause)) { togglePause(state); return; }
  if (buttons.mute && pointInRect(c.x, c.y, buttons.mute)) {
    setMuted(!isMuted());
    state.muted = isMuted();
    return;
  }

  // SERVE button on a glowing ticket.
  for (const o of state.orders) {
    if (o.serveRect && pointInRect(c.x, c.y, o.serveRect)) { serveOrder(state); return; }
  }

  // Chopping board: chop if something is on it, else place held ingredient.
  if (pointInRect(c.x, c.y, LAYOUT.chopBoard)) {
    if (state.chopTarget) chopHeld(state);
    else if (state.held) {
      // Only choppable ingredients go on the board; others go straight to plate.
      const ing = INGREDIENTS.find((i) => i.id === state.held.id);
      if (ing && ing.needsChop) {
        state.chopTarget = { ...state.held };
        state.held = null;
        state.chopProgress = 0;
      } else {
        addIngredientToPlate(state);
      }
    }
    return;
  }

  // Plate: add held ingredient.
  if (pointInRect(c.x, c.y, LAYOUT.plate)) { addIngredientToPlate(state); return; }

  // Trash bin.
  if (pointInRect(c.x, c.y, LAYOUT.trash)) { trashPlate(state); return; }

  // Ingredient bins.
  for (let i = 0; i < INGREDIENTS.length; i++) {
    if (pointInRect(c.x, c.y, binRect(i))) { pickIngredient(state, INGREDIENTS[i].id); return; }
  }
}

onKey((code) => {
  if (code === 'KeyM') {
    setMuted(!isMuted());
    state.muted = isMuted();
    return;
  }
  if (code === 'KeyR' && (state.phase === 'over' || state.phase === 'title')) {
    const keep = state.bestScore;
    state = newGame();
    state.bestScore = keep;
    startShift(state);
    return;
  }
  if (code === 'KeyP' && (state.phase === 'playing' || state.phase === 'paused')) {
    togglePause(state);
    return;
  }
  if (state.phase === 'title' && (code === 'Space' || code === 'Enter')) { startShift(state); return; }
  if (state.phase !== 'playing') return;

  if (code === 'Space') {
    if (matchingOrder(state)) serveOrder(state);
    else if (state.chopTarget && !state.held) chopHeld(state);
    else addIngredientToPlate(state);
    return;
  }
  if (code === 'KeyX') { trashPlate(state); return; }
  const digit = { Digit1: 0, Digit2: 1, Digit3: 2, Digit4: 3, Digit5: 4, Digit6: 5 }[code];
  if (digit !== undefined) pickIngredient(state, INGREDIENTS[digit].id);
});

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  const click = consumeClick();
  if (click) handleClick(click);
  update(state, dt);
  ctx.clearRect(0, 0, W, H);
  drawKitchen(ctx, state, pointer, buttons);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
