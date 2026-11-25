// Copper Ladle Kitchen — game state + rules.
// Pure logic: orders, plate assembly, chopping, coins, score, combo,
// shift clock, difficulty ramp, rush hour. No drawing here.

import { RECIPES, RECIPE_BY_ID, ING_BY_ID, TUNING } from './config.js';
import { playChop, playDing, playBuzz, playServe, playTick } from './audio.js';

let orderSeq = 0;

export function newGame() {
  return {
    phase: 'title',          // 'title' | 'playing' | 'paused' | 'over'
    time: 0,                 // total seconds since shift start (playing)
    shiftLeft: TUNING.shiftSeconds,
    spawnTimer: 6,           // first order arrives quickly
    orders: [],              // {uid, recipeId, timeLeft, timeMax, served}
    plate: [],               // [{id, chopped}] in add order
    held: null,              // {id, chopped} ingredient in hand
    chopTarget: null,        // ingredient currently on the board
    chopProgress: 0,         // clicks done on current chop
    chopAnim: 0,             // knife swing timer (seconds)
    coins: 0,
    score: 0,
    dishes: 0,
    combo: 0,
    bestCombo: 0,
    rushUntil: 0,            // time until which rush multiplier is active
    rushBanner: 0,           // banner display timer
    rushDone: {},            // elapsed-second marks already triggered
    popups: [],              // {text, x, y, t, color}
    flyingCoins: [],         // {x, y, vx, vy, t}
    shake: 0,                // screen shake timer
    mismatchHint: false,
    lastTickSecond: -1,
    bestScore: 0,
    frozen: false,           // true for ?shot= scenes: timers do not advance
    rng: Math.random,
  };
}

export function difficulty(state) {
  const f = Math.min(1, state.time / TUNING.shiftSeconds);
  return {
    spawnInterval: TUNING.spawnIntervalStart + (TUNING.spawnIntervalEnd - TUNING.spawnIntervalStart) * f,
    orderTime: TUNING.orderTimeStart + (TUNING.orderTimeEnd - TUNING.orderTimeStart) * f,
  };
}

export function spawnOrder(state, recipeId = null) {
  if (state.orders.length >= TUNING.maxOrders) return null;
  const d = difficulty(state);
  const pool = recipeId ? [RECIPE_BY_ID[recipeId]] : RECIPES;
  const recipe = pool[Math.floor(state.rng() * pool.length)];
  const order = {
    uid: ++orderSeq,
    recipeId: recipe.id,
    timeLeft: d.orderTime,
    timeMax: d.orderTime,
    served: false,
  };
  state.orders.push(order);
  return order;
}

function plateKey(plate) {
  return plate.map((s) => `${s.id}:${s.chopped ? 1 : 0}`).sort().join('|');
}

function recipeKey(recipe) {
  return recipe.steps.map((s) => `${s.id}:${s.chopped ? 1 : 0}`).sort().join('|');
}

// The order (if any) whose recipe exactly matches the current plate.
export function matchingOrder(state) {
  if (state.plate.length === 0) return null;
  const key = plateKey(state.plate);
  return state.orders.find((o) => recipeKey(RECIPE_BY_ID[o.recipeId]) === key) || null;
}

// Does the plate contain an ingredient no open order needs? (hint text)
export function plateMismatch(state) {
  if (state.plate.length === 0 || state.orders.length === 0) return false;
  const needed = new Set();
  for (const o of state.orders) {
    for (const s of RECIPE_BY_ID[o.recipeId].steps) needed.add(`${s.id}:${s.chopped ? 1 : 0}`);
  }
  return state.plate.some((s) => !needed.has(`${s.id}:${s.chopped ? 1 : 0}`));
}

export function pickIngredient(state, id) {
  if (state.phase !== 'playing') return;
  const ing = ING_BY_ID[id];
  if (!ing) return;
  // Picking a new ingredient replaces the held one; chopping state resets.
  state.held = { id, chopped: false };
  state.chopTarget = null;
  state.chopProgress = 0;
}

export function putOnBoard(state) {
  // Move the held ingredient onto the chopping board.
  if (!state.held) return false;
  state.chopTarget = { ...state.held };
  state.held = null;
  state.chopProgress = 0;
  return true;
}

export function chopHeld(state) {
  if (state.phase !== 'playing' || !state.chopTarget) return false;
  const ing = ING_BY_ID[state.chopTarget.id];
  if (!ing.needsChop) return false;
  state.chopProgress += 1;
  state.chopAnim = 0.22;
  playChop();
  if (state.chopProgress >= TUNING.chopClicks) {
    state.held = { id: state.chopTarget.id, chopped: true };
    state.chopTarget = null;
    state.chopProgress = 0;
    playDing();
  }
  return true;
}

export function addIngredientToPlate(state) {
  if (state.phase !== 'playing' || !state.held) return false;
  const ing = ING_BY_ID[state.held.id];
  if (ing.needsChop && !state.held.chopped) {
    // Not chopped yet: put it on the board instead of the plate.
    putOnBoard(state);
    return 'board';
  }
  state.plate.push({ ...state.held });
  state.held = null;
  const match = matchingOrder(state);
  if (match) playDing();
  else if (plateMismatch(state)) playBuzz();
  else playDing();
  state.mismatchHint = plateMismatch(state);
  return 'added';
}

