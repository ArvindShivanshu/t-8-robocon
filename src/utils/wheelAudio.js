// Ultra-Realistic Physics-Based Vehicle Audio Engine
// Models a 15kg autonomous mobile robot (AGV) with 4-wheel omni/mecanum drive
// Features:
// 1. Studio-grade stereo acoustic floor roll + planetary motor drivetrain
// 2. Continuous momentum & inertia smoothing (eliminates scroll notch stutter)
// 3. Critically damped acoustic filtering (Q = 0.707, zero resonant ringing or whistling)
// 4. Natural pitch modulation (bounded between 0.82x and 1.32x for authentic vehicle acoustics)

class WheelSoundEngine {
  constructor() {
    this.ctx = null;
    this.isInitialized = false;
    this.audioBuffer = null;
    this.bufferSource = null;
    this.gainNode = null;
    this.filterNode = null;
    this.isPlaying = false;
    this.isLoadingBuffer = false;

    // Physics momentum state
    this.sources = {
      scroll: 0,
      simulator: 0,
    };
    this.targetSpeed = 0;
    this.smoothedSpeed = 0;
    this.rafId = null;

    // Fallback synth nodes (smooth pink-noise mechanical rumble)
    this.synthGain = null;
    this.synthNoiseNode = null;
    this.synthFilter = null;
    this.synthMotorOsc = null;
  }

  init() {
    if (this.isInitialized) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      this.ctx = new AudioContextClass();

      // Master Gain Node
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(0.00001, this.ctx.currentTime);

      // Critically Damped Lowpass Filter (Q = 0.707 Butterworth - natural acoustic absorption, zero whistle)
      this.filterNode = this.ctx.createBiquadFilter();
      this.filterNode.type = 'lowpass';
      this.filterNode.frequency.setValueAtTime(450, this.ctx.currentTime);
      this.filterNode.Q.setValueAtTime(0.707, this.ctx.currentTime);

      this.filterNode.connect(this.gainNode);
      this.gainNode.connect(this.ctx.destination);

      // Initialize warm mechanical synthesis fallback (active while WAV buffer loads)
      this.initSynthFallback();

      this.isInitialized = true;

      // Start continuous physics momentum update loop
      this.startPhysicsLoop();

      // Load high-fidelity stereo mechanical wheel rolling sample
      const audioUrl = `${import.meta.env.BASE_URL || '/'}assets/audio/wheel_rolling.wav`.replace('//', '/');
      this.loadAudioSample(audioUrl);
    } catch (err) {
      console.warn('WheelSoundEngine init error:', err);
    }
  }

  initSynthFallback() {
    if (!this.ctx) return;
    try {
      this.synthGain = this.ctx.createGain();
      this.synthGain.gain.setValueAtTime(0.00001, this.ctx.currentTime);
      this.synthGain.connect(this.ctx.destination);

      // Low frequency mechanical frame resonance
      this.synthMotorOsc = this.ctx.createOscillator();
      this.synthMotorOsc.type = 'sine';
      this.synthMotorOsc.frequency.setValueAtTime(115, this.ctx.currentTime);

      const oscFilter = this.ctx.createBiquadFilter();
      oscFilter.type = 'lowpass';
      oscFilter.frequency.setValueAtTime(320, this.ctx.currentTime);
      oscFilter.Q.setValueAtTime(0.707, this.ctx.currentTime);

      this.synthMotorOsc.connect(oscFilter);
      oscFilter.connect(this.synthGain);
      this.synthMotorOsc.start();

      // Granular mechanical floor friction noise (Brownian/Pink filtered)
      const bufSize = this.ctx.sampleRate * 2;
      const noiseBuf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
      const data = noiseBuf.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufSize; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + 0.02 * white) / 1.02; // Brown noise integrator
        data[i] = lastOut * 1.8;
      }
      this.synthNoiseNode = this.ctx.createBufferSource();
      this.synthNoiseNode.buffer = noiseBuf;
      this.synthNoiseNode.loop = true;

      this.synthFilter = this.ctx.createBiquadFilter();
      this.synthFilter.type = 'bandpass';
      this.synthFilter.Q.setValueAtTime(0.9, this.ctx.currentTime);
      this.synthFilter.frequency.setValueAtTime(160, this.ctx.currentTime);

      this.synthNoiseNode.connect(this.synthFilter);
      this.synthFilter.connect(this.synthGain);
      this.synthNoiseNode.start();
    } catch (e) {
      console.warn('Synth fallback init error:', e);
    }
  }

  async loadAudioSample(url) {
    if (this.isLoadingBuffer) return;
    this.isLoadingBuffer = true;
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      if (!this.ctx) return;
      this.audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
      this.startBufferPlayback();
    } catch (e) {
      console.warn('Notice: Using dynamic mechanical physical synthesis fallback:', e);
    } finally {
      this.isLoadingBuffer = false;
    }
  }

  startBufferPlayback() {
    if (!this.ctx || !this.audioBuffer || this.isPlaying) return;
    try {
      this.bufferSource = this.ctx.createBufferSource();
      this.bufferSource.buffer = this.audioBuffer;
      this.bufferSource.loop = true;
      this.bufferSource.playbackRate.setValueAtTime(1.0, this.ctx.currentTime);

      this.bufferSource.connect(this.filterNode);
      this.bufferSource.start();
      this.isPlaying = true;

      // Silence fallback synth once high-fidelity recording is active
      if (this.synthGain) {
        this.synthGain.gain.setValueAtTime(0.00001, this.ctx.currentTime);
      }
    } catch (err) {
      console.warn('startBufferPlayback error:', err);
    }
  }

  ensureRunning() {
    if (!this.isInitialized) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    if (this.audioBuffer && !this.isPlaying) {
      this.startBufferPlayback();
    }
  }

  startPhysicsLoop() {
    if (this.rafId) return;

    const tick = () => {
      this.updatePhysics();
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  updatePhysics() {
    if (!this.isInitialized || !this.ctx) return;

    const target = this.targetSpeed;
    const current = this.smoothedSpeed;

    // Asymmetric physics momentum:
    // Fast attack (alpha = 0.16, ~70ms) for responsive throttle
    // Gentle coast-down (alpha = 0.045, ~450ms) for realistic 15kg vehicle inertia
    const alpha = target > current ? 0.16 : 0.045;
    this.smoothedSpeed += (target - current) * alpha;

    if (this.smoothedSpeed < 0.005) {
      this.smoothedSpeed = 0;
    }

    this.applyAudioParams(this.smoothedSpeed);
  }

  setSpeed(source, speed) {
    this.sources[source] = Math.max(0, speed || 0);
    this.targetSpeed = Math.max(this.sources.scroll, this.sources.simulator);

    if (this.targetSpeed > 0.01) {
      this.ensureRunning();
    }
  }

  applyAudioParams(speed) {
    if (!this.isInitialized || !this.ctx) return;

    const t = this.ctx.currentTime;
    const s = Math.min(2.0, Math.max(0, speed));

    if (s < 0.008) {
      // Gentle fade to zero when completely stationary
      if (this.gainNode) {
        this.gainNode.gain.setTargetAtTime(0.00001, t, 0.10);
      }
      if (this.synthGain && !this.isPlaying) {
        this.synthGain.gain.setTargetAtTime(0.00001, t, 0.10);
      }
      return;
    }

    // Realistic volume curve:
    // Soft, deep floor crawl (10% volume) -> solid punchy presence (25% volume)
    const vol = Math.min(0.26, 0.05 + Math.pow(s, 0.70) * 0.18);

    // Natural vehicle pitch modulation (strict realistic bounds):
    // Slow crawl: 0.82x (heavy, deep mechanical thrum)
    // Cruise speed (s = 1.0): 1.02x (natural acoustic recording)
    // Top speed (s = 2.0): 1.28x (spooled high-torque electric drive)
    const rate = Math.min(1.32, Math.max(0.80, 0.82 + s * 0.23));

    // Butterworth acoustic absorption filter:
    // Crawl: 420 Hz (muffled, solid chassis-floor contact)
    // High speed: 2200 Hz (open, textured mechanical planetary purr)
    const cutoff = Math.min(2600, 420 + s * 950);

    if (this.isPlaying && this.bufferSource) {
      this.gainNode.gain.setTargetAtTime(vol, t, 0.05);
      this.bufferSource.playbackRate.setTargetAtTime(rate, t, 0.05);
      this.filterNode.frequency.setTargetAtTime(cutoff, t, 0.05);
    } else if (this.synthGain) {
      // Mechanical synthesis fallback
      this.synthGain.gain.setTargetAtTime(vol * 0.75, t, 0.06);
      const synthPitch = 90 + s * 55;
      this.synthMotorOsc.frequency.setTargetAtTime(synthPitch, t, 0.06);
      this.synthFilter.frequency.setTargetAtTime(140 + s * 160, t, 0.06);
    }
  }
}

export const wheelAudio = new WheelSoundEngine();

// Auto-unlock on first user interaction
if (typeof window !== 'undefined') {
  const unlockEvents = ['scroll', 'wheel', 'keydown', 'pointerdown', 'touchstart'];
  const unlock = () => {
    wheelAudio.ensureRunning();
    unlockEvents.forEach((evt) => window.removeEventListener(evt, unlock));
  };
  unlockEvents.forEach((evt) => window.addEventListener(evt, unlock, { passive: true }));
}

