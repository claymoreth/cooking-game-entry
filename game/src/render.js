// Copper Ladle Kitchen — all canvas drawing. Warm palette, all art drawn
// with canvas shapes (no images, no external fonts).

import { W, H, COLORS, INGREDIENTS, ING_BY_ID, RECIPE_BY_ID, LAYOUT, TUNING } from './config.js';
import { matchingOrder, plateMismatch } from './kitchen.js';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, s, x, y, size, color, align = 'center', weight = 'bold', font = 'sans-serif') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px ${font}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
}

function fmtClock(sec) {
  const s = Math.max(0, Math.ceil(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

// ---------- ingredient shapes ----------

export function drawIngredient(ctx, id, cx, cy, r, chopped = false) {
  if (chopped) { drawChopped(ctx, id, cx, cy, r); return; }
  const ing = ING_BY_ID[id];
  ctx.save();
  ctx.translate(cx, cy);
  if (id === 'tomato') {
    ctx.fillStyle = ing.color;
    ctx.beginPath(); ctx.arc(0, 2, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = ing.light;
    ctx.beginPath(); ctx.arc(-r * 0.3, -r * 0.3, r * 0.35, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3d8b40';
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i * Math.PI * 2) / 5;
      ctx.moveTo(0, -r * 0.55);
      ctx.lineTo(Math.cos(a - 0.35) * r * 0.55, -r * 0.55 + Math.sin(a - 0.35) * r * 0.55);
      ctx.lineTo(Math.cos(a + 0.35) * r * 0.55, -r * 0.55 + Math.sin(a + 0.35) * r * 0.55);
    }
    ctx.fill();
  } else if (id === 'lettuce') {
    ctx.fillStyle = ing.dark;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(-r * 0.45 + i * r * 0.45, r * 0.25, r * 0.55, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = ing.color;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(-r * 0.45 + i * r * 0.45, 0, r * 0.55, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = ing.light;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(-r * 0.45 + i * r * 0.45, -r * 0.2, r * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'cheese') {
    ctx.fillStyle = ing.color;
    ctx.beginPath();
    ctx.moveTo(-r, r * 0.6); ctx.lineTo(r, r * 0.6); ctx.lineTo(r * 0.7, -r * 0.7); ctx.lineTo(-r * 0.4, -r * 0.2);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = ing.dark;
    ctx.beginPath(); ctx.arc(-r * 0.1, r * 0.15, r * 0.16, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(r * 0.45, r * 0.3, r * 0.12, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(r * 0.25, -r * 0.35, r * 0.1, 0, Math.PI * 2); ctx.fill();
  } else if (id === 'mushroom') {
    ctx.fillStyle = '#f3e9d7';
    ctx.beginPath(); ctx.moveTo(-r * 0.35, r * 0.1); ctx.lineTo(r * 0.35, r * 0.1); ctx.lineTo(r * 0.25, r * 0.85); ctx.lineTo(-r * 0.25, r * 0.85); ctx.closePath(); ctx.fill();
    ctx.fillStyle = ing.color;
    ctx.beginPath(); ctx.arc(0, r * 0.1, r * 0.9, Math.PI, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = ing.light;
    ctx.beginPath(); ctx.arc(-r * 0.35, -r * 0.35, r * 0.22, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = ing.dark;
    ctx.beginPath(); ctx.arc(r * 0.35, -r * 0.3, r * 0.12, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(-r * 0.1, -r * 0.55, r * 0.1, 0, Math.PI * 2); ctx.fill();
  } else if (id === 'pasta') {
    ctx.strokeStyle = ing.dark;
    ctx.lineWidth = r * 0.22;
    ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(0, 0, r * (0.35 + i * 0.28), Math.PI * 0.15, Math.PI * 1.5);
      ctx.stroke();
    }
    ctx.strokeStyle = ing.light;
    ctx.lineWidth = r * 0.12;
    ctx.beginPath(); ctx.arc(0, 0, r * 0.5, Math.PI * 0.3, Math.PI * 1.2); ctx.stroke();
  } else if (id === 'onion') {
    ctx.fillStyle = ing.color;
    ctx.beginPath(); ctx.arc(0, 0, r * 0.9, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = ing.dark;
    ctx.lineWidth = r * 0.1;
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath(); ctx.arc(0, 0, r * 0.9 - i * r * 0.2, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.strokeStyle = '#7fae4e';
    ctx.lineWidth = r * 0.14;
    ctx.beginPath(); ctx.moveTo(0, -r * 0.85); ctx.quadraticCurveTo(r * 0.2, -r * 1.25, r * 0.45, -r * 1.15); ctx.stroke();
  }
  ctx.restore();
}

function drawChopped(ctx, id, cx, cy, r) {
  const ing = ING_BY_ID[id];
  ctx.save();
  ctx.translate(cx, cy);
  const offs = [[-0.45, 0.15], [0.4, 0.25], [0, -0.45], [0.35, -0.35], [-0.1, 0.45]];
  for (let i = 0; i < 5; i++) {
    const [ox, oy] = offs[i];
    ctx.fillStyle = i % 2 ? ing.light : ing.color;
    ctx.beginPath();
    ctx.arc(ox * r, oy * r, r * 0.32, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = ing.dark;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  ctx.restore();
}

function drawCoin(ctx, cx, cy, r) {
  ctx.fillStyle = COLORS.coin;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = COLORS.coinEdge;
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, '$', cx, cy + 1, r * 1.1, COLORS.coinEdge);
}

// ---------- HUD ----------

export function drawHud(ctx, state, buttons) {
  const b = LAYOUT.hud;
  ctx.fillStyle = COLORS.hud;
  ctx.fillRect(b.x, b.y, b.w, b.h);
  ctx.fillStyle = COLORS.gold;
  ctx.fillRect(0, 60, 1280, 4);

  text(ctx, 'COPPER LADLE KITCHEN', 24, 32, 26, '#ffd98a', 'left');

  drawCoin(ctx, 560, 32, 15);
  text(ctx, String(state.coins), 582, 32, 24, '#fff3d6', 'left');
  text(ctx, 'SCORE', 700, 22, 13, '#c9a06a', 'left');
  text(ctx, String(state.score), 700, 44, 22, '#fff3d6', 'left');

  const clockColor = state.shiftLeft <= 30 ? COLORS.red : '#fff3d6';
  text(ctx, 'SHIFT', 900, 22, 13, '#c9a06a', 'left');
  text(ctx, fmtClock(state.shiftLeft), 900, 44, 24, clockColor, 'left');

  if (state.combo >= 2) {
    const cx = 1040, cy = 32;
    ctx.fillStyle = COLORS.gold;
    rr(ctx, cx - 52, cy - 20, 104, 40, 20);
    ctx.fill();
    ctx.strokeStyle = '#fff3d6'; ctx.lineWidth = 2; ctx.stroke();
    text(ctx, `COMBO x${state.combo}`, cx, cy + 1, 18, '#3a2413');
  }

  // Pause + mute buttons (recorded for hit-testing in main.js).
  buttons.pause = { x: 1130, y: 12, w: 56, h: 40 };
  buttons.mute = { x: 1196, y: 12, w: 56, h: 40 };
  for (const [key, r] of Object.entries(buttons)) {
    ctx.fillStyle = '#5a3a1c';
    rr(ctx, r.x, r.y, r.w, r.h, 8); ctx.fill();
    ctx.strokeStyle = COLORS.gold; ctx.lineWidth = 2; ctx.stroke();
    if (key === 'pause') {
      ctx.fillStyle = '#fff3d6';
      ctx.fillRect(r.x + 18, r.y + 11, 7, 18);
      ctx.fillRect(r.x + 31, r.y + 11, 7, 18);
    } else {
      text(ctx, state.muted ? 'MUTE' : 'SOUND', r.x + r.w / 2, r.y + r.h / 2 + 1, 12, '#fff3d6');
    }
  }
}

// ---------- order board ----------

function ticketRect(i) {
  return {
    x: LAYOUT.board.x + i * (LAYOUT.ticketW + LAYOUT.ticketGap),
    y: LAYOUT.board.y + 8,
    w: LAYOUT.ticketW,
    h: LAYOUT.ticketH,
  };
}

export function drawOrderBoard(ctx, state) {
  const b = LAYOUT.board;
  ctx.fillStyle = COLORS.wall;
  ctx.fillRect(b.x, b.y, b.w, b.h);
  text(ctx, 'ORDERS', b.x + 8, b.y + 14, 12, COLORS.muted, 'left');

  if (state.orders.length === 0) {
    // Only during live play; title/results overlays cover this area.
    if (state.phase === 'playing' || state.phase === 'paused') {
      text(ctx, 'Waiting for hungry customers...', 640, b.y + 64, 18, COLORS.muted);
    }
    return;
  }
  state.orders.forEach((o, i) => {
    const r = ticketRect(i);
    const recipe = RECIPE_BY_ID[o.recipeId];
    const ready = !!matchingOrder(state) && matchingOrder(state).uid === o.uid;
    const frac = Math.max(0, o.timeLeft / o.timeMax);
    const low = o.timeLeft <= 10;

    ctx.save();
    if (low && state.phase === 'playing' && !state.frozen) {
      const pulse = 0.5 + 0.5 * Math.sin(state.time * 8);
      ctx.shadowColor = COLORS.red;
      ctx.shadowBlur = 10 + 14 * pulse;
    }
    if (ready) {
      ctx.shadowColor = COLORS.green;
      ctx.shadowBlur = 22;
    }
    ctx.fillStyle = COLORS.ticket;
    rr(ctx, r.x, r.y, r.w, r.h, 10); ctx.fill();
    ctx.restore();
    ctx.strokeStyle = ready ? COLORS.green : COLORS.ticketEdge;
    ctx.lineWidth = ready ? 4 : 2;
    rr(ctx, r.x, r.y, r.w, r.h, 10); ctx.stroke();

    text(ctx, recipe.name, r.x + 16, r.y + 22, 19, COLORS.ink, 'left');
    // ingredient icons
    recipe.steps.forEach((s, j) => {
      drawIngredient(ctx, s.id, r.x + 34 + j * 52, r.y + 58, 17, s.chopped);
      if (s.chopped) {
        ctx.fillStyle = COLORS.dark;
        ctx.beginPath(); ctx.arc(r.x + 48 + j * 52, r.y + 72, 7, 0, Math.PI * 2); ctx.fill();
        text(ctx, 'C', r.x + 48 + j * 52, r.y + 72.5, 9, '#fff');
      }
    });
    // coin value
    drawCoin(ctx, r.x + 300, r.y + 58, 13);
    const rush = state.time < state.rushUntil;
    const val = Math.round(recipe.coins * (rush ? TUNING.rushMultiplier : 1));
    text(ctx, String(val), r.x + 320, r.y + 58, 19, COLORS.ink, 'left');

    // countdown bar
    const barX = r.x + 16, barY = r.y + 88, barW = r.w - 32, barH = 12;
    ctx.fillStyle = '#e5d3ae';
    rr(ctx, barX, barY, barW, barH, 6); ctx.fill();
    const barColor = frac > 0.5 ? COLORS.green : frac > 0.25 ? COLORS.amber : COLORS.red;
    ctx.fillStyle = barColor;
    if (frac > 0.01) { rr(ctx, barX, barY, Math.max(12, barW * frac), barH, 6); ctx.fill(); }
    text(ctx, `${Math.ceil(o.timeLeft)}s`, r.x + r.w - 16, r.y + 22, 15, low ? COLORS.red : COLORS.muted, 'right');

    if (ready) {
      const sr = { x: r.x + r.w - 108, y: r.y + 40, w: 92, h: 34 };
      ctx.fillStyle = COLORS.ticketServe;
      rr(ctx, sr.x, sr.y, sr.w, sr.h, 8); ctx.fill();
      ctx.strokeStyle = COLORS.ticketServeEdge; ctx.lineWidth = 2; ctx.stroke();
      text(ctx, 'SERVE!', sr.x + sr.w / 2, sr.y + sr.h / 2 + 1, 16, '#ffffff');
      o.serveRect = sr;
    } else {
      o.serveRect = null;
    }
  });
}

// ---------- middle: board, plate, stove, trash ----------

export function drawMiddle(ctx, state, pointer) {
  ctx.fillStyle = COLORS.wall;
  ctx.fillRect(0, 64, 1280, 436);
  ctx.fillStyle = COLORS.floor;
  ctx.fillRect(0, 470, 1280, 30);

  // --- chopping board ---
  const cb = LAYOUT.chopBoard;
  ctx.fillStyle = COLORS.boardEdge;
  rr(ctx, cb.x - 6, cb.y - 6, cb.w + 12, cb.h + 12, 14); ctx.fill();
  ctx.fillStyle = COLORS.board;
  rr(ctx, cb.x, cb.y, cb.w, cb.h, 10); ctx.fill();
  text(ctx, 'CHOPPING BOARD', cb.x + cb.w / 2, cb.y + 22, 15, '#8a5a2b');
  if (state.chopTarget) {
    drawIngredient(ctx, state.chopTarget.id, cb.x + cb.w / 2 - 30, cb.y + 118, 42);
    // chop progress pips
    for (let i = 0; i < TUNING.chopClicks; i++) {
      ctx.fillStyle = i < state.chopProgress ? COLORS.green : '#e5d3ae';
      ctx.beginPath(); ctx.arc(cb.x + cb.w / 2 - 30 + (i - 1) * 30, cb.y + 178, 9, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#8a5a2b'; ctx.lineWidth = 1.5; ctx.stroke();
    }
    text(ctx, 'Click the board to chop!', cb.x + cb.w / 2, cb.y + 200, 13, '#8a5a2b');
  } else {
    text(ctx, 'Pick an ingredient,', cb.x + cb.w / 2, cb.y + 100, 15, '#a06a35');
    text(ctx, 'then click here to chop it', cb.x + cb.w / 2, cb.y + 124, 15, '#a06a35');
  }
  // knife: when chopping it hovers over the ingredient; otherwise it rests
  // flat in the board's bottom-right corner, clear of the hint text.
  const kx = state.chopTarget ? cb.x + cb.w - 62 : cb.x + cb.w - 72;
  const ky = state.chopTarget ? cb.y + 96 : cb.y + cb.h - 32;
  ctx.save();
  ctx.translate(kx, ky);
  const swing = state.chopAnim > 0 ? Math.sin((0.22 - state.chopAnim) / 0.22 * Math.PI) * 0.9 : 0;
  ctx.rotate(-0.6 - swing);
  ctx.fillStyle = '#c0c6d0';
  ctx.beginPath(); ctx.moveTo(-34, -8); ctx.lineTo(30, -8); ctx.lineTo(44, 0); ctx.lineTo(30, 8); ctx.lineTo(-34, 8); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#3a2413';
  rr(ctx, -62, -7, 30, 14, 5); ctx.fill();
  ctx.restore();

  // --- plate ---
  const pl = LAYOUT.plate;
  const pcx = pl.x + pl.w / 2, pcy = pl.y + 118;
  ctx.fillStyle = '#e5d3ae';
  ctx.beginPath(); ctx.ellipse(pcx, pcy + 78, 150, 26, 0, 0, Math.PI * 2); ctx.fill();
  const ready = !!matchingOrder(state);
  ctx.fillStyle = COLORS.plate;
  ctx.beginPath(); ctx.ellipse(pcx, pcy + 62, 140, 62, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = ready ? COLORS.green : COLORS.plateEdge;
  ctx.lineWidth = ready ? 5 : 3;
  ctx.stroke();
  text(ctx, 'PLATE', pcx, pl.y + 24, 15, '#8a5a2b');
  if (ready) text(ctx, 'READY TO SERVE!', pcx, pl.y + 46, 15, COLORS.green);

  const recipe = ready ? RECIPE_BY_ID[matchingOrder(state).recipeId] : null;
  if (recipe && recipe.bowl) {
    // soup bowl
    ctx.fillStyle = '#4a7fb5';
    ctx.beginPath(); ctx.moveTo(pcx - 78, pcy + 30); ctx.quadraticCurveTo(pcx - 70, pcy + 78, pcx, pcy + 78); ctx.quadraticCurveTo(pcx + 70, pcy + 78, pcx + 78, pcy + 30); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#e88f4a';
    ctx.beginPath(); ctx.ellipse(pcx, pcy + 30, 78, 14, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#d97a30';
    ctx.beginPath(); ctx.ellipse(pcx - 20, pcy + 28, 14, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(pcx + 24, pcy + 32, 12, 4, 0, 0, Math.PI * 2); ctx.fill();
  } else {
    // ingredients laid on the plate
    const spots = [[-52, 52], [0, 44], [52, 52], [-26, 66], [26, 66], [0, 60]];
    state.plate.forEach((s, i) => {
      const [ox, oy] = spots[i % spots.length];
      drawIngredient(ctx, s.id, pcx + ox, pcy + oy, 26, s.chopped);
    });
    if (state.plate.length === 0 && (state.phase === 'playing' || state.phase === 'paused')) {
      text(ctx, 'Add ingredients here', pcx, pcy + 58, 15, '#b8a888');
    }
  }
  if (state.mismatchHint) {
    text(ctx, "doesn't match any order — trash it!", pcx, pl.y + 214, 14, COLORS.red);
  }

  // --- trash ---
  const tr = LAYOUT.trash;
  ctx.fillStyle = COLORS.trash;
  rr(ctx, tr.x, tr.y, tr.w, tr.h, 8); ctx.fill();
  ctx.strokeStyle = COLORS.trashEdge; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = '#4b5563';
  ctx.fillRect(tr.x + 8, tr.y - 6, tr.w - 16, 10);
  text(ctx, 'TRASH', tr.x + tr.w / 2, tr.y + 34, 16, '#fff');
  text(ctx, '[X]', tr.x + tr.w / 2, tr.y + 62, 13, '#d1d5db');

  // --- stove + pot ---
  const st = LAYOUT.stove;
  ctx.fillStyle = '#3d4049';
  rr(ctx, st.x, st.y, st.w, st.h, 12); ctx.fill();
  ctx.fillStyle = '#2c2f36';
  rr(ctx, st.x + 16, st.y + 16, st.w - 32, 120, 8); ctx.fill();
  // burners
  for (const [bx, by] of [[st.x + 80, st.y + 60], [st.x + 240, st.y + 60]]) {
    ctx.fillStyle = '#1d1f24';
    ctx.beginPath(); ctx.arc(bx, by, 44, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#565b68'; ctx.lineWidth = 3; ctx.stroke();
  }
  // pot
  const potX = st.x + 160, potY = st.y + 62;
  ctx.fillStyle = COLORS.pot;
  ctx.beginPath(); ctx.moveTo(potX - 62, potY - 8); ctx.lineTo(potX + 62, potY - 8); ctx.lineTo(potX + 54, potY + 52); ctx.lineTo(potX - 54, potY + 52); ctx.closePath(); ctx.fill();
  ctx.fillStyle = COLORS.potRim;
  ctx.fillRect(potX - 68, potY - 16, 136, 12);
  ctx.fillStyle = '#6b7280';
  ctx.fillRect(potX - 62, potY - 34, 124, 18);
  // steam curls
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  const steamT = state.frozen ? 0.4 : (state.time % 2);
  for (let i = 0; i < 3; i++) {
    const sx = potX - 34 + i * 34;
    const wob = Math.sin(steamT * 3 + i * 2) * 6;
    ctx.beginPath();
    ctx.moveTo(sx, potY - 40);
    ctx.quadraticCurveTo(sx + wob, potY - 58, sx - wob * 0.5, potY - 76);
    ctx.stroke();
  }
  text(ctx, 'STOVE', st.x + st.w / 2, st.y + 168, 15, '#9aa0ae');
  text(ctx, 'Soup still goes on the plate!', st.x + st.w / 2, st.y + 192, 13, '#9aa0ae');

  // held ingredient follows the cursor
  if (state.held && pointer.x > 0) {
    ctx.fillStyle = 'rgba(255,241,196,0.9)';
    ctx.beginPath(); ctx.arc(pointer.x, pointer.y - 44, 30, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = COLORS.gold; ctx.lineWidth = 2; ctx.stroke();
    drawIngredient(ctx, state.held.id, pointer.x, pointer.y - 44, 22, state.held.chopped);
    text(ctx, ING_BY_ID[state.held.id].name + (state.held.chopped ? ' (chopped)' : ''), pointer.x, pointer.y - 84, 13, COLORS.ink);
  }

  // flying coins
  for (const c of state.flyingCoins) {
    const a = Math.max(0, 1 - c.t / 1.1);
    ctx.globalAlpha = a;
    drawCoin(ctx, c.x, c.y, 12);
    ctx.globalAlpha = 1;
  }

  // popups
  for (const p of state.popups) {
    const a = p.t < 1.2 ? 1 : Math.max(0, 1 - (p.t - 1.2) / 0.4);
    const y = p.y - p.t * 46;
    ctx.globalAlpha = a;
    text(ctx, p.text, p.x, y, 34, p.color);
    if (p.sub) text(ctx, p.sub, p.x, y + 32, 26, '#e8910c');
    ctx.globalAlpha = 1;
  }

  // rush banner
  if (state.rushBanner > 0) {
    ctx.fillStyle = COLORS.banner;
    rr(ctx, 440, 200, 400, 52, 12); ctx.fill();
    ctx.strokeStyle = '#fff3d6'; ctx.lineWidth = 3; ctx.stroke();
    text(ctx, 'RUSH HOUR!  1.5x COINS', 640, 226, 26, '#fff3d6');
  }
}

// ---------- bottom counter ----------

export function binRect(i) {
  const totalW = INGREDIENTS.length * LAYOUT.binW + (INGREDIENTS.length - 1) * LAYOUT.binGap;
  const startX = LAYOUT.counter.x + (LAYOUT.counter.w - totalW) / 2;
  return {
    x: startX + i * (LAYOUT.binW + LAYOUT.binGap),
    y: LAYOUT.counter.y + 14,
    w: LAYOUT.binW,
    h: LAYOUT.binH,
  };
}

export function drawCounter(ctx, state) {
  const c = LAYOUT.counter;
  ctx.fillStyle = COLORS.counterTop;
  ctx.fillRect(c.x, c.y, c.w, 34);
  ctx.fillStyle = COLORS.counterFront;
  ctx.fillRect(c.x, c.y + 34, c.w, c.h - 34);
  ctx.fillStyle = COLORS.counterEdge;
  ctx.fillRect(c.x, c.y + 30, c.w, 4);

  INGREDIENTS.forEach((ing, i) => {
    const r = binRect(i);
    const held = state.held && state.held.id === ing.id;
    ctx.fillStyle = held ? '#ffe9a8' : '#fff8e6';
    rr(ctx, r.x, r.y, r.w, r.h, 12); ctx.fill();
    ctx.strokeStyle = held ? COLORS.gold : '#d9b06a';
    ctx.lineWidth = held ? 4 : 2;
    ctx.stroke();
    drawIngredient(ctx, ing.id, r.x + r.w / 2, r.y + 52, 30);
    text(ctx, ing.name, r.x + r.w / 2, r.y + 100, 17, COLORS.ink);
    const keyTxt = ing.needsChop ? `[${ing.key}] chop first` : `[${ing.key}] ready`;
    text(ctx, keyTxt, r.x + r.w / 2, r.y + 126, 13, COLORS.muted);
  });
}

// ---------- screens ----------

function dim(ctx, alpha = 0.72) {
  ctx.fillStyle = `rgba(43,29,18,${alpha})`;
  ctx.fillRect(0, 0, W, H);
}

export function drawTitleScreen(ctx, state) {
  dim(ctx, 0.88);
  text(ctx, 'COPPER LADLE', 640, 150, 64, '#ffd98a');
  text(ctx, 'KITCHEN', 640, 220, 64, '#ffd98a');
  text(ctx, 'A cozy 2D cooking game — serve hungry customers before their tickets run out!', 640, 290, 19, '#fff3d6');
  text(ctx, '1-6 pick ingredient  •  click board to chop  •  click plate or SPACE to add', 640, 340, 18, '#fff3d6');
  text(ctx, 'SERVE a glowing ticket  •  X trash  •  P pause  •  M mute  •  R restart', 640, 372, 18, '#fff3d6');
  if (state.bestScore > 0) text(ctx, `Best score: ${state.bestScore}`, 640, 420, 20, '#ffd98a');
  const pulse = 0.6 + 0.4 * Math.sin(Date.now() / 350);
  ctx.globalAlpha = pulse;
  text(ctx, 'CLICK TO START', 640, 500, 34, '#ffffff');
  ctx.globalAlpha = 1;
}

export function drawResultsScreen(ctx, state) {
  dim(ctx, 0.88);
  text(ctx, 'SHIFT COMPLETE!', 640, 150, 52, '#ffd98a');
  text(ctx, `Dishes served:  ${state.dishes}`, 640, 250, 26, '#fff3d6');
  text(ctx, `Coins earned:  ${state.coins}`, 640, 300, 26, '#fff3d6');
  text(ctx, `Best combo:  x${state.bestCombo}`, 640, 350, 26, '#fff3d6');
  text(ctx, `SCORE:  ${state.score}`, 640, 420, 40, '#ffd98a');
  if (state.bestScore > 0) text(ctx, `Best score: ${state.bestScore}`, 640, 470, 20, '#fff3d6');
  const pulse = 0.6 + 0.4 * Math.sin(Date.now() / 350);
  ctx.globalAlpha = pulse;
  text(ctx, 'Press R to play again', 640, 540, 28, '#ffffff');
  ctx.globalAlpha = 1;
}

export function drawPauseOverlay(ctx) {
  dim(ctx);
  text(ctx, 'PAUSED', 640, 320, 52, '#fff3d6');
  text(ctx, 'Press P to resume', 640, 380, 22, '#ffd98a');
}

export function drawKitchen(ctx, state, pointer, buttons) {
  ctx.save();
  if (state.shake > 0) {
    const m = state.shake * 14;
    ctx.translate((Math.random() - 0.5) * m, (Math.random() - 0.5) * m);
  }
  drawHud(ctx, state, buttons);
  drawMiddle(ctx, state, pointer);
  drawOrderBoard(ctx, state);
  drawCounter(ctx, state);
  ctx.restore();

  if (state.phase === 'title') drawTitleScreen(ctx, state);
  else if (state.phase === 'over') drawResultsScreen(ctx, state);
  else if (state.phase === 'paused') drawPauseOverlay(ctx);
}
