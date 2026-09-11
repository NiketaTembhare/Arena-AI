// Web Audio API Sound Synthesizer for AI ARENA
// Guarantees 100% offline expo reliability without external media assets

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  // Play a synthesized tone or chord sequence
  playTone(freq, type = 'sine', duration = 0.1, gainValue = 0.15) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainValue, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio Context playback error:", e);
    }
  }

  // Sound Effect 1: Click / Selection
  playClick() {
    this.playTone(800, 'sine', 0.05, 0.1);
  }

  // Sound Effect 2: Correct Answer Chime
  playCorrect() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.15, 0.2);
      }, idx * 60);
    });
  }

  // Sound Effect 3: Wrong Answer Buzzer
  playWrong() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [220, 196]; // A3 -> G3 sawtooth low pulse
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'sawtooth', 0.25, 0.25);
      }, idx * 100);
    });
  }

  // Sound Effect 4: Timer Tick
  playTick() {
    this.playTone(1200, 'sine', 0.03, 0.05);
  }

  // Sound Effect 5: Warning Pulse (Low Time)
  playWarning() {
    this.playTone(440, 'square', 0.08, 0.15);
  }

  // Sound Effect 6: Streak Multiplier Sound
  playStreak() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    [440, 554.37, 659.25, 880].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'sine', 0.1, 0.15), i * 40);
    });
  }

  // Sound Effect 7: Challenge Complete Fanfare
  playChallengeComplete() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const sequence = [
      { f: 523.25, d: 0.1 },
      { f: 659.25, d: 0.1 },
      { f: 783.99, d: 0.1 },
      { f: 1046.50, d: 0.4 },
    ];
    sequence.forEach((note, i) => {
      setTimeout(() => this.playTone(note.f, 'triangle', note.d, 0.25), i * 120);
    });
  }

  // Sound Effect 8: Final Victory Rank Reveal
  playVictory() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const arpeggio = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
    arpeggio.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'sine', 0.3, 0.3);
      }, idx * 80);
    });
  }
}

export const audioEngine = new AudioEngine();
