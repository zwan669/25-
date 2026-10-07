import React, { useEffect, useState } from 'react';
import { soundManager, ShieldEvent } from '../utils/soundEffects';
import { Flame, Zap, Shield, Sparkles, X, ShieldCheck, ShieldAlert } from 'lucide-react';

interface ToastData {
  id: string;
  type: 'streak5' | 'streak10' | 'shield_earned' | 'shield_used' | 'shield_manual';
  title: string;
  subtitle: string;
  badge: string;
  streak: number;
}

export const StreakToast: React.FC = () => {
  const [toast, setToast] = useState<ToastData | null>(null);

  useEffect(() => {
    // Listen to streak milestones
    const unsubStreak = soundManager.subscribeStreak((newStreak) => {
      if (newStreak === 5) {
        setToast({
          id: 'streak5-' + Date.now(),
          type: 'streak5',
          title: '5连对达成！升级【疾风连击音效】！',
          subtitle: '获得【错题保护卡】x1！继续连对5题解锁10连对封神音效！',
          badge: `🔥 连对 x5 · 保护卡+1`,
          streak: newStreak,
        });
      } else if (newStreak === 10 || (newStreak > 10 && newStreak % 10 === 0)) {
        setToast({
          id: 'streak10-' + Date.now(),
          type: 'streak10',
          title: `${newStreak}连对封神！升级【顶级超爽华丽盛宴音效】！`,
          subtitle: '获得【错题保护卡】x1！交响盛典 + 金币星尘音效已激活！',
          badge: `⚡ 连对 x${newStreak} · 保护卡+1`,
          streak: newStreak,
        });
      }
    });

    // Listen to shield events
    const unsubShield = soundManager.subscribeShieldEvents((event: ShieldEvent) => {
      if (event.type === 'used') {
        setToast({
          id: 'shield_used-' + Date.now(),
          type: 'shield_used',
          title: '🛡️ 错题保护卡生效！失误已自动抵消！',
          subtitle: `力场已吸收错误，当前连对 x${event.streak} 完好无损！剩余保护卡: ${event.remaining} 张`,
          badge: `🛡️ 连击未中断！`,
          streak: event.streak,
        });
      } else if (event.type === 'manual_add') {
        setToast({
          id: 'shield_manual-' + Date.now(),
          type: 'shield_manual',
          title: `🛡️ 手动补充成功！获得保护卡 +${event.amount}`,
          subtitle: `当前拥有 ${event.remaining} 张错题保护卡。答错时将自动抵消失误保护连击！`,
          badge: `🛡️ 保护卡: ${event.remaining} 张`,
          streak: soundManager.getStreak(),
        });
      }
    });

    return () => {
      unsubStreak();
      unsubShield();
    };
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4200);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (!toast) return null;

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-50 animate-fadeIn pointer-events-auto max-w-md w-full px-4 sm:px-0">
      <div
        className={`p-4 sm:p-5 rounded-2xl shadow-2xl border flex items-center gap-4 transition-all duration-300 ${
          toast.type === 'streak10'
            ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-slate-950 border-yellow-200 ring-4 ring-yellow-300/40'
            : toast.type === 'streak5'
            ? 'bg-gradient-to-r from-orange-600 via-rose-600 to-pink-600 text-white border-orange-300/50 ring-4 ring-orange-400/30'
            : toast.type === 'shield_used'
            ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white border-emerald-300/60 ring-4 ring-teal-400/30'
            : 'bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-700 text-white border-cyan-300/60 ring-4 ring-cyan-400/30'
        }`}
      >
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${
            toast.type === 'streak10'
              ? 'bg-amber-100 text-amber-700'
              : toast.type === 'streak5'
              ? 'bg-white/20 text-white'
              : 'bg-white/20 text-white'
          }`}
        >
          {toast.type === 'streak10' ? (
            <Zap className="w-7 h-7 fill-amber-500 text-amber-600 animate-pulse" />
          ) : toast.type === 'streak5' ? (
            <Flame className="w-7 h-7 fill-orange-200 text-white animate-pulse" />
          ) : toast.type === 'shield_used' ? (
            <ShieldCheck className="w-7 h-7 text-emerald-200 fill-emerald-500/40 animate-pulse" />
          ) : (
            <Shield className="w-7 h-7 text-cyan-200 fill-cyan-400/40 animate-pulse" />
          )}
        </div>

        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
                toast.type === 'streak10'
                  ? 'bg-slate-900 text-yellow-300'
                  : 'bg-black/30 text-white'
              }`}
            >
              {toast.badge}
            </span>
          </div>
          <h4
            className={`text-sm sm:text-base font-black tracking-tight leading-snug ${
              toast.type === 'streak10' ? 'text-slate-950' : 'text-white'
            }`}
          >
            {toast.title}
          </h4>
          <p
            className={`text-xs leading-relaxed ${
              toast.type === 'streak10' ? 'text-slate-800 font-medium' : 'text-white/90'
            }`}
          >
            {toast.subtitle}
          </p>
        </div>

        <button
          onClick={() => setToast(null)}
          className={`p-1.5 rounded-lg hover:bg-black/10 transition-colors shrink-0 self-start ${
            toast.type === 'streak10' ? 'text-slate-800' : 'text-white/80'
          }`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
