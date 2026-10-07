/**
 * Web Audio API Sound Effects Manager
 * Includes:
 * - 3-Tier Dynamic Upgraded Correct Audio (1-4 streaks, 5-9 streaks, 10+ streaks)
 * - Mistake Shield Protection System (错题保护卡系统):
 *    * Automatically award +1 Shield Card every 5-streak (每5连对奖励1张保护卡)
 *    * Manual addition/management of shield cards
 *    * Automatically absorbs mistake, plays protective forcefield sound, preserves streak!
 * - Shield Acquired Sound & Shield Absorption Forcefield Sound
 * - Incorrect: Gentle regretful sigh tone
 */

export interface AnswerResult {
  isCorrect: boolean;
  streak: number;
  tier: number;
  shieldAwarded: boolean;
  shieldUsed: boolean;
  shieldsRemaining: number;
}

export type ShieldEvent =
  | { type: 'earned'; streak: number; remaining: number }
  | { type: 'used'; streak: number; remaining: number }
  | { type: 'manual_add'; amount: number; remaining: number };

type StreakListener = (streak: number) => void;
type ShieldListener = (shields: number) => void;
type ShieldEventListener = (event: ShieldEvent) => void;

class SoundEffectsManager {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private currentStreak: number = 0;
  private shields: number = 2; // Default 2 starter shields
  private streakListeners: Set<StreakListener> = new Set();
  private shieldListeners: Set<ShieldListener> = new Set();
  private shieldEventListeners: Set<ShieldEventListener> = new Set();

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
      const savedShields = localStorage.getItem('zj_shield_cards');
      if (savedShields !== null) {
        this.shields = Math.max(0, parseInt(savedShields, 10) || 0);
      } else {
        this.shields = 2; // Starter 2 cards
      }
    } catch {
      this.enabled = true;
      this.currentStreak = 0;
      this.shields = 2;
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

  public getShields(): number {
    return this.shields;
  }

  public setShields(val: number) {
    this.shields = Math.max(0, val);
    try {
      localStorage.setItem('zj_shield_cards', String(this.shields));
    } catch {}
    this.notifyShields();
  }

  /**
   * Manually add shield cards
   */
  public addShield(amount: number = 1): number {
    this.shields += Math.max(1, amount);
    try {
      localStorage.setItem('zj_shield_cards', String(this.shields));
    } catch {}
    this.notifyShields();
    this.notifyShieldEvent({
      type: 'manual_add',
      amount,
      remaining: this.shields,
    });
    this.playShieldEarned();
    return this.shields;
  }

  public subscribeStreak(listener: StreakListener): () => void {
    this.streakListeners.add(listener);
    listener(this.currentStreak);
    return () => this.streakListeners.delete(listener);
  }

  public subscribeShields(listener: ShieldListener): () => void {
    this.shieldListeners.add(listener);
    listener(this.shields);
    return () => this.shieldListeners.delete(listener);
  }

  public subscribeShieldEvents(listener: ShieldEventListener): () => void {
    this.shieldEventListeners.add(listener);
    return () => this.shieldEventListeners.delete(listener);
  }

  private notifyStreak() {
    this.streakListeners.forEach((fn) => {
      try {
        fn(this.currentStreak);
      } catch (e) {
        console.error(e);
      }
    });
  }

  private notifyShields() {
    this.shieldListeners.forEach((fn) => {
      try {
        fn(this.shields);
      } catch (e) {
        console.error(e);
      }
    });
  }

  private notifyShieldEvent(event: ShieldEvent) {
    this.shieldEventListeners.forEach((fn) => {
      try {
        fn(event);
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
   * Main entry point when answering a question:
   * - If correct: increment streak, check tier audio, award +1 shield card every 5 streak!
   * - If incorrect:
   *     - If shields > 0: consume 1 shield, play forcefield deflection sound, preserve streak!
   *     - If shields == 0: reset streak to 0, play regret sound.
   */
  public playAnswerResult(isCorrect: boolean): AnswerResult {
    if (isCorrect) {
      this.currentStreak += 1;
      try {
        localStorage.setItem('zj_sound_streak', String(this.currentStreak));
      } catch {}
      this.notifyStreak();

      // Check if user earned a shield card (every 5-streak: 5, 10, 15, 20...)
      let shieldAwarded = false;
      if (this.currentStreak > 0 && this.currentStreak % 5 === 0) {
        this.shields += 1;
        shieldAwarded = true;
        try {
          localStorage.setItem('zj_shield_cards', String(this.shields));
        } catch {}
        this.notifyShields();
        this.notifyShieldEvent({
          type: 'earned',
          streak: this.currentStreak,
          remaining: this.shields,
        });
      }

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

      return {
        isCorrect: true,
        streak: this.currentStreak,
        tier,
        shieldAwarded,
        shieldUsed: false,
        shieldsRemaining: this.shields,
      };
    } else {
      // User made a mistake! Check if shield card protects them
      if (this.shields > 0) {
        this.shields -= 1;
        try {
          localStorage.setItem('zj_shield_cards', String(this.shields));
        } catch {}
        this.notifyShields();
        this.notifyShieldEvent({
          type: 'used',
          streak: this.currentStreak,
          remaining: this.shields,
        });

        // Play protective forcefield sound!
        this.playShieldAbsorb();

        // Streak is preserved!
        return {
          isCorrect: false,
          streak: this.currentStreak,
          tier: 0,
          shieldAwarded: false,
          shieldUsed: true,
          shieldsRemaining: this.shields,
        };
      } else {
        // No shields: streak resets to 0
        this.currentStreak = 0;
        try {
          localStorage.setItem('zj_sound_streak', '0');
        } catch {}
        this.notifyStreak();
        this.playIncorrect();

        return {
          isCorrect: false,
          streak: 0,
          tier: 0,
          shieldAwarded: false,
          shieldUsed: false,
          shieldsRemaining: 0,
        };
      }
    }
  }

  /**
   * Sound effect when a shield card is earned or added
   * (Sparkling holy/crystallized shield chime)
   */
  public playShieldEarned() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // D-Major sparkling chime arpeggio: D5, F#5, A5, D6, F#6, A6
      const pitches = [587.33, 739.99, 880.0, 1174.66, 1479.98, 1760.0];

      pitches.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        const t = now + i * 0.05;
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.2, t + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + 0.42);
      });

      // Protective dome resonance
      const dome = ctx.createOscillator();
      const domeGain = ctx.createGain();
      dome.type = 'triangle';
      dome.frequency.setValueAtTime(587.33, now + 0.15); // D5
      domeGain.gain.setValueAtTime(0, now + 0.15);
      domeGain.gain.linearRampToValueAtTime(0.18, now + 0.2);
      domeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      dome.connect(domeGain);
      domeGain.connect(ctx.destination);
      dome.start(now + 0.15);
      dome.stop(now + 0.72);
    } catch (e) {
      console.warn('Audio playback error', e);
    }
  }

  /**
   * Sound effect when a shield card absorbs a mistake & preserves streak!
   * (High-tech crystalline forcefield deflection + warm protective energy swell)
   */
  public playShieldAbsorb() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // 1. Glassy shield deflection ping (high metallic strike)
      const ping = ctx.createOscillator();
      const pingGain = ctx.createGain();
      ping.type = 'sine';
      ping.frequency.setValueAtTime(1760.0, now); // A6
      ping.frequency.exponentialRampToValueAtTime(1174.66, now + 0.1); // D6
      pingGain.gain.setValueAtTime(0, now);
      pingGain.gain.linearRampToValueAtTime(0.25, now + 0.01);
      pingGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      ping.connect(pingGain);
      pingGain.connect(ctx.destination);
      ping.start(now);
      ping.stop(now + 0.36);

      // 2. Protective Forcefield Energy Swell (A3 -> E4 -> A4)
      const shieldSwell = [220.0, 329.63, 440.0, 659.25];
      shieldSwell.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = idx === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now + 0.04);

        gain.gain.setValueAtTime(0, now + 0.04);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + 0.04);
        osc.stop(now + 0.76);
      });

      // 3. Gentle harmonic reassurance bell (D6 + F#6)
      [1174.66, 1479.98].forEach((f, i) => {
        const bell = ctx.createOscillator();
        const bellGain = ctx.createGain();
        bell.type = 'sine';
        bell.frequency.setValueAtTime(f, now + 0.2 + i * 0.06);

        bellGain.gain.setValueAtTime(0, now + 0.2 + i * 0.06);
        bellGain.gain.linearRampToValueAtTime(0.16, now + 0.22 + i * 0.06);
        bellGain.gain.exponentialRampToValueAtTime(0.001, now + 0.65 + i * 0.06);

        bell.connect(bellGain);
        bellGain.connect(ctx.destination);

        bell.start(now + 0.2 + i * 0.06);
        bell.stop(now + 0.68 + i * 0.06);
      });
    } catch (e) {
      console.warn('Audio playback error', e);
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

        osc.type = idx === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, chordTime);

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

      // 1. Sub-bass foundation impact
      const sub = ctx.createOscillator();
      const subGain = ctx.createGain();
      sub.type = 'triangle';
      sub.frequency.setValueAtTime(130.81, now);
      sub.frequency.exponentialRampToValueAtTime(65.41, now + 0.35);
      subGain.gain.setValueAtTime(0, now);
      subGain.gain.linearRampToValueAtTime(0.3, now + 0.02);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      sub.connect(subGain);
      subGain.connect(ctx.destination);
      sub.start(now);
      sub.stop(now + 0.52);

      // 2. Fast grand harp crescendo (12-note ascending burst)
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

        const peakVol = 0.15 + (i / grandScale.length) * 0.15;
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(peakVol, startTime + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.32);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.34);
      });

      // 3. The Grand Golden Major Chord Hit
      const chordTime = now + 0.42;
      const megaChordPitches = [
        130.81, 261.63, 392.0, 523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98, 2093.0,
      ];

      megaChordPitches.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = idx < 2 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, chordTime);
        if (idx >= 3) {
          osc.detune.setValueAtTime(idx % 2 === 0 ? 4 : -4, chordTime);
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

      // 4. Cascading Shower of Stardust Chimes
      const sparkles = [
        { f: 1567.98, delay: 0.52 },
        { f: 1975.53, delay: 0.6 },
        { f: 2093.0, delay: 0.68 },
        { f: 2637.02, delay: 0.76 },
        { f: 3135.96, delay: 0.84 },
        { f: 4186.01, delay: 0.92 },
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
   * Gentle, sympathetic descending sigh tone on mistake (when no shield remains)
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
