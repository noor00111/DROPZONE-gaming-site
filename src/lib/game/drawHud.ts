import { DEFEND_TIME, ROUNDS } from './constants';
import type { HudInfo } from './types';

type Context = CanvasRenderingContext2D;

function drawTitleScreen(context: Context, hud: HudInfo) {
  const center = hud.worldWidth / 2;
  const top = hud.height * 0.36;
  context.textAlign = 'center';
  context.fillStyle = '#ffb000';
  context.font = `700 54px ${hud.font}`;
  context.fillText('DROP CHALLENGE', center, top);
  context.fillStyle = '#e8e8e8';
  context.font = `600 20px ${hud.font}`;
  context.fillText('PRESS SPACE OR TAP TO DROP', center, top + 44);
  context.fillStyle = 'rgba(232, 232, 232, 0.6)';
  context.font = `500 16px ${hud.font}`;
  context.fillText('1. Steer the crate onto the pad', center, top + 80);
  context.fillText(`2. Hold the drop with your ${hud.weapon.name}`, center, top + 104);
}

function drawScore(context: Context, hud: HudInfo) {
  context.textAlign = 'left';
  context.fillStyle = 'rgba(232, 232, 232, 0.6)';
  context.font = `600 15px ${hud.font}`;
  context.fillText(`ROUND ${Math.min(hud.round, ROUNDS)}/${ROUNDS}`, 20, 30);
  context.fillStyle = '#ffb000';
  context.font = `700 26px ${hud.font}`;
  context.fillText(`${hud.totalScore} PTS`, 20, 58);
}

function drawDefendTimer(context: Context, hud: HudInfo) {
  const right = hud.worldWidth - 20;
  context.textAlign = 'right';
  context.fillStyle = 'rgba(232, 232, 232, 0.6)';
  context.font = `600 15px ${hud.font}`;
  context.fillText('HOLD THE DROP', right, 30);
  context.fillStyle = hud.phaseTimer < 2 ? '#d8342c' : '#e8e8e8';
  context.font = `700 26px ${hud.font}`;
  context.fillText(`${hud.phaseTimer.toFixed(1)}s`, right, 58);
}

function drawWindMeter(context: Context, hud: HudInfo) {
  const right = hud.worldWidth - 20;
  context.textAlign = 'right';
  context.fillStyle = 'rgba(232, 232, 232, 0.6)';
  context.font = `600 15px ${hud.font}`;
  context.fillText('WIND', right, 30);
  const count = 1 + Math.floor(Math.abs(hud.wind) / 30);
  const arrows = (hud.wind > 0 ? '→' : '←').repeat(count);
  context.fillStyle = '#e8e8e8';
  context.font = `700 22px ${hud.font}`;
  context.fillText(`${arrows} ${Math.round(Math.abs(hud.wind))}`, right, 58);
}

function drawAmmoBox(context: Context, hud: HudInfo) {
  const height = hud.height;
  context.textAlign = 'left';
  context.fillStyle = 'rgba(14, 17, 16, 0.75)';
  context.fillRect(12, height - 52, 230, 40);
  context.fillStyle = 'rgba(232, 232, 232, 0.6)';
  context.font = `600 13px ${hud.font}`;
  context.fillText(hud.weapon.name.toUpperCase(), 22, height - 36);
  context.font = `700 18px ${hud.font}`;
  if (hud.reloadTimer > 0) {
    context.fillStyle = '#d8342c';
    context.fillText('RELOADING…', 22, height - 17);
  } else {
    context.fillStyle = hud.ammo === 0 ? '#d8342c' : '#ffb000';
    context.fillText(`${hud.ammo} / ${hud.weapon.mag}`, 22, height - 17);
  }
}

function drawLandedBanner(context: Context, hud: HudInfo) {
  const center = hud.worldWidth / 2;
  context.fillStyle = hud.lastLabelColor;
  context.font = `700 48px ${hud.font}`;
  context.fillText(hud.lastLabel, center, hud.height * 0.4);
  if (hud.lastLabel !== 'SPLASH!') {
    context.fillStyle = '#e8e8e8';
    context.font = `600 18px ${hud.font}`;
    context.fillText('GET READY TO HOLD THE DROP!', center, hud.height * 0.4 + 34);
  }
}

function drawFireAtWillBanner(context: Context, hud: HudInfo) {
  context.fillStyle = '#ffb000';
  context.font = `700 40px ${hud.font}`;
  context.fillText('FIRE AT WILL!', hud.worldWidth / 2, hud.height * 0.3);
}

function drawRoundClearBanner(context: Context, hud: HudInfo) {
  const center = hud.worldWidth / 2;
  context.fillStyle = '#e8e8e8';
  context.font = `600 18px ${hud.font}`;
  context.fillText(`ROUND ${hud.round} CLEAR`, center, hud.height * 0.38);
  context.fillStyle = '#ffb000';
  context.font = `700 44px ${hud.font}`;
  const sign = hud.roundScore >= 0 ? '+' : '';
  context.fillText(`${sign}${hud.roundScore} PTS`, center, hud.height * 0.38 + 46);
}

function drawGameOver(context: Context, hud: HudInfo) {
  const center = hud.worldWidth / 2;
  const top = hud.height * 0.34;
  context.fillStyle = 'rgba(14, 17, 16, 0.6)';
  context.fillRect(0, 0, hud.worldWidth, hud.height);
  context.textAlign = 'center';
  context.fillStyle = '#e8e8e8';
  context.font = `600 20px ${hud.font}`;
  context.fillText('RUN COMPLETE', center, top);
  context.fillStyle = '#ffb000';
  context.font = `700 64px ${hud.font}`;
  context.fillText(`${hud.totalScore} PTS`, center, top + 64);
  context.fillStyle = 'rgba(232, 232, 232, 0.7)';
  context.font = `600 18px ${hud.font}`;
  context.fillText('PRESS SPACE OR TAP TO GO AGAIN', center, top + 104);
}

export function drawHud(context: Context, hud: HudInfo) {
  if (hud.phase === 'title') {
    drawTitleScreen(context, hud);
    return;
  }

  drawScore(context, hud);
  if (hud.phase === 'defend') {
    drawDefendTimer(context, hud);
    drawAmmoBox(context, hud);
  } else {
    drawWindMeter(context, hud);
  }

  context.textAlign = 'center';
  if (hud.phase === 'landed') drawLandedBanner(context, hud);
  if (hud.phase === 'defend' && hud.phaseTimer > DEFEND_TIME - 0.8) {
    drawFireAtWillBanner(context, hud);
  }
  if (hud.phase === 'cleared') drawRoundClearBanner(context, hud);
  if (hud.phase === 'over') drawGameOver(context, hud);
}
