import React, { useEffect, useState } from 'react';
import { soundManager } from '../utils/soundEffects';
import { Flame, Zap, Sparkles, X } from 'lucide-react';

export const StreakToast: React.FC = () => {
  const [streak, setStreak] = useState(() => soundManager.getStreak());
  const [activeTier, setActiveTier] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    return soundManager.subscribeStreak((newStreak) => {
      setStreak(newStreak);

      if (newStreak === 5) {
        setActiveTier(2);
        setVisible(true);
        const timer = setTimeout(() => setVisible(false), 3800);
        return () => clearTimeout(timer);
      } else if (newStreak === 10 || (newStreak > 10 && newStreak % 5 === 0)) {
        setActiveTier(3);
        setVisible(true);
        const timer = setTimeout(() => setVisible(false), 4200);
        return () => clearTimeout(timer);
      }
    });
  }, []);

  if (!visible || !activeTier) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-subtle pointer-events-auto">
      <div
        className={`px-5 py-4 rounded-2xl shadow-2xl border flex items-center gap-4 transition-all duration-300 ${
          activeTier === 3
            ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-slate-950 border-yellow-200 ring-4 ring-yellow-300/40'
            : 'bg-gradient-to-r from-orange-600 via-rose-600 to-pink-600 text-white border-orange-300/50 ring-4 ring-orange-400/30'
        }`}
      >
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${
            activeTier === 3 ? 'bg-amber-100 text-amber-700' : 'bg-white/20 text-white'
          }`}
        >
          {activeTier === 3 ? (
            <Zap className="w-7 h-7 fill-amber-500 text-amber-600 animate-pulse" />
          ) : (
            <Flame className="w-7 h-7 fill-orange-200 text-white animate-pulse" />
          )}
        </div>

        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-extrabold opacity-90">
              {activeTier === 3 ? '⚡ 超神连击达成 ⚡' : '🔥 疾风连击激活 🔥'}
            </span>
            <span
              className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
                activeTier === 3 ? 'bg-slate-900 text-yellow-300' : 'bg-black/30 text-white'
              }`}
            >
              连对 x{streak}
            </span>
          </div>
          <h4 className="text-base sm:text-lg font-black tracking-tight">
            {activeTier === 3
              ? '10连对封神！升级【顶级超爽华丽音效】！'
              : '5连对达成！升级【疾风连击音效】！'}
          </h4>
          <p
            className={`text-xs ${
              activeTier === 3 ? 'text-slate-800 font-medium' : 'text-orange-100'
            }`}
          >
            {activeTier === 3
              ? '交响盛典 + 金币星尘音效已激活，势不可挡！'
              : '继续答对 5 题，将在 10 连对解锁殿堂级终极音效！'}
          </p>
        </div>

        <button
          onClick={() => setVisible(false)}
          className={`p-1.5 rounded-lg hover:bg-black/10 transition-colors ml-2 self-start ${
            activeTier === 3 ? 'text-slate-800' : 'text-white/80'
          }`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
