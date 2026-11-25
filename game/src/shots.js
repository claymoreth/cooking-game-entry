// Copper Ladle Kitchen — deterministic screenshot scenes for ?shot=.
// Each scene is seeded and frozen: gameplay timers do not advance, so the
// screenshot is identical on every load. Normal play (no ?shot=) is untouched.

import { spawnOrder, newGame } from './kitchen.js';

function baseScene() {
  const state = newGame();
  state.frozen = true;
  state.phase = 'playing';
  state.time = 40;
  state.shiftLeft = 140;
  state.rng = () => 0.5;
  return state;
}

function order(state, recipeId, timeLeft, timeMax) {
  const o = spawnOrder(state, recipeId);
  if (o) { o.timeLeft = timeLeft; o.timeMax = timeMax; }
  return o;
}

export function applyShot(query) {
  const shot = query.get('shot');
  if (!shot) return null;

  if (shot === 'cover') {
    const s = baseScene();
    s.coins = 320;
    s.score = 4250;
    s.combo = 3;
    // 3 orders on the board, one glowing ready-to-serve.
    order(s, 'salad', 38, 45);
    order(s, 'pasta', 22, 45);
    order(s, 'soup', 12, 45);
    // Plate mid-assembly with 2 ingredients (chopped mushroom + chopped
    // onion) — a complete Mushroom Soup, so its ticket glows ready-to-serve.
    s.plate = [
      { id: 'mushroom', chopped: true },
      { id: 'onion', chopped: true },
    ];
    s.held = { id: 'cheese', chopped: false };
    s.mismatchHint = false;
    return s;
  }

  if (shot === 'play') {
    const s = baseScene();
    s.coins = 140;
    s.score = 1800;
    s.combo = 2;
    order(s, 'pasta', 30, 45);
    order(s, 'melt', 18, 45);
    // Chopping in progress: tomato on the board, 2 of 3 chops done,
    // knife mid-swing.
    s.chopTarget = { id: 'tomato', chopped: false };
    s.chopProgress = 2;
    s.chopAnim = 0.12;
    s.plate = [{ id: 'pasta', chopped: false }];
    return s;
  }

  if (shot === 'serve') {
    const s = baseScene();
    s.coins = 440;
    s.score = 6100;
    s.combo = 4;
    order(s, 'melt', 28, 45);
    order(s, 'salad', 15, 45);
    // Plate complete for Cheesy Melt: cheese + chopped tomato + chopped mushroom.
    s.plate = [
      { id: 'cheese', chopped: false },
      { id: 'tomato', chopped: true },
      { id: 'mushroom', chopped: true },
    ];
    s.popups = [{ text: '+120', x: 640, y: 320, t: 0.3, color: '#1e6f36', sub: 'PERFECT!' }];
    s.flyingCoins = [
      { x: 600, y: 320, vx: -90, vy: -160, t: 0.2 },
      { x: 640, y: 310, vx: 20, vy: -200, t: 0.2 },
      { x: 680, y: 320, vx: 110, vy: -150, t: 0.2 },
      { x: 620, y: 340, vx: -40, vy: -120, t: 0.1 },
      { x: 660, y: 340, vx: 60, vy: -130, t: 0.1 },
    ];
    return s;
  }

  if (shot === 'end') {
    const s = baseScene();
    s.phase = 'over';
    s.shiftLeft = 0;
    s.dishes = 14;
    s.coins = 1180;
    s.score = 15400;
    s.bestCombo = 5;
    s.bestScore = 15400;
    return s;
  }

  return null;
}
