# DROPZONE

> Mission briefing!

A fan-made battle royale website you **play** instead of scroll. A supply crate drifts over a 3D island, a live HUD wakes up, and the whole site stays locked until you hit **DEPLOY**. Jump, land, and fight your way down the page.


## The drop

| Stop               | What you do                                                                      |
| ------------------ | -------------------------------------------------------------------------------- |
| **Hero**           | 3D drop, compass, minimap, squad. `Space` hit · `F` fire · `R` reload · `M` mute |
| **Modes**          | Fan a hand of collectible cards, flip one, lock it in                            |
| **Map**            | Scout six drop spots or let **Hot drop** roll the dice                           |
| **Arsenal**        | Hold **Test fire** for full auto. Shells fly                                     |
| **Operators**      | Pick a soldier. Bramble is a bush                                                |
| **Season 01**      | Scroll the free pass, read the patch notes                                       |
| **Drop Challenge** | Steer a crate onto the pad, then defend it with your equipped weapon             |
| **Debrief**        | Your placement, XP and 12 achievements                                           |

Everything you pick follows you: mode → DEPLOY button, drop spot → minimap, weapon → ammo counter and mini-game, operator → squad list.

**Secret:** `↑ ↑ ↓ ↓ ← → ← → B A`, or tap the footer logo 7 times.

## Field notes

- **Content** lives in `src/data/`, **colors** in `src/styles/theme.css`, **difficulty** in `src/lib/game/constants.ts`.
- **Drop Challenge** is split up in `src/lib/game/`: `DropChallengeGame.ts` runs the game, `rules.ts` scores and checks hits, `spawners.ts` makes birds, coins and targets, and `drawWorld.ts` / `drawActors.ts` / `drawHud.ts` paint the canvas.
- **Optional assets** (everything has a built-in fallback): `public/images/{sky,mountains,treeline,fog}.png`, `public/models/crate.glb`, `public/audio/{ui-click,ui-hover,whoosh,ambient-drone,glitch,shot,unlock}.mp3`.
- Respects reduced motion, works on phones, and passes axe with 0 violations.

**Stack:** Next.js 15 · React 19 · Three.js · GSAP · Zustand · Tailwind v4 · lucide-react

## Gear up

```bash
npm install
npm run dev
```

<sub>Fan-made concept. Not a real game or studio. All names and art are original.</sub>
