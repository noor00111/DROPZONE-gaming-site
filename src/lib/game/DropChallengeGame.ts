import {BIRD_PENALTY, CARDBOARD_POINTS, CLEARED_PAUSE, COIN_POINTS, COINS_PER_ROUND, DEFEND_TIME, DRAG, DRONE_POINTS, FALL_TIME, FALL_TIME_STEP, ISLAND_LEFT, LANDED_PAUSE, PAD_SHRINK,
  PAD_START_WIDTH, RELOAD_TIME, ROUNDS, SEAGULL_PENALTY, SPAWN_EVERY, STARTING_WEAPON, STEER_FORCE, TARGET_HP, WIND_MAX, WIND_STEP} from './constants';
import { drawCrate, drawCrosshair, drawSoldier, drawTargets, drawTracers } from './drawActors';
import { drawHud } from './drawHud';
import {drawBirds, drawClouds, drawCoins, drawIsland, drawPad, drawPopups, drawSky, drawWindStreaks} from './drawWorld';
import { random } from './random';
import { blastRadiusFor, isInsideTarget, isNearTarget, scoreLanding, targetCenterY } from './rules';
import { makeBird, makeCloud, makeCoin, makeTarget } from './spawners';
import type {Bird, Cloud, Coin, Crate, GameEvents, GameWeapon, Phase, Popup, Target, Tracer} from './types';

export class DropChallengeGame {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private events: GameEvents;
  private font = 'sans-serif';

  private worldWidth = 800;
  private height = 500;
  private scale = 1;

  private phase: Phase = 'title';
  private round = 0;
  private totalScore = 0;
  private roundScore = 0;
  private lastLabel = '';
  private lastLabelColor = '#e8e8e8';
  private phaseTimer = 0;

  private crate: Crate = { x: 400, y: 40, vx: 0, angle: 0 };
  private padX = 400;
  private padWidth = PAD_START_WIDTH;
  private wind = 0;
  private windTarget = 0;
  private windTimer = 0;
  private birds: Bird[] = [];
  private coins: Coin[] = [];
  private popups: Popup[] = [];
  private clouds: Cloud[] = [];

  private weapon: GameWeapon = STARTING_WEAPON;
  private ammo = STARTING_WEAPON.mag;
  private reloadTimer = 0;
  private cooldown = 0;
  private triggerDown = false;
  private spawnTimer = 0;
  private targets: Target[] = [];
  private tracers: Tracer[] = [];

  private steer = 0;
  private pointerX: number | null = null;
  private pointerY: number | null = null;

  private frameId = 0;
  private lastTime = 0;
  private time = 0;
  private paused = false;
  private disposed = false;

  constructor(canvas: HTMLCanvasElement, events: GameEvents) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('2D canvas not supported');
    this.context = context;
    this.events = events;

    this.font = getComputedStyle(document.body).fontFamily || 'sans-serif';

