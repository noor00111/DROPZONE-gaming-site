import * as THREE from 'three';

export type ParallaxLayer = {
  name: string;
  mesh: THREE.Mesh;
  material: THREE.MeshBasicMaterial;
  driftSpeed: number;
};

type LayerSettings = {
  name: string;
  imageUrl: string;
  z: number;
  y: number;
  opacity: number;
  useFog: boolean;
  driftSpeed: number;
  paintFallback: (canvas: HTMLCanvasElement) => void;
};

const LAYER_SETTINGS: LayerSettings[] = [
  {
    name: 'sky',
    imageUrl: '/images/sky.png',
    z: -60,
    y: 2,
    opacity: 1,
    useFog: false,
    driftSpeed: 0,
    paintFallback: paintSky,
  },
  {
    name: 'mountains',
    imageUrl: '/images/mountains.png',
    z: -42,
    y: -1,
    opacity: 1,
    useFog: true,
    driftSpeed: 0,
    paintFallback: paintMountains,
  },
  {
    name: 'treeline',
    imageUrl: '/images/treeline.png',
    z: -24,
    y: -3,
    opacity: 1,
    useFog: true,
    driftSpeed: 0,
    paintFallback: paintTreeline,
  },
  {
    name: 'fog',
    imageUrl: '/images/fog.png',
    z: -9,
    y: -1,
    opacity: 0.35,
    useFog: false,
    driftSpeed: 0.004,
    paintFallback: paintFog,
  },
];

export function createParallaxLayers(
  camera: THREE.PerspectiveCamera,
  textureLoader: THREE.TextureLoader,
): { group: THREE.Group; layers: ParallaxLayer[] } {
  const group = new THREE.Group();
  group.name = 'parallax-layers';
  const layers: ParallaxLayer[] = [];

  for (let i = 0; i < LAYER_SETTINGS.length; i++) {
    const settings = LAYER_SETTINGS[i];

    const distance = camera.position.z - settings.z;
    const fovInRadians = THREE.MathUtils.degToRad(camera.fov);
    const height = 2 * Math.tan(fovInRadians / 2) * distance * 1.7;
    const width = height * 2.6;

    const fallbackTexture = makeCanvasTexture(settings.paintFallback);

    const material = new THREE.MeshBasicMaterial({
      map: fallbackTexture,
      transparent: true,
      opacity: settings.opacity,
      depthWrite: false,
      fog: settings.useFog,
      toneMapped: false,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
    mesh.position.set(0, settings.y, settings.z);
    mesh.renderOrder = i;
    mesh.name = settings.name;
    group.add(mesh);

    layers.push({ name: settings.name, mesh, material, driftSpeed: settings.driftSpeed });

    textureLoader.load(
      settings.imageUrl,
      (imageTexture) => {
        imageTexture.colorSpace = THREE.SRGBColorSpace;
        imageTexture.wrapS = THREE.RepeatWrapping;
        material.map = imageTexture;
        material.needsUpdate = true;
        fallbackTexture.dispose();
      },
      undefined,
      () => {},
    );
  }

  return { group, layers };
}

export function updateParallaxLayers(layers: ParallaxLayer[], deltaSeconds: number) {
  for (const layer of layers) {
    if (layer.driftSpeed !== 0 && layer.material.map) {
      layer.material.map.offset.x += layer.driftSpeed * deltaSeconds;
    }
  }
}

function makeCanvasTexture(paint: (canvas: HTMLCanvasElement) => void): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  paint(canvas);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  return texture;
}

function paintSky(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#0e1110');
  gradient.addColorStop(0.45, '#262a20');
  gradient.addColorStop(0.7, '#7a5418');
  gradient.addColorStop(1, '#2e2a1e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function paintMountains(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  drawRidge(ctx, canvas, 0.55, 70, '#33362a');
  drawRidge(ctx, canvas, 0.68, 55, '#262a1e');
}

function drawRidge(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  baseHeight: number,
  bumpSize: number,
  color: string,
) {
  const phase1 = Math.random() * 10;
  const phase2 = Math.random() * 10;

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, canvas.height);
  for (let x = 0; x <= canvas.width; x += 4) {
    const t = (x / canvas.width) * Math.PI * 2;
    const y =
      canvas.height * baseHeight -
      Math.sin(t * 3 + phase1) * bumpSize -
      Math.sin(t * 7 + phase2) * bumpSize * 0.4 -
      Math.abs(Math.sin(t * 13)) * bumpSize * 0.2;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(canvas.width, canvas.height);
  ctx.closePath();
  ctx.fill();
}

function paintTreeline(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const groundY = canvas.height * 0.82;

  ctx.fillStyle = '#0f120c';
  ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);

  let x = 0;
  while (x < canvas.width) {
    const treeWidth = 14 + Math.random() * 22;
    const treeHeight = 50 + Math.random() * 90;
    ctx.beginPath();
    ctx.moveTo(x, groundY + 2);
    ctx.lineTo(x + treeWidth / 2, groundY - treeHeight);
    ctx.lineTo(x + treeWidth, groundY + 2);
    ctx.closePath();
    ctx.fill();
    x += treeWidth * 0.6;
  }
}

function paintFog(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  for (let i = 0; i < 26; i++) {
    const x = Math.random() * canvas.width;
    const y = canvas.height * (0.45 + Math.random() * 0.45);
    const size = 80 + Math.random() * 180;
    for (const shift of [-canvas.width, 0, canvas.width]) {
      const gradient = ctx.createRadialGradient(x + shift, y, 0, x + shift, y, size);
      gradient.addColorStop(0, 'rgba(210, 205, 190, 0.22)');
      gradient.addColorStop(1, 'rgba(210, 205, 190, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(x + shift - size, y - size, size * 2, size * 2);
    }
  }
}
