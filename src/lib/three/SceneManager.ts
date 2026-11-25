import * as THREE from 'three';
import { useGameStore } from '@/store/useGameStore';
import type { QualityTier } from '@/types';
import { CRATE_HANG_DISTANCE, loadCrate, makeParachute } from './createCrate';
import { createParallaxLayers, updateParallaxLayers, type ParallaxLayer } from './parallaxLayers';
import { createParticles, updateParticles, type Particles } from './particles';
import {applyEffectSettings, createPostEffects, DEFAULT_EFFECTS, disposePostEffects, type EffectSettings, type PostEffects} from './postEffects';

const FOG_COLOR = 0x2f2c22;
const FOG_NEAR = 18;
const FOG_FAR = 120;
const CAMERA_START = new THREE.Vector3(0, 1.7, 9);
const LOOK_AT = new THREE.Vector3(0, 1.7, 0);
const CAMERA_FOV = 45;
const MOUSE_MOVE_AMOUNT_X = 0.8;
const MOUSE_MOVE_AMOUNT_Y = 0.5;
const MOUSE_SMOOTHING = 3;
const PARTICLES_HIGH = 500;
const PARTICLES_LOW = 200;
const HIT_ABERRATION = 0.03;
const HIT_FADE_SPEED = 4;
const PERF_MIN_FPS = 35;
const PERF_WARMUP_TIME = 3;
const PERF_SAMPLE_TIME = 3;

export type SceneOptions = {
  quality: QualityTier;
};

export class SceneManager {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  hero: THREE.Group;
  cameraOffset = { x: 0, y: 0, z: 0 };
  lens = { fov: CAMERA_FOV };
  effects: EffectSettings = { ...DEFAULT_EFFECTS };

  private container: HTMLElement;
  private options: SceneOptions;
  private layers: ParallaxLayer[] = [];
  private particles: Particles | null = null;
  private postEffects: PostEffects | null = null;

  private hitAmount = 0;
  private stopWatchingHealth: (() => void) | null = null;

  private heroBaseX = 0;
  private heroBaseY = 3;
  private cameraDistance = CAMERA_START.z;

  private mouseX = 0;
  private mouseY = 0;
  private smoothMouseX = 0;
  private smoothMouseY = 0;

  private lastTime = 0;
  private elapsed = 0;
  private disposed = false;

  private perfFrames = 0;
  private perfTime = 0;
  private performanceChecked = false;

  constructor(container: HTMLElement, options: SceneOptions) {
    this.container = container;
    this.options = options;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(FOG_COLOR, FOG_NEAR, FOG_FAR);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    this.camera = new THREE.PerspectiveCamera(CAMERA_FOV, width / height, 0.1, 200);
    this.camera.position.copy(CAMERA_START);
    this.camera.lookAt(LOOK_AT);

    const isLow = options.quality === 'low';
    this.renderer = new THREE.WebGLRenderer({
      antialias: !isLow,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, isLow ? 1.5 : 2));
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0x0e1110);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';

