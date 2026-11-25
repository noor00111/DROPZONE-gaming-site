let noiseBuffer: AudioBuffer | null = null;

function getNoiseBuffer(context: AudioContext): AudioBuffer {
  if (noiseBuffer) return noiseBuffer;

  const length = context.sampleRate * 2;
  noiseBuffer = context.createBuffer(1, length, context.sampleRate);
  const samples = noiseBuffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    samples[i] = Math.random() * 2 - 1;
  }
  return noiseBuffer;
}

function makeNoiseSource(context: AudioContext): AudioBufferSourceNode {
  const source = context.createBufferSource();
  source.buffer = getNoiseBuffer(context);
  source.loop = true;
  return source;
}

const CLICK_TICK_PITCH = 3600;
const CLICK_THUMP_PITCH = 180;
const CLICK_RELEASE_DELAY = 0.028;
const CLICK_VOLUME = 1;

function playTick(
  context: AudioContext,
  output: AudioNode,
  startTime: number,
  pitch: number,
  volume: number,
) {
  const noise = makeNoiseSource(context);

  const filter = context.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = pitch;
  filter.Q.value = 2.5;

  const gain = context.createGain();
  gain.gain.setValueAtTime(volume, startTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.018);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(output);
  noise.start(startTime);
  noise.stop(startTime + 0.03);
}

export function playSynthClick(context: AudioContext, output: AudioNode) {
  const now = context.currentTime;

  playTick(context, output, now, CLICK_TICK_PITCH, 0.5 * CLICK_VOLUME);

  const thump = context.createOscillator();
  thump.type = 'triangle';
  thump.frequency.setValueAtTime(CLICK_THUMP_PITCH * 1.6, now);
  thump.frequency.exponentialRampToValueAtTime(CLICK_THUMP_PITCH * 0.6, now + 0.05);

  const thumpGain = context.createGain();
  thumpGain.gain.setValueAtTime(0.35 * CLICK_VOLUME, now);
  thumpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

  thump.connect(thumpGain);
  thumpGain.connect(output);
  thump.start(now);
  thump.stop(now + 0.07);

  playTick(context, output, now + CLICK_RELEASE_DELAY, CLICK_TICK_PITCH * 0.7, 0.2 * CLICK_VOLUME);
}

export function playSynthHover(context: AudioContext, output: AudioNode) {
  playTick(context, output, context.currentTime, CLICK_TICK_PITCH * 1.4, 0.12 * CLICK_VOLUME);
}

export function playSynthShot(context: AudioContext, output: AudioNode) {
  const now = context.currentTime;

  const noise = makeNoiseSource(context);
  const filter = context.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(5000, now);
  filter.frequency.exponentialRampToValueAtTime(600, now + 0.15);
  const noiseGain = context.createGain();
  noiseGain.gain.setValueAtTime(0.7, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(output);
  noise.start(now);
  noise.stop(now + 0.2);

  const punch = context.createOscillator();
  punch.type = 'sine';
  punch.frequency.setValueAtTime(140, now);
  punch.frequency.exponentialRampToValueAtTime(40, now + 0.12);
  const punchGain = context.createGain();
  punchGain.gain.setValueAtTime(0.8, now);
  punchGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
  punch.connect(punchGain);
  punchGain.connect(output);
  punch.start(now);
  punch.stop(now + 0.16);
}

export function playSynthUnlock(context: AudioContext, output: AudioNode) {
  const now = context.currentTime;
  const notes = [660, 880, 1320];

  for (let i = 0; i < notes.length; i++) {
    const start = now + i * 0.09;

    const oscillator = context.createOscillator();
    oscillator.type = 'triangle';
    oscillator.frequency.value = notes[i];

    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.25, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35);

    oscillator.connect(gain);
    gain.connect(output);
    oscillator.start(start);
    oscillator.stop(start + 0.4);
  }
}

export function playSynthWhoosh(context: AudioContext, output: AudioNode) {
  const now = context.currentTime;

  const noise = makeNoiseSource(context);

  const filter = context.createBiquadFilter();
  filter.type = 'bandpass';
  filter.Q.value = 1.2;
  filter.frequency.setValueAtTime(250, now);
  filter.frequency.exponentialRampToValueAtTime(2800, now + 1.2);
  filter.frequency.exponentialRampToValueAtTime(400, now + 1.9);

  const gain = context.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.5, now + 1.2);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.95);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(output);
  noise.start(now);
  noise.stop(now + 2);
}

export function playSynthGlitch(context: AudioContext, output: AudioNode) {
  const now = context.currentTime;
  const BURSTS = 6;

  for (let i = 0; i < BURSTS; i++) {
    const start = now + i * 0.045;
    const length = 0.02 + Math.random() * 0.03;

    const oscillator = context.createOscillator();
    oscillator.type = 'square';
    oscillator.frequency.value = 200 + Math.random() * 1800;

    const gain = context.createGain();
    gain.gain.setValueAtTime(0.06, start);
    gain.gain.setValueAtTime(0, start + length);

    oscillator.connect(gain);
    gain.connect(output);
    oscillator.start(start);
    oscillator.stop(start + length + 0.01);
  }

  const noise = makeNoiseSource(context);
  const highPass = context.createBiquadFilter();
  highPass.type = 'highpass';
  highPass.frequency.value = 3000;
  const noiseGain = context.createGain();
  noiseGain.gain.setValueAtTime(0.15, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

  noise.connect(highPass);
  highPass.connect(noiseGain);
  noiseGain.connect(output);
  noise.start(now);
  noise.stop(now + 0.3);
}

export type LoopHandle = {
  stop: () => void;
};

export function startSynthDrone(
  context: AudioContext,
  output: AudioNode,
  volume: number,
): LoopHandle {
  const now = context.currentTime;

  const gain = context.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.setTargetAtTime(volume, now, 1);
  gain.connect(output);

  const filter = context.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 380;
  filter.connect(gain);

  const oscillatorA = context.createOscillator();
  oscillatorA.type = 'sawtooth';
  oscillatorA.frequency.value = 55;
  const oscillatorB = context.createOscillator();
  oscillatorB.type = 'sawtooth';
  oscillatorB.frequency.value = 55.4;
  const oscillatorC = context.createOscillator();
  oscillatorC.type = 'sine';
  oscillatorC.frequency.value = 82.5;

  const toneGain = context.createGain();
  toneGain.gain.value = 0.25;
  oscillatorA.connect(toneGain);
  oscillatorB.connect(toneGain);
  oscillatorC.connect(toneGain);
  toneGain.connect(filter);

  const lfo = context.createOscillator();
  lfo.frequency.value = 0.08;
  const lfoAmount = context.createGain();
  lfoAmount.gain.value = 120;
  lfo.connect(lfoAmount);
  lfoAmount.connect(filter.frequency);

  const wind = makeNoiseSource(context);
  const windFilter = context.createBiquadFilter();
  windFilter.type = 'lowpass';
  windFilter.frequency.value = 600;
  const windGain = context.createGain();
  windGain.gain.value = 0.12;
  wind.connect(windFilter);
  windFilter.connect(windGain);
  windGain.connect(gain);

  const sources = [oscillatorA, oscillatorB, oscillatorC, lfo, wind];
  for (const source of sources) {
    source.start(now);
  }

  return {
    stop() {
      const stopTime = context.currentTime;
      gain.gain.cancelScheduledValues(stopTime);
      gain.gain.setTargetAtTime(0, stopTime, 0.3);
      for (const source of sources) {
        source.stop(stopTime + 1.5);
      }
    },
  };
}
