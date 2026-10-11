// Ultra-Realistic Physics-Based Vehicle Audio Engine
// Models a 15kg autonomous mobile robot (AGV) with 4-wheel omni drivetrain
// Features:
// 1. Studio-grade stereo acoustic floor roll + planetary motor drivetrain
// 2. High-performance momentum & inertia smoothing (eliminates scroll stutter)
// 3. Clear, audible frequency shaping across all laptop/mobile speakers
// 4. Natural pitch modulation (0.80x deep rumble to 1.48x spooled electric drive)
// 5. Robust multi-browser Web Audio unlocking (Chrome, Safari, Firefox, iOS)

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

    // High-performance mechanical synthesis nodes
    this.synthGain = null;
    this.synthNoiseNode = null;
    this.synthFilter = null;
    this.synthMotorOsc = null;
  }

  init() {
    if (this.isInitialized && this.ctx) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      this.ctx = new AudioContextClass();

      // Master Gain Node
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(0.00001, this.ctx.currentTime);

      // Critically Damped Butterworth Filter (Q = 0.707)
      this.filterNode = this.ctx.createBiquadFilter();
      this.filterNode.type = 'lowpass';
      this.filterNode.frequency.setValueAtTime(750, this.ctx.currentTime);
      this.filterNode.Q.setValueAtTime(0.707, this.ctx.currentTime);

      this.filterNode.connect(this.gainNode);
      this.gainNode.connect(this.ctx.destination);

      // Initialize synthetic audio engine
      this.initSynthEngine();

      this.isInitialized = true;

      // Start continuous physics momentum loop
      this.startPhysicsLoop();

      // Load high-fidelity WAV sample
      this.loadAudioSample('/assets/audio/wheel_rolling.wav');
    } catch (err) {
      console.warn('WheelSoundEngine init error:', err);
    }
  }

  initSynthEngine() {
    if (!this.ctx) return;
    try {
      this.synthGain = this.ctx.createGain();
      this.synthGain.gain.setValueAtTime(0.00001, this.ctx.currentTime);
      this.synthGain.connect(this.ctx.destination);

      // Electric planetary gear motor whine (harmonic rich)
      this.synthMotorOsc = this.ctx.createOscillator();
      this.synthMotorOsc.type = 'sawtooth';
      this.synthMotorOsc.frequency.setValueAtTime(130, this.ctx.currentTime);

      const oscFilter = this.ctx.createBiquadFilter();
      oscFilter.type = 'lowpass';
      oscFilter.frequency.setValueAtTime(450, this.ctx.currentTime);
      oscFilter.Q.setValueAtTime(1.0, this.ctx.currentTime);

      this.synthMotorOsc.connect(oscFilter);
      oscFilter.connect(this.synthGain);
      this.synthMotorOsc.start();

      // Granular mechanical floor friction noise (Pink/Brown noise)
      const bufSize = Math.max(4096, Math.floor(this.ctx.sampleRate * 2));
      const noiseBuf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
      const data = noiseBuf.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufSize; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + 0.022 * white) / 1.022;
        data[i] = lastOut * 2.0;
      }

      this.synthNoiseNode = this.ctx.createBufferSource();
      this.synthNoiseNode.buffer = noiseBuf;
      this.synthNoiseNode.loop = true;

      this.synthFilter = this.ctx.createBiquadFilter();
      this.synthFilter.type = 'bandpass';
      this.synthFilter.Q.setValueAtTime(1.0, this.ctx.currentTime);
      this.synthFilter.frequency.setValueAtTime(360, this.ctx.currentTime);

      this.synthNoiseNode.connect(this.synthFilter);
      this.synthFilter.connect(this.synthGain);
      this.synthNoiseNode.start();
    } catch (e) {
      console.warn('Synth engine init error:', e);
    }
  }

  async loadAudioSample(url) {
    if (this.isLoadingBuffer) return;
    this.isLoadingBuffer = true;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      if (!this.ctx) return;
      this.audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);

      if (this.ctx.state === 'running' || !this.isPlaying) {
        this.startBufferPlayback();
      }
    } catch (e) {
      console.warn('WheelSoundEngine using dynamic physical synthesis fallback:', e);
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

      this.bufferSource.onended = () => {
        this.isPlaying = false;
      };

      this.bufferSource.connect(this.filterNode);
      this.bufferSource.start(0);
      this.isPlaying = true;
    } catch (err) {
      console.warn('startBufferPlayback error:', err);
      this.isPlaying = false;
    }
  }

  resumeContext() {
    if (!this.isInitialized) {
      this.init();
    }
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().then(() => {
        if (this.audioBuffer && !this.isPlaying) {
          this.startBufferPlayback();
        }
      }).catch(() => {});
    } else if (this.ctx.state === 'running') {
      if (this.audioBuffer && !this.isPlaying) {
        this.startBufferPlayback();
      }
    }
  }

  ensureRunning() {
    this.resumeContext();
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

    // Responsive attack (alpha = 0.22, ~50ms) for punchy throttle
    // Gentle momentum coast-down (alpha = 0.045, ~450ms) for realistic 15kg vehicle inertia
    const alpha = target > current ? 0.22 : 0.045;
    this.smoothedSpeed += (target - current) * alpha;

    if (this.smoothedSpeed < 0.005) {
      this.smoothedSpeed = 0;
    }

    this.applyAudioParams(this.smoothedSpeed);
  }

  setSpeed(source, speed) {
    this.sources[source] = Math.max(0, speed || 0);
    this.targetSpeed = Math.max(this.sources.scroll, this.sources.simulator);

    if (this.targetSpeed > 0.005) {
      this.resumeContext();
    }
  }

  applyAudioParams(speed) {
    if (!this.isInitialized || !this.ctx) return;

    const t = this.ctx.currentTime;
    const s = Math.min(2.5, Math.max(0, speed));

    if (s < 0.008) {
      // Smooth fade to complete silence when stopped
      if (this.gainNode) {
        this.gainNode.gain.setTargetAtTime(0.00001, t, 0.12);
      }
      if (this.synthGain) {
        this.synthGain.gain.setTargetAtTime(0.00001, t, 0.12);
      }
      return;
    }

    // Volume curve: clearly audible across all laptop speakers & mobile
    // Crawl: 18%, Cruise: 42%, Fast: 65%
    const vol = Math.min(0.68, 0.18 + Math.pow(s / 1.1, 0.72) * 0.42);

    // Natural vehicle pitch modulation:
    // Slow crawl: 0.80x (heavy mechanical rumble)
    // Fast sprint: 1.48x (high-speed spooling electric drivetrain)
    const rate = Math.min(1.48, Math.max(0.78, 0.82 + s * 0.32));

    // Butterworth acoustic filter:
    // Crawl: 680 Hz (deep rolling rumble)
    // High speed: 3900 Hz (open, textured planetary gears & tire friction)
    const cutoff = Math.min(4200, 680 + s * 1500);

    if (this.isPlaying && this.bufferSource) {
      this.gainNode.gain.setTargetAtTime(vol, t, 0.04);
      this.bufferSource.playbackRate.setTargetAtTime(rate, t, 0.04);
      this.filterNode.frequency.setTargetAtTime(cutoff, t, 0.04);

      // Blend subtle electric motor whine under the WAV sample
      if (this.synthGain) {
        this.synthGain.gain.setTargetAtTime(vol * 0.18, t, 0.05);
        this.synthMotorOsc.frequency.setTargetAtTime(110 + s * 140, t, 0.05);
        this.synthFilter.frequency.setTargetAtTime(350 + s * 300, t, 0.05);
      }
    } else if (this.synthGain) {
      // Fallback synthesis mode
      this.synthGain.gain.setTargetAtTime(vol * 0.85, t, 0.04);
      this.synthMotorOsc.frequency.setTargetAtTime(120 + s * 160, t, 0.04);
      this.synthFilter.frequency.setTargetAtTime(320 + s * 450, t, 0.04);
    }
  }
}

export const wheelAudio = new WheelSoundEngine();

// Auto-unlock WebAudio on user interaction across all browsers
if (typeof window !== 'undefined') {
  const userGestureEvents = [
    'click',
    'pointerdown',
    'mousedown',
    'touchstart',
    'touchend',
    'keydown',
    'wheel',
    'scroll'
  ];

  const handleUserGesture = () => {
    wheelAudio.resumeContext();
  };

  userGestureEvents.forEach((evt) => {
    window.addEventListener(evt, handleUserGesture, { passive: true, capture: true });
  });
}
