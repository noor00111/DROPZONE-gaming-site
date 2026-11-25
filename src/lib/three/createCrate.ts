import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const CRATE_COLOR = 0x4b5320;
const CRATE_FRAME_COLOR = 0x2b3014;
const STRAP_COLOR = 0xffb000;
const CHUTE_COLOR_A = 0x5a6232;
const CHUTE_COLOR_B = 0xcfc6a6;
const CORD_COLOR = 0xb9b49c;

const CRATE_MODEL_URL = '/models/crate.glb';
const CRATE_SIZE = 1.4;

export const CRATE_HANG_DISTANCE = 3.4;

export function makeProceduralCrate(): THREE.Group {
  const crate = new THREE.Group();
  crate.name = 'procedural-crate';

  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: CRATE_COLOR,
    roughness: 0.85,
    metalness: 0.1,
    flatShading: true,
  });
  const frameMaterial = new THREE.MeshStandardMaterial({
    color: CRATE_FRAME_COLOR,
    roughness: 0.9,
    flatShading: true,
  });
  const strapMaterial = new THREE.MeshStandardMaterial({
    color: STRAP_COLOR,
    roughness: 0.5,
    metalness: 0.3,
    emissive: STRAP_COLOR,
    emissiveIntensity: 0.15,
  });

  const half = CRATE_SIZE / 2;
  const body = new THREE.Mesh(new THREE.BoxGeometry(CRATE_SIZE, 1, CRATE_SIZE), bodyMaterial);
  crate.add(body);
  const postGeometry = new THREE.BoxGeometry(0.12, 1.04, 0.12);
  
  const corners = [
    [-half, -half],
    [half, -half],
    [-half, half],
    [half, half],
  ];
  for (const corner of corners) {
    const post = new THREE.Mesh(postGeometry, frameMaterial);
    post.position.set(corner[0], 0, corner[1]);
    crate.add(post);
  }

  const rimGeometry = new THREE.BoxGeometry(CRATE_SIZE + 0.12, 0.1, 0.1);
  for (const y of [0.5, -0.5]) {
    for (let side = 0; side < 4; side++) {
      const rim = new THREE.Mesh(rimGeometry, frameMaterial);
      rim.position.y = y;
      const angle = (side * Math.PI) / 2;
      rim.rotation.y = angle;
      rim.position.x = Math.sin(angle) * half;
      rim.position.z = Math.cos(angle) * half;
      crate.add(rim);
    }
  }

  const strapX = new THREE.Mesh(
    new THREE.BoxGeometry(CRATE_SIZE + 0.04, 1.04, 0.14),
    strapMaterial,
  );
  const strapZ = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 1.04, CRATE_SIZE + 0.04),
    strapMaterial,
  );
  crate.add(strapX, strapZ);

  return crate;
}

export function makeParachute(): THREE.Group {
  const parachute = new THREE.Group();
  parachute.name = 'parachute';

  const radius = 2.4;
  const panelCount = 8;
  const domeAngle = Math.PI * 0.38;
  const squash = 0.6;

  const materialA = new THREE.MeshStandardMaterial({
    color: CHUTE_COLOR_A,
    roughness: 0.95,
    side: THREE.DoubleSide,
    flatShading: true,
  });
  const materialB = new THREE.MeshStandardMaterial({
    color: CHUTE_COLOR_B,
    roughness: 0.95,
    side: THREE.DoubleSide,
    flatShading: true,
  });

  const sliceWidth = (Math.PI * 2) / panelCount;
  for (let i = 0; i < panelCount; i++) {
    const sliceGeometry = new THREE.SphereGeometry(
      radius,
      3,
      6,
      i * sliceWidth,
      sliceWidth,
      0,
      domeAngle,
    );
    const slice = new THREE.Mesh(sliceGeometry, i % 2 === 0 ? materialA : materialB);
    slice.scale.y = squash;
    parachute.add(slice);
  }

  const rimRadius = radius * Math.sin(domeAngle);
  const rimY = radius * Math.cos(domeAngle) * squash;
  const knotY = -CRATE_HANG_DISTANCE + 1.1;
  const crateTopY = -CRATE_HANG_DISTANCE + 0.5;
  const half = CRATE_SIZE / 2;

  const points: number[] = [];
  for (let i = 0; i < panelCount; i++) {
    const angle = i * sliceWidth;
    const x = -rimRadius * Math.cos(angle);
    const z = rimRadius * Math.sin(angle);
    points.push(x, rimY, z, 0, knotY, 0);
  }
  const corners = [
    [-half, -half],
    [half, -half],
    [-half, half],
    [half, half],
  ];
  for (const corner of corners) {
    points.push(0, knotY, 0, corner[0], crateTopY, corner[1]);
  }

  const cordGeometry = new THREE.BufferGeometry();
  cordGeometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
  const cordMaterial = new THREE.LineBasicMaterial({
    color: CORD_COLOR,
    transparent: true,
    opacity: 0.7,
  });
  parachute.add(new THREE.LineSegments(cordGeometry, cordMaterial));

  return parachute;
}

export function loadCrate(
  manager: THREE.LoadingManager,
  onReady: (crate: THREE.Object3D, isFallback: boolean) => void,
): void {
  const gltfLoader = new GLTFLoader(manager);

  gltfLoader.load(
    CRATE_MODEL_URL,
    (gltf) => {
      const model = gltf.scene;
      fitModelToCrateSize(model);
      onReady(model, false);
    },
    undefined,
    () => {
      onReady(makeProceduralCrate(), true);
    },
  );
}

function fitModelToCrateSize(model: THREE.Object3D) {
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const biggestSide = Math.max(size.x, size.y, size.z);
  if (biggestSide > 0) {
    model.scale.multiplyScalar(CRATE_SIZE / biggestSide);
  }

  box.setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  model.position.sub(center);
}
