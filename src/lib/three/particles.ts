import * as THREE from 'three';

const AREA_WIDTH = 30;
const AREA_HEIGHT = 18;
const AREA_DEPTH = 18;
const EMBER_COLOR = new THREE.Color(0xffb000);
const DUST_COLOR = new THREE.Color(0xc9c4b0);
const EMBER_CHANCE = 0.3;
const EMBER_BRIGHTNESS = 2.2;

export type Particles = {
  points: THREE.Points;
  speeds: Float32Array;
  offsets: Float32Array;
  count: number;
};

export function createParticles(count: number): Particles {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const speeds = new Float32Array(count);
  const offsets = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * AREA_WIDTH;
    positions[i * 3 + 1] = (Math.random() - 0.5) * AREA_HEIGHT;
    positions[i * 3 + 2] = (Math.random() - 0.5) * AREA_DEPTH;

    const isEmber = Math.random() < EMBER_CHANCE;
    const color = isEmber ? EMBER_COLOR : DUST_COLOR;
    const brightness = isEmber ? EMBER_BRIGHTNESS : 1;
    colors[i * 3 + 0] = color.r * brightness;
    colors[i * 3 + 1] = color.g * brightness;
    colors[i * 3 + 2] = color.b * brightness;

    speeds[i] = 0.3 + Math.random() * 0.9;
    offsets[i] = Math.random() * 100;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.12,
    map: makeDotTexture(),
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });

  const points = new THREE.Points(geometry, material);
  points.name = 'particles';
  return { points, speeds, offsets, count };
}

export function updateParticles(particles: Particles, deltaSeconds: number, timeSeconds: number) {
  const positionAttribute = particles.points.geometry.getAttribute('position');
  const positions = positionAttribute.array as Float32Array;
  const top = AREA_HEIGHT / 2;

  for (let i = 0; i < particles.count; i++) {
    const yIndex = i * 3 + 1;
    const xIndex = i * 3 + 0;

    positions[yIndex] += particles.speeds[i] * deltaSeconds;
    positions[xIndex] += Math.sin(timeSeconds * 0.5 + particles.offsets[i]) * 0.003;

    if (positions[yIndex] > top) {
      positions[yIndex] = -top;
    }
  }

  positionAttribute.needsUpdate = true;
}

function makeDotTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.4, 'rgba(255,255,255,0.5)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
  }
  return new THREE.CanvasTexture(canvas);
}
