# Copper Ladle Kitchen — Make the best cooking game

[![Make the best cooking game](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![Rank](https://make.fun/badge/best-cooking-game-20261125-0137/claymoreth/cooking-game-entry/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![Reward](https://make.fun/badge/best-cooking-game-20261125-0137/claymoreth/cooking-game-entry/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

A complete, original 2D cooking game that runs offline in a desktop browser from static files — no network request, no build step. You run a small kitchen: orders land on the order board, you pick ingredients off the counter, chop them on the board, assemble the dish on the plate, and serve before the timer runs out.

Competition: https://make.fun/bounty/best-cooking-game-20261125-0137

## How to play

- **Orders** arrive on the order board (top). Each ticket shows the dish, its ingredients, a countdown bar and its coin value.
- **Pick** an ingredient from the counter (click it, or press keys `1`–`6`).
- **Chop** it on the chopping board (3 clicks, or press `Space` while it is on the board). Tomato, lettuce, mushroom and onion need chopping; cheese and pasta are ready to use.
- **Assemble** on the plate (click the plate, or press `Space`). The plate shows the dish mid-assembly.
- **Serve** when the plate matches an order — the ticket glows green with a SERVE button (or press `Space`). Serve with over half the time left for a PERFECT bonus.
- **Trash** (`X`) clears a plate that matches nothing. Wrong ingredients land on the plate but match no order.
- A 3-minute shift: orders arrive faster as it goes on, with a RUSH HOUR at 1:00 and 2:00 (three orders at once, 1.5x coins). Combo grows with consecutive serves and resets when an order expires.
- `P` pause, `R` restart, `M` mute.

## Recipes

| Dish | Ingredients | Coins |
| --- | --- | --- |
| Garden Salad | lettuce (chopped) + tomato (chopped) + cheese | 60 |
| Tomato Pasta | pasta + tomato (chopped) + cheese | 80 |
| Mushroom Soup | mushroom (chopped) + onion (chopped) | 70 |
| Cheesy Melt | cheese + tomato (chopped) + mushroom (chopped) | 90 |

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

Screenshot scenes (deterministic, frozen): `?shot=cover`, `?shot=play`, `?shot=serve`, `?shot=end`.

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `game/` and `screenshots/` to the output directory and writes `dossier.json` with `buildDossier` from `vendor/makefun-game.ts`.

## Structure

- `game/index.html` — 1280x720 canvas, loads the game as an ES module
- `game/src/config.js` — recipes, ingredients, colours, tuning
- `game/src/audio.js` — WebAudio synth (chop, ding, buzz, serve, tick)
- `game/src/input.js` — pointer + keyboard input
- `game/src/kitchen.js` — game state and rules (orders, plate, chop, serve, combo, rush)
- `game/src/render.js` — all canvas drawing
- `game/src/shots.js` — deterministic screenshot scenes
- `game/src/main.js` — game loop and wiring
- `screenshots/` — 4 renders of the game's own code (cover first)
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged
