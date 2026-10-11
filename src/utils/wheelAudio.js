// Web Audio API Real-time Synthesis of AGV Holonomic Wheel & Planetary Gearbox Sound
// Zero external assets, zero latency, dynamically modulated by velocity

class WheelSoundEngine {
  constructor() {
    this.ctx = null;
    this.isInitialized = false;
    this.masterGain = null;
    this.motorOsc = null;
    this.motorOsc2 = null;
    this.motorGain = null;
    this.rumbleFilter = null;
    this.rumbleGain = null;
    this.noiseNode = null;
    this.lastSpeed = 0;
    this.sources = {
      scroll: 0,
      simulator: 0,
    };
  }

  init() {
    if (this.isInitialized) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      this.ctx = new AudioContextClass();

      // Master output gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // --- 1. Motor / Planetary Gearbox Whine ---
      // Primary gear mesh tone
      this.motorOsc = this.ctx.createOscillator();
      this.motorOsc.type = 'triangle';
      this.motorOsc.frequency.setValueAtTime(90, this.ctx.currentTime);

      // Harmonic overtone
      this.motorOsc2 = this.ctx.createOscillator();
      this.motorOsc2.type = 'sine';
      this.motorOsc2.frequency.setValueAtTime(180, this.ctx.currentTime);

      this.motorGain = this.ctx.createGain();
      this.motorGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);

      // Low-pass filter to keep gear whine authentic, warm and industrial
      const motorFilter = this.ctx.createBiquadFilter();
      motorFilter.type = 'lowpass';
      motorFilter.frequency.setValueAtTime(1400, this.ctx.currentTime);

      this.motorOsc.connect(motorFilter);
      this.motorOsc2.connect(motorFilter);
      motorFilter.connect(this.motorGain);
      this.motorGain.connect(this.masterGain);

      this.motorOsc.start();
      this.motorOsc2.start();

      // --- 2. Wheel-Floor Rolling Texture (Filtered Pink Noise) ---
      const bufferSize = this.ctx.sampleRate * 2; // 2 seconds seamless loop
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.055;
        b6 = white * 0.115926;
      }

      this.noiseNode = this.ctx.createBufferSource();
      this.noiseNode.buffer = noiseBuffer;
      this.noiseNode.loop = true;

      this.rumbleFilter = this.ctx.createBiquadFilter();
      this.rumbleFilter.type = 'bandpass';
      this.rumbleFilter.Q.setValueAtTime(1.6, this.ctx.currentTime);
      this.rumbleFilter.frequency.setValueAtTime(120, this.ctx.currentTime);

      this.rumbleGain = this.ctx.createGain();
      this.rumbleGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);

      this.noiseNode.connect(this.rumbleFilter);
      this.rumbleFilter.connect(this.rumbleGain);
      this.rumbleGain.connect(this.masterGain);

      this.noiseNode.start();
      this.isInitialized = true;
    } catch (err) {
      console.warn('AudioContext failed to initialize:', err);
    }
  }

  ensureRunning() {
    if (!this.isInitialized) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Update speed for a named source ('scroll' or 'simulator')
  // normalizedSpeed: 0 (stopped) up to ~1.0+ (fast motion)
  setSpeed(source, normalizedSpeed) {
    this.sources[source] = Math.max(0, normalizedSpeed || 0);
    // Combine highest active speed
    const combined = Math.max(this.sources.scroll, this.sources.simulator);

    if (combined > 0.01) {
      this.ensureRunning();
    }
    this.applyAudioParams(combined);
  }

  applyAudioParams(speed) {
    if (!this.isInitialized || !this.ctx) return;

    const t = this.ctx.currentTime;
    const s = Math.min(2.5, Math.max(0, speed));

    if (s < 0.01) {
      // Smooth fade to silent
      this.masterGain.gain.setTargetAtTime(0.00001, t, 0.08);
      this.lastSpeed = 0;
      return;
    }

    // Volume scales with velocity (gentle curve so slow rolls are quiet, fast rolls are punchy)
    const masterVol = Math.min(0.24, Math.pow(s, 0.65) * 0.20);
    this.masterGain.gain.setTargetAtTime(masterVol, t, 0.04);

    // Motor Gear Mesh Pitch: scales dynamically from ~85Hz to ~480Hz
    // If fast scrolling, frequency shoots up producing that signature mechanical hum/whine!
    const baseFreq = 85 + s * 165;
    this.motorOsc.frequency.setTargetAtTime(baseFreq, t, 0.04);
    this.motorOsc2.frequency.setTargetAtTime(baseFreq * 2.02, t, 0.04);

    // Motor balance
    this.motorGain.gain.setTargetAtTime(0.68, t, 0.04);

    // Floor Rumble texture: bandpass frequency shifts from 95Hz to 310Hz with speed
    const rumbleFreq = 95 + s * 115;
    this.rumbleFilter.frequency.setTargetAtTime(rumbleFreq, t, 0.05);
    this.rumbleGain.gain.setTargetAtTime(0.85, t, 0.04);

    this.lastSpeed = s;
  }
}

export const wheelAudio = new WheelSoundEngine();

// Auto-unlock AudioContext on first user interaction
if (typeof window !== 'undefined') {
  const unlockEvents = ['scroll', 'wheel', 'keydown', 'pointerdown', 'touchstart'];
  const unlock = () => {
    wheelAudio.ensureRunning();
    unlockEvents.forEach((evt) => window.removeEventListener(evt, unlock));
  };
  unlockEvents.forEach((evt) => window.addEventListener(evt, unlock, { passive: true }));
}