    this.resize();
    for (let i = 0; i < 6; i++) {
      this.clouds.push(makeCloud(this.worldWidth));
    }
    this.frameId = requestAnimationFrame(this.loop);
  }

  start() {
    if (this.isPlaying()) return;
    this.round = 0;
    this.totalScore = 0;
    this.nextRound();
  }

  isPlaying(): boolean {
    return this.phase !== 'title' && this.phase !== 'over';
  }

  isDefending(): boolean {
    return this.phase === 'defend';
  }

  setWeapon(weapon: GameWeapon) {
    this.weapon = weapon;
    this.ammo = weapon.mag;
    this.reloadTimer = 0;
  }

  setSteer(direction: number) {
    this.steer = direction;
  }

  setPointer(x: number | null, y: number | null = null) {
    this.pointerX = x === null ? null : x / this.scale;
    this.pointerY = y === null ? null : y / this.scale;
  }

  setTrigger(down: boolean) {
    this.triggerDown = down;
  }

  fireAtNearest() {
    if (this.phase !== 'defend') return;
    const target = this.nearestTarget();
    if (target) this.shoot(target.x, targetCenterY(target, this.groundY));
    else this.shoot(this.crate.x + random(-100, 100), this.groundY - 160);
  }

  reload() {
    if (this.phase !== 'defend' || this.reloadTimer > 0 || this.ammo === this.weapon.mag) return;
    this.reloadTimer = RELOAD_TIME;
  }

  setPaused(paused: boolean) {
    this.paused = paused;
  }

  resize = () => {
    const width = this.canvas.clientWidth || 800;
    const height = this.canvas.clientHeight || 500;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(width * pixelRatio);
    this.canvas.height = Math.round(height * pixelRatio);
    this.worldWidth = width < 640 ? 480 : 800;
    this.scale = width / this.worldWidth;
    this.height = height / this.scale;
    this.context.setTransform(pixelRatio * this.scale, 0, 0, pixelRatio * this.scale, 0, 0);
  };

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.frameId);
  }

  private get groundY(): number {
    return this.height - 70;
  }

  private get islandRight(): number {
    return this.worldWidth - ISLAND_LEFT;
  }

  private get gunX(): number {
    return this.crate.x + 26;
  }

  private get gunY(): number {
    return this.groundY - 26;
  }

  private nearestTarget(): Target | null {
    let best: Target | null = null;
    let bestDistance = Infinity;
    for (const target of this.targets) {
      if (target.dead) continue;
      const centerY = targetCenterY(target, this.groundY);
      const distance = Math.hypot(target.x - this.gunX, centerY - this.gunY);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = target;
      }
    }
    return best;
  }

  private nextRound() {
    this.round += 1;
    this.roundScore = 0;
    this.phase = 'falling';
    this.crate = { x: this.worldWidth / 2 + random(-120, 120), y: 30, vx: 0, angle: 0 };
    this.targets = [];
    this.tracers = [];

    this.padWidth = (PAD_START_WIDTH - (this.round - 1) * PAD_SHRINK) * (this.worldWidth / 800);
    this.padX = random(ISLAND_LEFT + this.padWidth, this.islandRight - this.padWidth);
    this.wind = 0;
    this.windTarget = 0;
    this.windTimer = 0;

    this.coins = [];
    for (let i = 0; i < COINS_PER_ROUND; i++) {
      this.coins.push(makeCoin(this.worldWidth, this.groundY));
    }

    this.birds = [];
    const birdCount = 1 + Math.floor(this.round / 2);
    for (let i = 0; i < birdCount; i++) {
      this.birds.push(makeBird(this.worldWidth, this.groundY));
    }
  }

  private land() {
    const result = scoreLanding(this.crate.x, this.padX, this.padWidth, this.worldWidth);

    this.addScore(result.points);
    this.lastLabel = result.label;
    if (result.isSplash) this.lastLabelColor = '#38bdf8';
    else if (result.isPerfect) this.lastLabelColor = '#ffb000';
    else this.lastLabelColor = '#e8e8e8';

    this.crate.y = result.isSplash ? this.groundY + 18 : this.groundY;
    this.crate.vx = 0;
    this.phase = 'landed';
    this.phaseTimer = LANDED_PAUSE;
    this.events.onLand(result);
  }

  private startDefend() {
    this.phase = 'defend';
    this.phaseTimer = DEFEND_TIME;
    this.spawnTimer = 0.3;
    this.ammo = this.weapon.mag;
    this.reloadTimer = 0;
    this.cooldown = 0;
    this.birds = [makeBird(this.worldWidth, this.groundY)];
  }

  private finishRound() {
    this.phase = 'cleared';
    this.phaseTimer = CLEARED_PAUSE;
    this.triggerDown = false;
    this.events.onRoundCleared(this.roundScore);
  }

  private addScore(points: number) {
    this.roundScore += points;
    this.totalScore = Math.max(0, this.totalScore + points);
  }

  private addPopup(x: number, y: number, text: string, color: string, life: number) {
    this.popups.push({ x, y, text, color, life });
  }

  private shoot(aimX: number, aimY: number) {
    if (this.reloadTimer > 0 || this.cooldown > 0) return;
    if (this.ammo <= 0) {
      this.events.onEmpty();
      this.reloadTimer = RELOAD_TIME;
      return;
    }

    this.ammo -= 1;
    this.cooldown = 1 / (this.weapon.fireRate * 1.3);
    this.events.onShot();

    const spread = (11 - this.weapon.range) * 3;
    const angle = random(0, Math.PI * 2);
    const hitX = aimX + Math.cos(angle) * random(0, spread);
    const hitY = aimY + Math.sin(angle) * random(0, spread);
    const blast = blastRadiusFor(this.weapon.id);

    this.tracers.push({
      fromX: this.gunX,
      fromY: this.gunY,
      toX: hitX,
      toY: hitY,
      life: 0.12,
      blast,
    });
    if (blast > 0) {
      this.tracers.push({ fromX: hitX, fromY: hitY, toX: hitX, toY: hitY, life: 0.35, blast });
    }

    this.hitTargets(hitX, hitY, blast);
    this.hitSeagulls(hitX, hitY, blast);
  }

  private hitTargets(hitX: number, hitY: number, blast: number) {
    for (const target of this.targets) {
      if (target.dead) continue;
      const isHit =
        blast > 0
          ? isNearTarget(target, hitX, hitY, blast, this.groundY)
          : isInsideTarget(target, hitX, hitY, this.groundY);
      if (!isHit) continue;

      target.hp -= blast > 0 ? TARGET_HP : this.weapon.damage;
      const popupY = targetCenterY(target, this.groundY) - 30;
      if (target.hp <= 0) {
        target.dead = true;
        const points = target.kind === 'drone' ? DRONE_POINTS : CARDBOARD_POINTS;
        this.addScore(points);
        this.addPopup(target.x, popupY, `+${points}`, '#ffb000', 0.9);
        this.events.onKill();
      } else {
        this.addPopup(target.x, popupY, 'HIT', '#e8e8e8', 0.5);
      }
      if (blast === 0) break;
    }
  }

  private hitSeagulls(hitX: number, hitY: number, blast: number) {
    const hitRadius = blast > 0 ? blast : 18;
    for (const bird of this.birds) {
      if (bird.hit) continue;
      if (Math.hypot(bird.x - hitX, bird.y - hitY) < hitRadius) {
        bird.hit = true;
        this.addScore(-SEAGULL_PENALTY);
        this.addPopup(bird.x, bird.y - 20, `-${SEAGULL_PENALTY} NOT THE BIRDS`, '#d8342c', 1.2);
        this.events.onSeagullShot();
      }
    }
  }

  private loop = (now: number) => {
    if (this.disposed) return;
    let delta = (now - this.lastTime) / 1000;
    this.lastTime = now;
    if (delta > 0.05) delta = 0.05;

    if (!this.paused) {
      this.time += delta;
      this.update(delta);
      this.draw();
    }
    this.frameId = requestAnimationFrame(this.loop);
  };

  private update(delta: number) {
    this.updateEffects(delta);

    if (this.phase === 'landed') {
      this.phaseTimer -= delta;
      if (this.phaseTimer <= 0) {
        if (this.lastLabel === 'SPLASH!') this.finishRound();
        else this.startDefend();
      }
      return;
    }

    if (this.phase === 'cleared') {
      this.phaseTimer -= delta;
      if (this.phaseTimer <= 0) {
        if (this.round >= ROUNDS) {
          this.phase = 'over';
          this.events.onGameOver(this.totalScore);
        } else {
          this.nextRound();
        }
      }
      return;
    }

    if (this.phase === 'falling') this.updateFalling(delta);
    if (this.phase === 'defend') this.updateDefend(delta);
  }

  private updateEffects(delta: number) {
    for (const cloud of this.clouds) {
      cloud.x += (8 + this.wind * 0.3) * delta;
      if (cloud.x > this.worldWidth + 100) cloud.x = -100;
      if (cloud.x < -100) cloud.x = this.worldWidth + 100;
    }

    for (const popup of this.popups) {
      popup.y -= 30 * delta;
      popup.life -= delta;
    }
    this.popups = this.popups.filter((popup) => popup.life > 0);

    for (const tracer of this.tracers) tracer.life -= delta;
    this.tracers = this.tracers.filter((tracer) => tracer.life > 0);
  }

  private updateFalling(delta: number) {
    this.updateWind(delta);
    this.moveCrate(delta);
    this.collectCoins();
    this.moveBirdsWhileFalling(delta);
    if (this.crate.y >= this.groundY) this.land();
  }

  private updateWind(delta: number) {
    const windMax = WIND_MAX + (this.round - 1) * WIND_STEP;
    this.windTimer -= delta;
    if (this.windTimer <= 0) {
      this.windTarget = random(-windMax, windMax);
      this.windTimer = random(1.4, 2.6);
    }
    this.wind += (this.windTarget - this.wind) * Math.min(1, delta * 1.5);
  }

  private moveCrate(delta: number) {
    let input = this.steer;
    if (this.pointerX !== null && input === 0) {
      input = Math.max(-1, Math.min(1, (this.pointerX - this.crate.x) / 60));
    }

    const crate = this.crate;
    crate.vx += (input * STEER_FORCE + this.wind * 2.2) * delta;
    crate.vx -= crate.vx * DRAG * delta;
    crate.x += crate.vx * delta;
    crate.x = Math.max(20, Math.min(this.worldWidth - 20, crate.x));
    const fallTime = FALL_TIME - (this.round - 1) * FALL_TIME_STEP;
    crate.y += ((this.groundY - 30) / fallTime) * delta;
    crate.angle = Math.max(-0.5, Math.min(0.5, crate.vx / 260));
  }

  private collectCoins() {
    const crate = this.crate;
    for (const coin of this.coins) {
      if (coin.taken) continue;
      if (Math.hypot(coin.x - crate.x, coin.y - (crate.y - 20)) < 30) {
        coin.taken = true;
        this.addScore(COIN_POINTS);
        this.addPopup(coin.x, coin.y, `+${COIN_POINTS}`, '#ffb000', 1);
        this.events.onCoin();
      }
    }
  }

  private moveBirdsWhileFalling(delta: number) {
    const crate = this.crate;
    for (const bird of this.birds) {
      bird.x += bird.speed * delta;
      if (!bird.hit && Math.hypot(bird.x - crate.x, bird.y - (crate.y - 30)) < 34) {
        bird.hit = true;
        crate.vx += bird.speed > 0 ? 260 : -260;
        this.addScore(-BIRD_PENALTY);
        this.addPopup(crate.x, crate.y - 70, `-${BIRD_PENALTY}`, '#d8342c', 1);
        this.events.onBird();
      }
    }
  }

  private updateDefend(delta: number) {
    this.phaseTimer -= delta;
    if (this.phaseTimer <= 0) {
      this.finishRound();
      return;
    }

    this.updateGun(delta);
    this.updateSpawning(delta);
    this.moveTargets(delta);
    this.moveBirdsWhileDefending(delta);
  }

  private updateGun(delta: number) {
    this.cooldown = Math.max(0, this.cooldown - delta);
    if (this.reloadTimer > 0) {
      this.reloadTimer -= delta;
      if (this.reloadTimer <= 0) {
        this.reloadTimer = 0;
        this.ammo = this.weapon.mag;
      }
    }

    if (this.triggerDown && this.pointerX !== null && this.pointerY !== null) {
      this.shoot(this.pointerX, this.pointerY);
    }
  }

  private updateSpawning(delta: number) {
    this.spawnTimer -= delta;
    if (this.spawnTimer <= 0) {
      this.targets.push(makeTarget(this.round, this.worldWidth, this.groundY, this.crate.x));
      this.spawnTimer = SPAWN_EVERY - this.round * 0.06;
    }
  }

  private moveTargets(delta: number) {
    for (const target of this.targets) {
      if (target.dead) {
        target.fall = Math.min(1, target.fall + delta * 3);
        continue;
      }
      if (target.kind === 'drone') {
        target.x += target.speed * delta;
        target.y += Math.sin(this.time * 4 + target.x * 0.02) * 20 * delta;
      } else {
        target.life -= delta;
        const goal = target.life > 0 ? 54 : -2;
        target.y += (goal - target.y) * Math.min(1, delta * 10);
      }
    }

    this.targets = this.targets.filter((target) => {
      if (target.dead) return target.fall < 1;
      if (target.kind === 'drone') return target.x > -60 && target.x < this.worldWidth + 60;
      return target.life > 0 || target.y > 0;
    });
  }

  private moveBirdsWhileDefending(delta: number) {
    for (const bird of this.birds) bird.x += bird.speed * delta;
    const allGone = this.birds.every((bird) => bird.x < -60 || bird.x > this.worldWidth + 60);
    if (allGone) this.birds = [makeBird(this.worldWidth, this.groundY)];
  }

  private draw() {
    const context = this.context;
    const phase = this.phase;
    const groundY = this.groundY;

    drawSky(context, this.worldWidth, this.height);
    drawClouds(context, this.clouds);
    if (phase === 'falling') {
      drawWindStreaks(context, this.wind, this.time, this.worldWidth, groundY);
    }
    drawIsland(context, this.worldWidth, this.height, groundY);
    if (phase !== 'title') {
      drawPad(context, this.padX, this.padWidth, groundY, this.wind, this.time);
    }
    if (phase === 'falling') drawCoins(context, this.coins, this.time);
    if (phase === 'falling' || phase === 'defend') {
      drawBirds(context, this.birds, this.time, phase === 'defend');
    }

    const showDefenders = phase === 'defend' || phase === 'cleared';
    if (showDefenders) drawTargets(context, this.targets, groundY, this.time);
    if (phase !== 'title') drawCrate(context, this.crate, phase !== 'falling');
    if (showDefenders && this.lastLabel !== 'SPLASH!') {
      const aimX = this.pointerX ?? this.gunX + 100;
      const aimY = this.pointerY ?? this.gunY - 40;
      drawSoldier(context, this.gunX, this.gunY, groundY, aimX, aimY);
    }
    drawTracers(context, this.tracers);
    drawPopups(context, this.popups, this.font);

    if (phase === 'defend' && this.pointerX !== null && this.pointerY !== null) {
      drawCrosshair(context, this.pointerX, this.pointerY, this.weapon.range, this.reloadTimer > 0);
    }

    drawHud(context, {
      phase,
      round: this.round,
      totalScore: this.totalScore,
      roundScore: this.roundScore,
      wind: this.wind,
      phaseTimer: this.phaseTimer,
      weapon: this.weapon,
      ammo: this.ammo,
      reloadTimer: this.reloadTimer,
      lastLabel: this.lastLabel,
      lastLabelColor: this.lastLabelColor,
      worldWidth: this.worldWidth,
      height: this.height,
      font: this.font,
    });
  }
}
