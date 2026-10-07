import React, { useState, useEffect } from 'react';
import { soundManager } from '../utils/soundEffects';
import {
  CheckCircle,
  X,
  Flame,
  Zap,
  Shield,
  Plus,
  TrendingUp,
  Target,
  ChevronUp,
} from 'lucide-react';

interface FloatingStatsHudProps {
  correctCount: number;
  practicedCount: number;
  totalQuestions?: number;
}

export const FloatingStatsHud: React.FC<FloatingStatsHudProps> = ({
  correctCount,
  practicedCount,
  totalQuestions = 430,
}) => {
  const [isOpen, setIsOpen] = useState(() => {
    try {
      const saved = localStorage.getItem('zj_stats_hud_visible');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const [streak, setStreak] = useState(() => soundManager.getStreak());
  const [shields, setShields] = useState(() => soundManager.getShields());

  useEffect(() => {
    const unsubStreak = soundManager.subscribeStreak((newStreak) => {
      setStreak(newStreak);
    });
    const unsubShields = soundManager.subscribeShields((newShields) => {
      setShields(newShields);
    });
    return () => {
      unsubStreak();
      unsubShields();
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    try {
      localStorage.setItem('zj_stats_hud_visible', 'false');
    } catch {}
  };

  const handleOpen = () => {
    setIsOpen(true);
    try {
      localStorage.setItem('zj_stats_hud_visible', 'true');
    } catch {}
  };

  const accuracyRate =
    practicedCount > 0 ? Math.round((correctCount / practicedCount) * 100) : 0;
  const progressPercent = Math.min(
    100,
    Math.round((practicedCount / totalQuestions) * 100)
  );

  // If user minimized the HUD, render a sleek small pill badge that can be clicked to re-open anytime
  if (!isOpen) {
    return (
      <div className="fixed bottom-5 right-5 z-40 animate-fadeIn">
        <button
          onClick={handleOpen}
          className="group flex items-center gap-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 shadow-xl hover:shadow-2xl rounded-full px-3.5 py-2 transition-all duration-200 hover:scale-105 text-xs"
          title="点击展开实时做题战报浮窗"
        >
          <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100">
            <span>已做对</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">
              {correctCount}
            </span>
            <span>题</span>
          </div>
          {streak > 0 && (
            <span
              className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                streak >= 10
                  ? 'bg-amber-400 text-slate-950'
                  : streak >= 5
                  ? 'bg-orange-500 text-white'
                  : 'bg-emerald-500 text-white'
              }`}
            >
              x{streak}连
            </span>
          )}
          <ChevronUp className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform group-hover:-translate-y-0.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 max-w-xs w-72 sm:w-80 animate-fadeIn select-none pointer-events-auto">
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xl p-4 space-y-3.5 transition-all">
        {/* Header: Title + Close 'X' Button */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <h4 className="text-xs font-extrabold tracking-wide text-slate-800 dark:text-slate-100 flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-indigo-500" />
              实时做题战报
            </h4>
          </div>

          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="关闭浮窗（随时可点击右下角小标重新展开）"
            aria-label="关闭实时战报浮窗"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hero Correct Stat */}
        <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-sky-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-sky-950/20 border border-emerald-200/60 dark:border-emerald-800/60 rounded-xl p-3 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
              当前累计做对
            </div>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight font-mono">
                {correctCount}
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                / {practicedCount} 题已练
              </span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              综合正确率
            </div>
            <div className="text-xl font-extrabold text-slate-800 dark:text-slate-100 font-mono mt-0.5">
              {accuracyRate}%
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>总题量进度</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {practicedCount} / {totalQuestions} 空 ({progressPercent}%)
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Dynamic Streak & Shield Cards Row */}
        <div className="flex items-center gap-2 pt-1">
          {/* Streak Badge */}
          <div
            className={`flex-1 px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center justify-between ${
              streak >= 10
                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-xs'
                : streak >= 5
                ? 'bg-orange-500 text-white border-orange-400 shadow-xs'
                : streak > 0
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-1.5 truncate">
              {streak >= 10 ? (
                <Zap className="w-3.5 h-3.5 fill-slate-950 shrink-0" />
              ) : streak >= 5 ? (
                <Flame className="w-3.5 h-3.5 fill-orange-200 shrink-0" />
              ) : (
                <TrendingUp className="w-3.5 h-3.5 shrink-0" />
              )}
              <span className="truncate">
                {streak > 0 ? `连对 x${streak}` : '连对: 0'}
              </span>
            </div>
            {streak >= 10 && (
              <span className="text-[10px] font-black bg-slate-950 text-yellow-300 px-1 py-0.2 rounded shrink-0">
                超爽
              </span>
            )}
          </div>

          {/* Shield Badge + Quick Add */}
          <div className="flex items-center bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-200 dark:border-cyan-800 rounded-xl p-0.5 text-xs shrink-0">
            <div
              className="px-2 py-1 font-bold text-cyan-800 dark:text-cyan-200 flex items-center gap-1 cursor-pointer"
              title="错题保护卡：每5连对自动+1张，答错时抵消失误保住连击！"
              onClick={() => soundManager.playShieldEarned()}
            >
              <Shield
                className={`w-3.5 h-3.5 ${
                  shields > 0
                    ? 'text-cyan-600 dark:text-cyan-400 fill-cyan-400/40'
                    : 'text-slate-400'
                }`}
              />
              <span className="font-mono font-bold">{shields}</span>
            </div>
            <button
              onClick={() => soundManager.addShield(1)}
              className="p-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-transform active:scale-95"
              title="手动补充 1 张保护卡"
            >
              <Plus className="w-3 h-3 stroke-[3]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