export function trashPlate(state) {
  if (state.phase !== 'playing') return;
  if (state.plate.length === 0 && !state.held) return;
  state.plate = [];
  state.held = null;
  state.chopTarget = null;
  state.chopProgress = 0;
  state.mismatchHint = false;
  playBuzz();
}

export function serveOrder(state) {
  if (state.phase !== 'playing') return null;
  const order = matchingOrder(state);
  if (!order) return null;
  const recipe = RECIPE_BY_ID[order.recipeId];
  const rush = state.time < state.rushUntil;
  const perfect = order.timeLeft > order.timeMax * TUNING.perfectFrac;
  let coins = recipe.coins;
  if (perfect) coins = Math.round(coins * (1 + TUNING.perfectBonus));
  const comboBefore = state.combo;
  state.combo += 1;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  const mult = state.combo; // x1, x2, x3...
  coins = Math.round(coins * mult * (rush ? TUNING.rushMultiplier : 1));
  state.coins += coins;
  state.score += coins * 10;
  state.dishes += 1;
  state.orders = state.orders.filter((o) => o.uid !== order.uid);
  state.plate = [];
  state.mismatchHint = false;
  playServe();
  addPopup(state, `+${coins}`, 640, 320, '#1e6f36', perfect ? 'PERFECT!' : null);
  for (let i = 0; i < 8; i++) {
    state.flyingCoins.push({
      x: 640 + (state.rng() - 0.5) * 120, y: 340,
      vx: (state.rng() - 0.5) * 260, vy: -120 - state.rng() * 160, t: 0,
    });
  }
  return { order, coins, perfect, combo: state.combo, comboBefore, rush };
}

function addPopup(state, text, x, y, color, sub) {
  state.popups.push({ text, x, y, t: 0, color, sub });
}

export function expireOrder(state, order) {
  state.orders = state.orders.filter((o) => o.uid !== order.uid);
  state.combo = 0;
  state.shake = 0.5;
  playBuzz();
  addPopup(state, 'ORDER LOST', 640, 150, '#d43d2a', null);
}

export function startShift(state) {
  state.phase = 'playing';
  state.time = 0;
  state.shiftLeft = TUNING.shiftSeconds;
  state.spawnTimer = 4;
  state.orders = [];
  state.plate = [];
  state.held = null;
  state.chopTarget = null;
  state.chopProgress = 0;
  state.coins = 0;
  state.score = 0;
  state.dishes = 0;
  state.combo = 0;
  state.bestCombo = 0;
  state.rushUntil = 0;
  state.rushBanner = 0;
  state.rushDone = {};
  state.popups = [];
  state.flyingCoins = [];
  state.shake = 0;
  state.mismatchHint = false;
  spawnOrder(state);
  spawnOrder(state);
}

export function togglePause(state) {
  if (state.phase === 'playing') state.phase = 'paused';
  else if (state.phase === 'paused') state.phase = 'playing';
}

export function update(state, dt) {
  if (state.phase !== 'playing' || state.frozen) return;
  state.time += dt;
  state.shiftLeft = Math.max(0, TUNING.shiftSeconds - state.time);

  // Rush hour at 1:00 and 2:00 elapsed.
  for (const mark of TUNING.rushAt) {
    if (state.time >= mark && !state.rushDone[mark]) {
      state.rushDone[mark] = true;
      state.rushUntil = state.time + TUNING.rushDuration;
      state.rushBanner = 3;
      for (let i = 0; i < TUNING.rushOrders; i++) spawnOrder(state);
      playServe();
    }
  }
  if (state.rushBanner > 0) state.rushBanner -= dt;
  if (state.chopAnim > 0) state.chopAnim -= dt;

  // Order spawns.
  state.spawnTimer -= dt;
  if (state.spawnTimer <= 0) {
    const d = difficulty(state);
    spawnOrder(state);
    state.spawnTimer = d.spawnInterval;
  }

  // Ticket timers.
  for (const o of [...state.orders]) {
    o.timeLeft -= dt;
    const sec = Math.ceil(o.timeLeft);
    if (o.timeLeft <= 5.5 && sec !== state.lastTickSecond && o.timeLeft > 0) {
      state.lastTickSecond = sec;
      playTick();
    }
    if (o.timeLeft <= 0) expireOrder(state, o);
  }

  // Popups / flying coins / shake decay.
  for (const p of state.popups) p.t += dt;
  state.popups = state.popups.filter((p) => p.t < 1.6);
  for (const c of state.flyingCoins) {
    c.t += dt;
    c.x += c.vx * dt;
    c.y += c.vy * dt;
    c.vy += 500 * dt;
  }
  state.flyingCoins = state.flyingCoins.filter((c) => c.t < 1.1);
  if (state.shake > 0) state.shake -= dt;

  // End of shift.
  if (state.shiftLeft <= 0) {
    state.phase = 'over';
    try {
      const prev = Number(localStorage.getItem('copper-ladle-best') || 0);
      if (state.score > prev) localStorage.setItem('copper-ladle-best', String(state.score));
      state.bestScore = Math.max(prev, state.score);
    } catch (e) { state.bestScore = state.score; }
  }
}

export function loadBest(state) {
  try {
    state.bestScore = Number(localStorage.getItem('copper-ladle-best') || 0);
  } catch (e) { state.bestScore = 0; }
}
