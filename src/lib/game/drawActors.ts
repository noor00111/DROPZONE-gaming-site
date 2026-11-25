import { TARGET_HP } from './constants';
import { targetCenterY } from './rules';
import type { Crate, Target, Tracer } from './types';

type Context = CanvasRenderingContext2D;

function drawParachute(context: Context) {
  context.fillStyle = '#ffb000';
  context.beginPath();
  context.ellipse(0, -62, 36, 22, 0, Math.PI, 0);
  context.fill();
  context.fillStyle = 'rgba(0, 0, 0, 0.18)';
  context.beginPath();
  context.ellipse(-12, -62, 12, 22, 0, Math.PI, Math.PI * 1.5);
  context.lineTo(-12, -62);
  context.fill();
  context.strokeStyle = 'rgba(232, 232, 232, 0.7)';
  context.lineWidth = 1.2;
  for (const cordX of [-36, -12, 12, 36]) {
    context.beginPath();
    context.moveTo(cordX, -62);
    context.lineTo(0, -20);
    context.stroke();
  }
}

export function drawCrate(context: Context, crate: Crate, landed: boolean) {
  context.save();
  context.translate(crate.x, crate.y);
  context.rotate(landed ? 0 : crate.angle);

  if (!landed) drawParachute(context);

  context.fillStyle = '#4b5320';
  context.strokeStyle = '#0e1110';
  context.lineWidth = 2.5;
  context.fillRect(-14, -22, 28, 22);
  context.strokeRect(-14, -22, 28, 22);
  context.fillStyle = '#ffb000';
  context.fillRect(-14, -14, 28, 3);
  context.restore();
}

export function drawSoldier(
  context: Context,
  gunX: number,
  gunY: number,
  groundY: number,
  aimX: number,
  aimY: number,
) {
  const footX = gunX;
  const footY = groundY;

  context.fillStyle = '#4b5320';
  context.fillRect(footX - 7, footY - 34, 14, 22);
  context.fillStyle = '#2b3014';
  context.fillRect(footX - 6, footY - 12, 5, 12);
  context.fillRect(footX + 1, footY - 12, 5, 12);
  context.fillStyle = '#c99a6e';
  context.beginPath();
  context.arc(footX, footY - 42, 8, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = '#3a4119';
  context.beginPath();
  context.arc(footX, footY - 44, 9, Math.PI, 0);
  context.fill();
  context.fillStyle = '#ffb000';
  context.fillRect(footX - 6, footY - 44, 12, 3);

  const angle = Math.atan2(aimY - gunY, aimX - gunX);
  context.save();
  context.translate(gunX, gunY);
  context.rotate(angle);
  context.fillStyle = '#1a1d1c';
  context.fillRect(0, -3, 26, 6);
  context.fillStyle = '#ffb000';
  context.fillRect(4, -1, 10, 2);
  context.restore();
}

function drawDrone(context: Context, target: Target, time: number) {
  context.translate(target.x, target.y + target.fall * 60);
  context.rotate(target.fall * 1.5);
  context.globalAlpha = 1 - target.fall;
  context.fillStyle = '#3a3f42';
  context.fillRect(-12, -5, 24, 10);
  context.fillStyle = '#d8342c';
  context.fillRect(-3, -2, 6, 4);
  context.strokeStyle = '#3a3f42';
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(-12, -4);
  context.lineTo(-20, -9);
  context.moveTo(12, -4);
  context.lineTo(20, -9);
  context.stroke();
  const rotor = Math.abs(Math.sin(time * 40)) * 10 + 2;
  context.fillStyle = 'rgba(232, 232, 232, 0.6)';
  context.fillRect(-20 - rotor / 2, -11, rotor, 2);
  context.fillRect(20 - rotor / 2, -11, rotor, 2);
}

function drawCardboard(context: Context, target: Target, groundY: number) {
  const top = groundY - target.y;
  context.translate(target.x, groundY);
  context.rotate(-target.fall * 1.4);
  context.translate(0, top - groundY);
  context.fillStyle = '#b48a55';
  context.strokeStyle = '#6b4f2a';
  context.lineWidth = 2;
  context.beginPath();
  context.arc(0, 10, 9, 0, Math.PI * 2);
  context.moveTo(-16, 54);
  context.lineTo(-14, 26);
  context.quadraticCurveTo(0, 18, 14, 26);
  context.lineTo(16, 54);
  context.closePath();
  context.fill();
  context.stroke();
  context.strokeStyle = '#d8342c';
  context.beginPath();
  context.arc(0, 38, 7, 0, Math.PI * 2);
  context.stroke();
  context.fillStyle = '#d8342c';
  context.beginPath();
  context.arc(0, 38, 2.5, 0, Math.PI * 2);
  context.fill();
}

function drawHealthBar(context: Context, target: Target, groundY: number) {
  const barY = targetCenterY(target, groundY) - 36;
  context.fillStyle = 'rgba(14, 17, 16, 0.8)';
  context.fillRect(target.x - 15, barY, 30, 4);
  context.fillStyle = '#ffb000';
  context.fillRect(target.x - 15, barY, 30 * (target.hp / TARGET_HP), 4);
}

export function drawTargets(context: Context, targets: Target[], groundY: number, time: number) {
  for (const target of targets) {
    context.save();
    if (target.kind === 'drone') drawDrone(context, target, time);
    else drawCardboard(context, target, groundY);
    context.restore();

    if (!target.dead && target.hp < TARGET_HP) drawHealthBar(context, target, groundY);
  }
}

function drawBlast(context: Context, tracer: Tracer) {
  const isFlare = tracer.blast > 60;
  context.fillStyle = isFlare ? 'rgba(255, 120, 40, 0.35)' : 'rgba(255, 210, 120, 0.3)';
  context.beginPath();
  context.arc(tracer.toX, tracer.toY, tracer.blast * (1.2 - tracer.life), 0, Math.PI * 2);
  context.fill();
}

function drawBulletLine(context: Context, tracer: Tracer) {
  context.strokeStyle = '#ffd36b';
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(tracer.fromX, tracer.fromY);
  context.lineTo(tracer.toX, tracer.toY);
  context.stroke();

  const angle = Math.atan2(tracer.toY - tracer.fromY, tracer.toX - tracer.fromX);
  const flashX = tracer.fromX + Math.cos(angle) * 26;
  const flashY = tracer.fromY + Math.sin(angle) * 26;
  context.fillStyle = '#fff3c4';
  context.beginPath();
  context.arc(flashX, flashY, 5, 0, Math.PI * 2);
  context.fill();
}

export function drawTracers(context: Context, tracers: Tracer[]) {
  for (const tracer of tracers) {
    context.globalAlpha = Math.min(1, tracer.life * 8);
    const isBlast = tracer.fromX === tracer.toX && tracer.fromY === tracer.toY;
    if (isBlast) drawBlast(context, tracer);
    else drawBulletLine(context, tracer);
  }
  context.globalAlpha = 1;
}

export function drawCrosshair(
  context: Context,
  x: number,
  y: number,
  weaponRange: number,
  reloading: boolean,
) {
  const gap = 4 + (11 - weaponRange) * 1.5;
  context.strokeStyle = reloading ? 'rgba(232, 232, 232, 0.4)' : '#ffb000';
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(x - gap - 8, y);
  context.lineTo(x - gap, y);
  context.moveTo(x + gap, y);
  context.lineTo(x + gap + 8, y);
  context.moveTo(x, y - gap - 8);
  context.lineTo(x, y - gap);
  context.moveTo(x, y + gap);
  context.lineTo(x, y + gap + 8);
  context.stroke();
}
