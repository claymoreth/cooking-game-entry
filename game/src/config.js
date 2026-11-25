// Copper Ladle Kitchen — tuning constants, recipes, ingredients, palette.
// No network, no external assets: everything is drawn on canvas.

export const W = 1280;
export const H = 720;

export const COLORS = {
  bg: '#f7e8c9',
  wall: '#e9cfa0',
  floor: '#c98f4e',
  counterTop: '#8a5a2b',
  counterFront: '#6f4520',
  counterEdge: '#a06a35',
  board: '#d9a066',
  boardEdge: '#b57e42',
  plate: '#fdfdf6',
  plateEdge: '#c9c2ae',
  pot: '#5b5f6b',
  potRim: '#3d4049',
  steam: '#ffffff',
  hud: '#3a2413',
  hudPanel: '#fff3d6',
  ticket: '#fff8e6',
  ticketEdge: '#d9b06a',
  ticketServe: '#2e9e4f',
  ticketServeEdge: '#1e6f36',
  gold: '#e8a91c',
  coin: '#f2c230',
  coinEdge: '#b8860b',
  red: '#d43d2a',
  amber: '#e8910c',
  green: '#2e9e4f',
  dark: '#2b1d12',
  ink: '#33241a',
  muted: '#7a5c3e',
  trash: '#6b7280',
  trashEdge: '#4b5563',
  hand: '#fff1c4',
  banner: '#c0392b',
};

export const INGREDIENTS = [
  { id: 'tomato',   name: 'Tomato',   key: '1', needsChop: true,  color: '#e0483e', dark: '#a92c22', light: '#ff7a6e' },
  { id: 'lettuce',  name: 'Lettuce',  key: '2', needsChop: true,  color: '#5cb85c', dark: '#3d8b40', light: '#8ed98e' },
  { id: 'cheese',   name: 'Cheese',   key: '3', needsChop: false, color: '#f2c230', dark: '#c9930a', light: '#ffe27a' },
  { id: 'mushroom', name: 'Mushroom', key: '4', needsChop: true,  color: '#cbb49a', dark: '#8d7a63', light: '#efe3d0' },
  { id: 'pasta',    name: 'Pasta',    key: '5', needsChop: false, color: '#f0d48a', dark: '#c9a44a', light: '#fff0b8' },
  { id: 'onion',    name: 'Onion',    key: '6', needsChop: true,  color: '#d9c2e8', dark: '#9a7bb8', light: '#efe4f7' },
];

export const ING_BY_ID = Object.fromEntries(INGREDIENTS.map((i) => [i.id, i]));

// A recipe step: { id, chopped } — chopped means the ingredient must be
// chopped on the board before it can be added to the plate.
export const RECIPES = [
  {
    id: 'salad',
    name: 'Garden Salad',
    coins: 60,
    steps: [
      { id: 'lettuce', chopped: true },
      { id: 'tomato', chopped: true },
      { id: 'cheese', chopped: false },
    ],
  },
  {
    id: 'pasta',
    name: 'Tomato Pasta',
    coins: 80,
    steps: [
      { id: 'pasta', chopped: false },
      { id: 'tomato', chopped: true },
      { id: 'cheese', chopped: false },
    ],
  },
  {
    id: 'soup',
    name: 'Mushroom Soup',
    coins: 70,
    steps: [
      { id: 'mushroom', chopped: true },
      { id: 'onion', chopped: true },
    ],
    bowl: true,
  },
  {
    id: 'melt',
    name: 'Cheesy Melt',
    coins: 90,
    steps: [
      { id: 'cheese', chopped: false },
      { id: 'tomato', chopped: true },
      { id: 'mushroom', chopped: true },
    ],
  },
];

export const RECIPE_BY_ID = Object.fromEntries(RECIPES.map((r) => [r.id, r]));

export const TUNING = {
  shiftSeconds: 180,          // 3:00 shift
  orderTimeStart: 45,         // ticket countdown at shift start
  orderTimeEnd: 35,           // ticket countdown at shift end
  spawnIntervalStart: 14,     // seconds between orders at shift start
  spawnIntervalEnd: 8,        // seconds between orders at shift end
  maxOrders: 3,               // max tickets on the board
  chopClicks: 3,              // clicks to chop one ingredient
  perfectFrac: 0.5,           // >50% time left = PERFECT (+50%)
  perfectBonus: 0.5,
  rushAt: [60, 120],          // elapsed seconds when rush hour hits
  rushOrders: 3,              // orders arriving at once during rush
  rushMultiplier: 1.5,
  rushDuration: 12,           // seconds the rush banner / multiplier lasts
  comboStep: 1,               // combo grows by 1 per consecutive serve
};

// Layout rectangles (logical 1280x720).
export const LAYOUT = {
  hud: { x: 0, y: 0, w: 1280, h: 64 },
  board: { x: 24, y: 72, w: 1232, h: 128 },
  ticketW: 392,
  ticketH: 112,
  ticketGap: 24,
  chopBoard: { x: 60, y: 236, w: 330, h: 210 },
  plate: { x: 490, y: 226, w: 300, h: 230 },
  stove: { x: 900, y: 236, w: 320, h: 210 },
  trash: { x: 800, y: 340, w: 84, h: 96 },
  counter: { x: 24, y: 500, w: 1232, h: 180 },
  binW: 186,
  binH: 148,
  binGap: 20,
};
