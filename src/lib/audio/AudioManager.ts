import type { SoundId } from '@/types';
import {playSynthClick, playSynthGlitch, playSynthShot, playSynthUnlock, playSynthHover, playSynthWhoosh, startSynthDrone, type LoopHandle} from './synthSounds';

const MASTER_VOLUME = 0.6;
const AMBIENT_VOLUME = 0.35;
const FILE_VOLUMES: Record<SoundId, number> = {
  'ui-click': 0.5,
  'ui-hover': 0.25,
  whoosh: 0.8,
  'ambient-drone': AMBIENT_VOLUME,
  glitch: 0.5,
  shot: 0.6,
  unlock: 0.6,
};
const ALL_SOUNDS: SoundId[] = [
  'ui-click',
  'ui-hover',
  'whoosh',
  'ambient-drone',
  'glitch',
  'shot',
  'unlock',
];

class AudioManager {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private buffers = new Map<SoundId, AudioBuffer>();
  private muted = false;
  private ambient: LoopHandle | null = null;

  isUnlocked(): boolean {
    return this.context !== null;
  }

  unlock() {
    if (!this.context) {
      if (typeof window.AudioContext === 'undefined') return;

      this.context = new AudioContext();
      this.master = this.context.createGain();
      this.master.gain.value = this.muted ? 0 : MASTER_VOLUME;
      this.master.connect(this.context.destination);

      void this.loadFiles();
    }

    if (this.context.state === 'suspended') {
      void this.context.resume();
    }
  }

  private async loadFiles() {
    const jobs = ALL_SOUNDS.map((id) => this.loadFile(id));
    await Promise.all(jobs);
  }

  private async loadFile(id: SoundId) {
    const context = this.context;
    if (!context) return;

    try {
      const response = await fetch(`/audio/${id}.mp3`);
      if (!response.ok) return;
      const data = await response.arrayBuffer();
      const buffer = await context.decodeAudioData(data);
      this.buffers.set(id, buffer);

      if (id === 'ambient-drone' && this.ambient) {
        this.stopAmbient();
        this.startAmbient();
      }
    } catch {}
  }

  play(id: SoundId) {
    const context = this.context;
    const master = this.master;
    if (!context || !master) return;

    const buffer = this.buffers.get(id);
    if (buffer) {
      const source = context.createBufferSource();
      source.buffer = buffer;
      const gain = context.createGain();
      gain.gain.value = FILE_VOLUMES[id];
      source.connect(gain);
      gain.connect(master);
      source.start();
      return;
    }

    if (id === 'ui-click') playSynthClick(context, master);
    if (id === 'ui-hover') playSynthHover(context, master);
    if (id === 'whoosh') playSynthWhoosh(context, master);
    if (id === 'glitch') playSynthGlitch(context, master);
    if (id === 'shot') playSynthShot(context, master);
    if (id === 'unlock') playSynthUnlock(context, master);
  }

  startAmbient() {
    const context = this.context;
    const master = this.master;
    if (!context || !master || this.ambient) return;

    const buffer = this.buffers.get('ambient-drone');
    if (!buffer) {
      this.ambient = startSynthDrone(context, master, AMBIENT_VOLUME);
      return;
    }

    const source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const gain = context.createGain();
    gain.gain.setValueAtTime(0, context.currentTime);
    gain.gain.setTargetAtTime(AMBIENT_VOLUME, context.currentTime, 1);
    source.connect(gain);
    gain.connect(master);
    source.start();

    this.ambient = {
      stop() {
        const now = context.currentTime;
        gain.gain.cancelScheduledValues(now);
        gain.gain.setTargetAtTime(0, now, 0.3);
        source.stop(now + 1.5);
      },
    };
  }

  stopAmbient() {
    if (this.ambient) {
      this.ambient.stop();
      this.ambient = null;
    }
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (this.context && this.master) {
      const target = muted ? 0 : MASTER_VOLUME;
      const fadeSpeed = muted ? 0.05 : 0.01;
      this.master.gain.setTargetAtTime(target, this.context.currentTime, fadeSpeed);
    }
  }

  setPaused(paused: boolean) {
    if (!this.context) return;
    if (paused) {
      void this.context.suspend();
    } else {
      void this.context.resume();
    }
  }
}

export const audio = new AudioManager();
