import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export const DEFAULT_EFFECTS = {
  bloom: 0.55,
  aberration: 0.004,
  zoomBlur: 0,
};
const BLOOM_RADIUS = 0.5;
const BLOOM_THRESHOLD = 0.85;

export type EffectSettings = {
  bloom: number;
  aberration: number;
  zoomBlur: number;
};

const LensShader = {
  uniforms: {
    tDiffuse: { value: null },
    aberration: { value: DEFAULT_EFFECTS.aberration },
    zoomBlur: { value: DEFAULT_EFFECTS.zoomBlur },
  },

  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float aberration;
    uniform float zoomBlur;
    varying vec2 vUv;

    const int BLUR_SAMPLES = 8;

    vec3 splitColors(vec2 uv) {
      vec2 offset = (uv - 0.5) * aberration;
      float red = texture2D(tDiffuse, uv + offset).r;
      float green = texture2D(tDiffuse, uv).g;
      float blue = texture2D(tDiffuse, uv - offset).b;
      return vec3(red, green, blue);
    }

    void main() {
      vec3 color;

      if (zoomBlur > 0.0) {
        color = vec3(0.0);
        for (int i = 0; i < BLUR_SAMPLES; i++) {
          float zoom = 1.0 - zoomBlur * (float(i) / float(BLUR_SAMPLES - 1));
          color += splitColors((vUv - 0.5) * zoom + 0.5);
        }
        color /= float(BLUR_SAMPLES);
      } else {
        color = splitColors(vUv);
      }

      gl_FragColor = vec4(color, 1.0);
    }
  `,
};

export type PostEffects = {
  composer: EffectComposer;
  bloomPass: UnrealBloomPass;
  lensPass: ShaderPass;
};

export function createPostEffects(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  width: number,
  height: number,
): PostEffects {
  const composer = new EffectComposer(renderer);
  composer.setPixelRatio(renderer.getPixelRatio());
  composer.setSize(width, height);

  composer.addPass(new RenderPass(scene, camera));

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(width, height),
    DEFAULT_EFFECTS.bloom,
    BLOOM_RADIUS,
    BLOOM_THRESHOLD,
  );
  composer.addPass(bloomPass);

  const lensPass = new ShaderPass(LensShader);
  composer.addPass(lensPass);

  composer.addPass(new OutputPass());

  return { composer, bloomPass, lensPass };
}

export function applyEffectSettings(effects: PostEffects, settings: EffectSettings) {
  effects.bloomPass.strength = settings.bloom;
  effects.lensPass.uniforms.aberration.value = settings.aberration;
  effects.lensPass.uniforms.zoomBlur.value = settings.zoomBlur;
}

export function disposePostEffects(effects: PostEffects) {
  for (const pass of effects.composer.passes) {
    pass.dispose();
  }
  effects.composer.dispose();
}
