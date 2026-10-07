/**
 * Web Audio API Sound Effects Manager
 * Includes 3-Tier Dynamic Upgraded Correct Audio:
 * - Tier 1 (1-4 Streaks): Standard crisp & cheerful chime
 * - Tier 2 (5-9 Streaks): Upgraded triumphant arcade power-up fanfare (Punchy & energetic)
 * - Tier 3 (10+ Streaks): Ultimate golden orchestral crescendo & stardust shimmer cascade (Ultra satisfying / 超爽)
 * - Incorrect: Gentle regretful sigh tone
 */

type StreakListener = (streak: number) => void;

class SoundEffectsManager {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private currentStreak: number = 0;
  private listeners: Set<StreakListener> = new Set();

  constructor() {
    try {
      const saved = localStorage.getItem('zj_sound_enabled');
      if (saved !== null) {
        this.enabled = saved === 'true';
      } else {
        this.enabled = true;
      }
      const savedStreak = localStorage.getItem('zj_sound_streak');
      if (savedStreak) {
        this.currentStreak = parseInt(savedStreak, 10) || 0;
      }
    } catch {
      this.enabled = true;
      this.currentStreak = 0;
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

  public getStreak(): number {
    return this.currentStreak;
  }

  public setStreak(val: number) {
    this.currentStreak = Math.max(0, val);
    try {
      localStorage.setItem('zj_sound_streak', String(this.currentStreak));
    } catch {}
    this.notifyStreak();
  }

  public subscribeStreak(listener: StreakListener): () => void {
    this.listeners.add(listener);
    listener(this.currentStreak);
    return () => this.listeners.delete(listener);
  }

  private notifyStreak() {
    this.listeners.forEach((fn) => {
      try {
        fn(this.currentStreak);
      } catch (e) {
        console.error(e);
      }
    });
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
   * Main entry point when user answers a question in quiz or redo
   * Handles streak progression and triggers the corresponding tier sound.
   */
  public playAnswerResult(isCorrect: boolean): { isCorrect: boolean; streak: number; tier: number } {
    if (isCorrect) {
      this.currentStreak += 1;
      try {
        localStorage.setItem('zj_sound_streak', String(this.currentStreak));
      } catch {}
      this.notifyStreak();

      let tier = 1;
      if (this.currentStreak >= 10) {
        tier = 3;
        this.playStreak10();
      } else if (this.currentStreak >= 5) {
        tier = 2;
        this.playStreak5();
      } else {
        tier = 1;
        this.playCorrect();
      }
      return { isCorrect: true, streak: this.currentStreak, tier };
    } else {
      this.currentStreak = 0;
      try {
        localStorage.setItem('zj_sound_streak', '0');
      } catch {}
      this.notifyStreak();
      this.playIncorrect();
      return { isCorrect: false, streak: 0, tier: 0 };
    }
  }

  /**
   * Tier 1 (1-4 Streaks):
   * Cheerful, pleasant, bright ascending C-Major arpeggio
   * (C5 -> E5 -> G5 -> C6)
   */
  public playCorrect() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const pitches = [523.25, 659.25, 783.99, 1046.5];

      pitches.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.07);

        gain.gain.setValueAtTime(0, now + i * 0.07);
        gain.gain.linearRampToValueAtTime(0.2, now + i * 0.07 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.07);
        osc.stop(now + i * 0.07 + 0.36);
      });
    } catch (e) {
      console.warn('Audio playback error', e);
    }
  }

  /**
   * Tier 2 (5-9 Streaks):
   * 【5连对爽快升级音效】
   * High-energy arcade power-up fanfare with fast rising pentatonic scale
   * + striking brass-harmonic resonant major chord punch!
   */
  public playStreak5() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // 1. Rapid rising sparkling power scale (0s ~ 0.32s)
      const rapidScale = [
        392.0, // G4
        523.25, // C5
        659.25, // E5
        783.99, // G5
        987.77, // B5
        1046.5, // C6
        1318.51, // E6
        1567.98, // G6
      ];

      rapidScale.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Blend sine and slight triangle for punchy game timbre
        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        const startTime = now + i * 0.042;
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.22, startTime + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.3);
      });

      // 2. Powerful celebratory chord burst at peak (now + 0.32s)
      const chordTime = now + 0.32;
      const chordPitches = [261.63, 523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];

      chordPitches.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = idx === 0 ? 'triangle' : 'sine'; // Deep foundation on bass
        osc.frequency.setValueAtTime(freq, chordTime);

        // Rich lingering resonance
        const vol = idx === 0 ? 0.25 : 0.18;
        gain.gain.setValueAtTime(0, chordTime);
        gain.gain.linearRampToValueAtTime(vol, chordTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, chordTime + 0.7);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(chordTime);
        osc.stop(chordTime + 0.72);
      });

      // 3. Shimmering high sparkle bell accent
      const shimmer = ctx.createOscillator();
      const shimmerGain = ctx.createGain();
      shimmer.type = 'sine';
      shimmer.frequency.setValueAtTime(2093.0, chordTime + 0.05); // High C7
      shimmerGain.gain.setValueAtTime(0, chordTime + 0.05);
      shimmerGain.gain.linearRampToValueAtTime(0.15, chordTime + 0.07);
      shimmerGain.gain.exponentialRampToValueAtTime(0.001, chordTime + 0.5);

      shimmer.connect(shimmerGain);
      shimmerGain.connect(ctx.destination);
      shimmer.start(chordTime + 0.05);
      shimmer.stop(chordTime + 0.52);
    } catch (e) {
      console.warn('Audio playback error', e);
    }
  }

  /**
   * Tier 3 (10+ Streaks):
   * 【10连对顶级超爽音效 · 盛大交响封神盛宴】
   * Epic orchestral jackpot crescendo with sub-bass drop,
   * grand ascending stardust harp cascade, glorious double-octave triumph chord,
   * and showering crystal bell fireworks!
   */
  public playStreak10() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // 1. Sub-bass foundation impact (deep satisfying thud)
      const sub = ctx.createOscillator();
      const subGain = ctx.createGain();
      sub.type = 'triangle';
      sub.frequency.setValueAtTime(130.81, now); // C3
      sub.frequency.exponentialRampToValueAtTime(65.41, now + 0.35); // drops to C2
      subGain.gain.setValueAtTime(0, now);
      subGain.gain.linearRampToValueAtTime(0.3, now + 0.02);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      sub.connect(subGain);
      subGain.connect(ctx.destination);
      sub.start(now);
      sub.stop(now + 0.52);

      // 2. Fast grand harp crescendo (12-note ascending burst, 0s ~ 0.4s)
      const grandScale = [
        261.63, // C4
        329.63, // E4
        392.0, // G4
        523.25, // C5
        587.33, // D5
        659.25, // E5
        783.99, // G5
        880.0, // A5
        1046.5, // C6
        1174.66, // D6
        1318.51, // E6
        1567.98, // G6
        2093.0, // C7
        2637.02, // E7
      ];

      grandScale.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = i > 8 ? 'sine' : 'triangle';
        const startTime = now + i * 0.03;
        osc.frequency.setValueAtTime(freq, startTime);

        // Escalating volume crescendo
        const peakVol = 0.15 + (i / grandScale.length) * 0.15;
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(peakVol, startTime + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.32);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.34);
      });

      // 3. The Grand Golden Major Chord Hit (now + 0.42s)
      const chordTime = now + 0.42;
      const megaChordPitches = [
        130.81, // C3
        261.63, // C4
        392.0, // G4
        523.25, // C5
        659.25, // E5
        783.99, // G5
        1046.5, // C6
        1318.51, // E6
        1567.98, // G6
        2093.0, // C7
      ];

      megaChordPitches.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Slight detune for majestic choral fullness
        osc.type = idx < 2 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, chordTime);
        if (idx >= 3) {
          osc.detune.setValueAtTime((idx % 2 === 0 ? 4 : -4), chordTime);
        }

        const vol = idx < 2 ? 0.25 : 0.15;
        gain.gain.setValueAtTime(0, chordTime);
        gain.gain.linearRampToValueAtTime(vol, chordTime + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, chordTime + 1.1);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(chordTime);
        osc.stop(chordTime + 1.15);
      });

      // 4. Cascading Shower of Stardust Chimes (sparkling golden droplets, 0.5s ~ 1.0s)
      const sparkles = [
        { f: 1567.98, delay: 0.52 }, // G6
        { f: 1975.53, delay: 0.6 }, // B6
        { f: 2093.0, delay: 0.68 }, // C7
        { f: 2637.02, delay: 0.76 }, // E7
        { f: 3135.96, delay: 0.84 }, // G7
        { f: 4186.01, delay: 0.92 }, // C8 ultra sparkle!
      ];

      sparkles.forEach((s) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        const t = now + s.delay;
        osc.frequency.setValueAtTime(s.f, t);

        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.18, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + 0.46);
      });
    } catch (e) {
      console.warn('Audio playback error', e);
    }
  }

  /**
   * Gentle, sympathetic descending sigh tone on mistake
   */
  public playIncorrect() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Tone 1: F4 -> D4
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

      // Tone 2: C4 -> Bb3
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