    this.hero = new THREE.Group();
    this.hero.name = 'hero';
  }

  init() {
    this.container.appendChild(this.renderer.domElement);

    const store = useGameStore.getState();
    const loadingManager = new THREE.LoadingManager();
    loadingManager.onProgress = (_url, loaded, total) => {
      if (this.disposed) return;
      store.setLoadProgress(loaded, total);
    };
    loadingManager.onError = (url) => {
      if (this.disposed) return;
      store.markLoadFailed(url);
    };
    loadingManager.onLoad = () => {
      if (this.disposed) return;
      store.markLoadDone();
    };

    this.addLights();

    const textureLoader = new THREE.TextureLoader(loadingManager);
    const background = createParallaxLayers(this.camera, textureLoader);
    this.layers = background.layers;
    this.scene.add(background.group);

    this.hero.add(makeParachute());
    this.scene.add(this.hero);
    loadCrate(loadingManager, (crate) => {
      if (this.disposed) {
        disposeObject(crate);
        return;
      }
      crate.position.y = -CRATE_HANG_DISTANCE;
      this.hero.add(crate);
    });

    const count = this.options.quality === 'low' ? PARTICLES_LOW : PARTICLES_HIGH;
    this.particles = createParticles(count);
    this.scene.add(this.particles.points);

    if (this.options.quality === 'high') {
      const width = this.container.clientWidth || window.innerWidth;
      const height = this.container.clientHeight || window.innerHeight;
      this.postEffects = createPostEffects(this.renderer, this.scene, this.camera, width, height);
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduceMotion) {
      this.stopWatchingHealth = useGameStore.subscribe((state, previousState) => {
        if (state.health < previousState.health) this.hitAmount = 1;
      });
    }

    window.addEventListener('resize', this.onResize);
    window.addEventListener('pointermove', this.onPointerMove);
    this.onResize();

    this.renderer.setAnimationLoop(this.update);
  }

  private addLights() {
    const hemisphereLight = new THREE.HemisphereLight(0xc9d0b0, 0x3a3526, 1.4);
    this.scene.add(hemisphereLight);

    const sun = new THREE.DirectionalLight(0xffcf8a, 2.4);
    sun.position.set(5, 8, 6);
    this.scene.add(sun);

    const rimLight = new THREE.DirectionalLight(0xffb000, 1.2);
    rimLight.position.set(-4, 3, -6);
    this.scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0xe8e2cc, 0.6);
    fillLight.position.set(0, 2, 10);
    this.scene.add(fillLight);
  }

  private onResize = () => {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    if (this.postEffects) this.postEffects.composer.setSize(width, height);

    this.heroBaseX = this.camera.aspect > 1.2 ? 2.4 : 0;

    if (this.camera.aspect < 1) {
      this.cameraDistance = CAMERA_START.z + (1 - this.camera.aspect) * 10;
    } else {
      this.cameraDistance = CAMERA_START.z;
    }
  };

  private onPointerMove = (event: PointerEvent) => {
    this.mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouseY = (event.clientY / window.innerHeight) * 2 - 1;
  };

  private checkPerformance(delta: number) {
    if (!this.postEffects || this.performanceChecked) return;

    if (this.elapsed < PERF_WARMUP_TIME || delta > 0.25) return;

    this.perfFrames += 1;
    this.perfTime += delta;
    if (this.perfTime < PERF_SAMPLE_TIME) return;

    this.performanceChecked = true;
    const fps = this.perfFrames / this.perfTime;
    if (fps < PERF_MIN_FPS) this.lowerQuality();
  }

  private lowerQuality() {
    if (this.postEffects) {
      disposePostEffects(this.postEffects);
      this.postEffects = null;
    }
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.onResize();
    useGameStore.getState().setQuality('low');
  }

  private update = (time: number) => {
    const now = time / 1000;
    let delta = now - this.lastTime;
    this.lastTime = now;
    this.checkPerformance(delta);
    if (delta > 0.1) delta = 0.1;
    this.elapsed += delta;
    const t = this.elapsed;

    this.smoothMouseX = THREE.MathUtils.damp(this.smoothMouseX, this.mouseX, MOUSE_SMOOTHING, delta);
    this.smoothMouseY = THREE.MathUtils.damp(this.smoothMouseY, this.mouseY, MOUSE_SMOOTHING, delta);
    this.camera.position.x = CAMERA_START.x + this.smoothMouseX * MOUSE_MOVE_AMOUNT_X + this.cameraOffset.x;
    this.camera.position.y = CAMERA_START.y - this.smoothMouseY * MOUSE_MOVE_AMOUNT_Y + this.cameraOffset.y;
    this.camera.position.z = this.cameraDistance + this.cameraOffset.z;
    this.camera.lookAt(LOOK_AT.x, LOOK_AT.y + this.cameraOffset.y * 0.5, LOOK_AT.z);

    if (this.camera.fov !== this.lens.fov) {
      this.camera.fov = this.lens.fov;
      this.camera.updateProjectionMatrix();
    }

    this.hero.position.x = this.heroBaseX + Math.sin(t * 0.3) * 0.15;
    this.hero.position.y = this.heroBaseY + Math.sin(t * 0.45) * 0.25;
    this.hero.rotation.z = Math.sin(t * 0.7) * 0.07;
    this.hero.rotation.x = Math.sin(t * 0.5) * 0.04;
    this.hero.rotation.y += delta * 0.12;

    updateParallaxLayers(this.layers, delta);
    if (this.particles) updateParticles(this.particles, delta, t);

    if (this.postEffects) {
      this.hitAmount = Math.max(0, this.hitAmount - delta * HIT_FADE_SPEED);

      applyEffectSettings(this.postEffects, {
        bloom: this.effects.bloom,
        aberration: this.effects.aberration + this.hitAmount * HIT_ABERRATION,
        zoomBlur: this.effects.zoomBlur,
      });
      this.postEffects.composer.render(delta);
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  };

  setRunning(running: boolean) {
    if (this.disposed) return;
    this.renderer.setAnimationLoop(running ? this.update : null);
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;

    this.renderer.setAnimationLoop(null);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('pointermove', this.onPointerMove);
    if (this.stopWatchingHealth) this.stopWatchingHealth();

    if (this.postEffects) {
      disposePostEffects(this.postEffects);
      this.postEffects = null;
    }

    disposeObject(this.scene);
    this.scene.clear();

    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.renderer.domElement.remove();

    this.layers = [];
    this.particles = null;
  }
}

function disposeObject(root: THREE.Object3D) {
  root.traverse((object) => {
    if (
      object instanceof THREE.Mesh ||
      object instanceof THREE.Line ||
      object instanceof THREE.Points
    ) {
      object.geometry.dispose();
      const materials: THREE.Material[] = Array.isArray(object.material)
        ? object.material
        : [object.material];
      for (const material of materials) {
        for (const value of Object.values(material)) {
          if (value instanceof THREE.Texture) value.dispose();
        }
        material.dispose();
      }
    }
  });
}
