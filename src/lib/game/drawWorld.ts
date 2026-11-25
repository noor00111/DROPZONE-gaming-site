import { ISLAND_LEFT } from './constants';
import type { Bird, Cloud, Coin, Popup } from './types';

type Context = CanvasRenderingContext2D;

export function drawSky(context: Context, worldWidth: number, height: number) {
  const sky = context.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, '#121514');
  sky.addColorStop(0.7, '#3a3220');
  sky.addColorStop(1, '#5a4524');
  context.fillStyle = sky;
  context.fillRect(0, 0, worldWidth, height);
}

export function drawClouds(context: Context, clouds: Cloud[]) {
  context.fillStyle = 'rgba(232, 232, 232, 0.05)';
  for (const cloud of clouds) {
    context.beginPath();
    context.ellipse(cloud.x, cloud.y, cloud.size, cloud.size * 0.35, 0, 0, Math.PI * 2);
    context.fill();
  }
}

export function drawWindStreaks(
  context: Context,
  wind: number,
  time: number,
  worldWidth: number,
  groundY: number,
) {
  context.strokeStyle = 'rgba(232, 232, 232, 0.18)';
  context.lineWidth = 1.5;
  const streakCount = Math.round(Math.abs(wind) / 8);
  for (let i = 0; i < streakCount; i++) {
    const y = 60 + ((i * 97) % (groundY - 100));
    const x = (((i * 173 + time * wind * 4) % worldWidth) + worldWidth) % worldWidth;
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x - Math.sign(wind) * 26, y);
    context.stroke();
  }
}

function drawRoundedHill(
  context: Context,
  left: number,
  right: number,
  top: number,
  bulge: number,
  bottom: number,
) {
  context.beginPath();
  context.moveTo(left, bottom);
  context.lineTo(left, top + bulge);
  context.quadraticCurveTo(left, top, left + 40, top);
  context.lineTo(right - 40, top);
  context.quadraticCurveTo(right, top, right, top + bulge);
  context.lineTo(right, bottom);
  context.fill();
}

export function drawIsland(context: Context, worldWidth: number, height: number, groundY: number) {
  const islandRight = worldWidth - ISLAND_LEFT;
  context.fillStyle = '#16312f';
  context.fillRect(0, groundY - 6, worldWidth, height - groundY + 6);
  context.fillStyle = '#c2a96a';
  drawRoundedHill(context, ISLAND_LEFT - 8, islandRight + 8, groundY - 2, 20, height);
  context.fillStyle = '#4b5320';
  drawRoundedHill(context, ISLAND_LEFT, islandRight, groundY + 4, 16, height);
}

export function drawPad(
  context: Context,
  padX: number,
  padWidth: number,
  groundY: number,
  wind: number,
  time: number,
) {
  const rings = [
    { width: padWidth, color: 'rgba(255, 176, 0, 0.35)' },
    { width: padWidth * 0.6, color: '#0e1110' },
    { width: padWidth * 0.25, color: '#ffb000' },
  ];
  for (const ring of rings) {
    context.fillStyle = ring.color;
    context.beginPath();
    context.ellipse(padX, groundY + 4, ring.width / 2, 7, 0, 0, Math.PI * 2);
    context.fill();
  }

  const poleX = padX + padWidth / 2 + 6;
  context.strokeStyle = '#e8e8e8';
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(poleX, groundY + 2);
  context.lineTo(poleX, groundY - 34);
  context.stroke();

  context.fillStyle = '#d8342c';
  context.beginPath();
  const flagWave = Math.sin(time * 6) * 3;
  context.moveTo(poleX, groundY - 34);
  context.lineTo(poleX + Math.sign(wind || 1) * 18, groundY - 29 + flagWave);
  context.lineTo(poleX, groundY - 24);
  context.fill();
}

export function drawCoins(context: Context, coins: Coin[], time: number) {
  for (const coin of coins) {
    if (coin.taken) continue;
    const spin = Math.abs(Math.sin(time * 3 + coin.x));
    context.fillStyle = '#ffb000';
    context.shadowColor = 'rgba(255, 176, 0, 0.8)';
    context.shadowBlur = 12;
    context.beginPath();
    context.moveTo(coin.x, coin.y - 10);
    context.lineTo(coin.x + 8 * spin, coin.y);
    context.lineTo(coin.x, coin.y + 10);
    context.lineTo(coin.x - 8 * spin, coin.y);
    context.fill();
    context.shadowBlur = 0;
  }
}

export function drawBirds(context: Context, birds: Bird[], time: number, hideHitBirds: boolean) {
  context.strokeStyle = '#e8e8e8';
  context.lineWidth = 2.5;
  for (const bird of birds) {
    if (bird.hit && hideHitBirds) continue;
    const flap = Math.sin(time * 12 + bird.x * 0.05) * 7;
    context.beginPath();
    context.moveTo(bird.x - 14, bird.y - flap);
    context.quadraticCurveTo(bird.x - 6, bird.y - 2, bird.x, bird.y + 3);
    context.quadraticCurveTo(bird.x + 6, bird.y - 2, bird.x + 14, bird.y - flap);
    context.stroke();
  }
}

export function drawPopups(context: Context, popups: Popup[], font: string) {
  context.textAlign = 'center';
  for (const popup of popups) {
    context.globalAlpha = Math.min(1, popup.life * 2);
    context.fillStyle = popup.color;
    context.font = `700 20px ${font}`;
    context.fillText(popup.text, popup.x, popup.y);
  }
  context.globalAlpha = 1;
}
