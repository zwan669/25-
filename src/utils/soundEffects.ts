/**
 * Web Audio API based Sound Effects for English Grammar Cloze
 * Synthesizes crisp positive chimes for correct answers
 * and gentle sympathetic/regretful chords for mistakes without external assets.
 */

class SoundEffectsManager {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    try {
      const saved = localStorage.getItem('zj_sound_enabled');
      if (saved !== null) {
        this.enabled = saved === 'true';
      } else {
        this.enabled = true;
      }
    } catch {
      this.enabled = true;
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public toggle(): boolean {
    this.enabled = !this.enabled;
    try {
      localStorage.setItem('zj_sound_enabled', String(this.enabled));
    } catch {}
    return this.enabled;
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
    try {
      localStorage.setItem('zj_sound_enabled', String(val));
    } catch {}
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Play cheerful, triumphant, bright ascending arpeggio on correct answer!
   * (C5 -> E5 -> G5 -> C6 with warm bell-like resonance)
   */
  public playCorrect() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Musical frequencies for cheerful C Major chord: C5 (523.25), E5 (659.25), G5 (783.99), C6 (1046.50)
      const pitches = [523.25, 659.25, 783.99, 1046.50];

      pitches.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.07);

        // Soft attack, pleasant decay
        gain.gain.setValueAtTime(0, now + i * 0.07);
        gain.gain.linearRampToValueAtTime(0.2, now + i * 0.07 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.32);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.07);
        osc.stop(now + i * 0.07 + 0.33);
      });
    } catch (e) {
      console.warn('Audio playback error', e);
    }
  }

  /**
   * Play a gentle "regret / aww" sound on incorrect answer
   * (Descending two-note minor tone with soft triangle timbre, not harsh)
   */
  public playIncorrect() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Note 1: First sigh tone (F4 -> D4)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();

      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(349.23, now);
      osc1.frequency.exponentialRampToValueAtTime(293.66, now + 0.16);

      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.18, now + 0.02);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.21);

      // Note 2: Second regretful tone (C4 -> Bb3)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(261.63, now + 0.16);
      osc2.frequency.exponentialRampToValueAtTime(233.08, now + 0.42);

      gain2.gain.setValueAtTime(0, now + 0.16);
      gain2.gain.linearRampToValueAtTime(0.2, now + 0.19);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc2.start(now + 0.16);
      osc2.stop(now + 0.51);
    } catch (e) {
      console.warn('Audio playback error', e);
    }
  }
}

export const soundManager = new SoundEffectsManager();
