import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  Layers,
  Trophy,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
  HelpCircle,
  BookOpen,
  ChevronDown,
  ChevronsUpDown,
  BookMarked,
  Filter,
  Volume2,
  VolumeX,
  Flame,
  Zap,
  Music,
  RotateCcw,
} from 'lucide-react';
import { soundManager } from '../utils/soundEffects';
import { EXAM_STATISTICS } from '../data/grammarData';
import { LastActiveLocation } from '../types/grammar';
import {
  Compass,
  CheckCheck,
  History,
} from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeView: 'macro' | 'micro';
  onViewChange: (view: 'macro' | 'micro') => void;
  isQuizMode: boolean;
  onToggleQuizMode: () => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onOpenPitfalls: () => void;
  onOpenStrategy: () => void;
  onOpenMistakes: () => void;
  selectedFilter: string;
  onSelectFilter: (filter: string) => void;
  masteredCount: number;
  wrongCount: number;
  practicedCount?: number;
  correctCount?: number;
  lastActive?: LastActiveLocation | null;
  onResumeLast?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  activeView,
  onViewChange,
  isQuizMode,
  onToggleQuizMode,
  onExpandAll,
  onCollapseAll,
  onOpenPitfalls,
  onOpenStrategy,
  onOpenMistakes,
  selectedFilter,
  onSelectFilter,
  masteredCount,
  wrongCount,
  practicedCount = 0,
  correctCount = 0,
  lastActive,
  onResumeLast,
}) => {
  const [isSoundEnabled, setIsSoundEnabled] = useState(() => soundManager.isEnabled());
  const [streak, setStreak] = useState(() => soundManager.getStreak());
  const [showSoundMenu, setShowSoundMenu] = useState(false);
  const soundMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return soundManager.subscribeStreak((newStreak) => {
      setStreak(newStreak);
    });
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (soundMenuRef.current && !soundMenuRef.current.contains(e.target as Node)) {
        setShowSoundMenu(false);
      }
    };
    if (showSoundMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSoundMenu]);

  const progressPercent = Math.min(
    100,
    Math.round((practicedCount / EXAM_STATISTICS.totalBlanks) * 100)
  );
  const accuracyRate =
    practicedCount > 0 ? Math.round((correctCount / practicedCount) * 100) : 0;

  return (
    <header className="space-y-5">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 rounded-full bg-indigo-500/10 pointer-events-none blur-2xl" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-48 h-48 rounded-full bg-sky-500/10 pointer-events-none blur-2xl" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 text-xs px-3 py-1 rounded-full font-semibold tracking-wide">
              浙江 2025 中考专项速查
            </span>
            <span className="bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs px-3 py-1 rounded-full font-semibold">
              一模 21 篇 + 二模 22 篇 · 全样本 430 空大数据
            </span>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
              中考英语语法填空考点频率汇总与速查宝典
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-3xl leading-relaxed">
              根据全省 43 篇一模二模真题精细化拆解，提供<strong>宏观两大分类体系</strong>与<strong>细小知识点考频排行榜</strong>，支持全考点折叠解析、真题实战例题自测、避坑攻略与持久化本地错题本。
            </p>
          </div>

          {/* Key Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
              <div className="text-xs text-indigo-200">真题样本覆盖</div>
              <div className="text-lg sm:text-xl font-bold mt-0.5">43 篇 / 430 空</div>
              <div className="text-[11px] text-slate-300 mt-0.5">一模210空 + 二模220空</div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
              <div className="text-xs text-emerald-300">✅ 有提示词 (实词)</div>
              <div className="text-lg sm:text-xl font-bold mt-0.5 text-emerald-300">
                284 空 (66.0%)
              </div>
              <div className="text-[11px] text-slate-300 mt-0.5">动词、名词、形副主力</div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
              <div className="text-xs text-sky-300">🔍 无提示词 (虚词)</div>
              <div className="text-lg sm:text-xl font-bold mt-0.5 text-sky-300">
                146 空 (34.0%)
              </div>
              <div className="text-[11px] text-slate-300 mt-0.5">介词、连词、冠词高频</div>
            </div>

            <div
              onClick={onOpenMistakes}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-xs rounded-xl p-3 border border-white/10 cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between text-xs text-rose-300">
                <span>📕 错题本</span>
                <span className="bg-rose-500 text-white font-bold px-1.5 py-0.2 rounded-full text-[10px]">
                  本地缓存
                </span>
              </div>
              <div className="text-lg sm:text-xl font-bold mt-0.5 text-rose-300 flex items-center gap-1.5">
                <span>{wrongCount} 道待攻克</span>
              </div>
              <div className="text-[11px] text-slate-300 mt-0.5">点击进入错题专项自测</div>
            </div>
          </div>

          {/* Persistent Practice Progress & Last Active Quick Jump Bar */}
          <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                <CheckCheck className="w-4 h-4 text-emerald-400" />
                <span>做题记录追踪：</span>
                <span className="text-white font-bold">
                  {practicedCount} / {EXAM_STATISTICS.totalBlanks} 空
                </span>
                <span className="text-indigo-300">({progressPercent}%)</span>
              </div>

              {practicedCount > 0 && (
                <div className="flex items-center gap-2 text-slate-300">
                  <span>· 正确: <strong className="text-emerald-300">{correctCount}</strong> 题</span>
                  <span>· 正确率: <strong className="text-amber-300">{accuracyRate}%</strong></span>
                </div>
              )}
            </div>

            {lastActive && onResumeLast && (
              <button
                onClick={onResumeLast}
                className="bg-indigo-500/30 hover:bg-indigo-500/50 border border-indigo-400/40 text-white px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-xs hover:scale-[1.02] shrink-0"
                title={`上次做到：${lastActive.pointName} (${lastActive.source})`}
              >
                <Compass className="w-3.5 h-3.5 text-amber-300 animate-spin-slow" />
                <span>继续做题：上次停留【{lastActive.pointName.slice(0, 8)}...】</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Interactive Controls Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-4">
        {/* Search & Top Action Buttons */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="搜索考点名称、语法规则、例题句子、地名 (如: 拱墅/临平/非谓语/than/it is/介词)..."
              className="w-full pl-10 pr-9 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 placeholder-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Guidance Modals & Mistakes Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onOpenMistakes}
              className={`px-3 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shrink-0 border ${
                wrongCount > 0
                  ? 'bg-rose-500 text-white border-rose-600 hover:bg-rose-600 shadow-xs'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 border-rose-200 dark:border-rose-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>错题本 ({wrongCount})</span>
            </button>

            <button
              onClick={onOpenPitfalls}
              className="px-3 py-2 text-xs font-bold rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 border border-amber-200 dark:border-amber-800 flex items-center gap-1.5 transition-colors shrink-0"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              易错避坑 6 大黄金定律
            </button>

            <button
              onClick={onOpenStrategy}
              className="px-3 py-2 text-xs font-bold rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 transition-colors shrink-0"
            >
              <Lightbulb className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              考情规则与解题三步法
            </button>
          </div>
        </div>

        {/* View Switcher, Quiz Toggle, and Expand/Collapse Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* Primary View Mode Tabs */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto font-medium">
            <button
              onClick={() => onViewChange('macro')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                activeView === 'macro'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              宏观分类体系 (实词 vs 虚词)
            </button>
            <button
              onClick={() => onViewChange('micro')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                activeView === 'micro'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              细小考点排行榜 (#1 - #19)
            </button>
          </div>

          {/* Right Toolbar: Quiz Mode & Expand/Collapse */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Quiz Mode Toggle */}
            <button
              onClick={onToggleQuizMode}
              className={`px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 transition-colors ${
                isQuizMode
                  ? 'bg-amber-500 text-white border-amber-600 shadow-xs font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
              }`}
              title="切换自测互动模式，隐藏答案供自己做题"
            >
              <span>{isQuizMode ? '🎯 自测模式（答案遮罩中）' : '📖 学习模式（答案解析展示）'}</span>
            </button>

            {/* Live Streak Indicator */}
            {streak > 0 && (
              <div
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-black flex items-center gap-1.5 transition-all shadow-xs ${
                  streak >= 10
                    ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 border-amber-300 ring-2 ring-yellow-400/40 animate-pulse'
                    : streak >= 5
                    ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white border-orange-400'
                    : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                }`}
                title={`当前连对 ${streak} 题！${
                  streak >= 10
                    ? '已激活 10 连对顶级超爽华丽盛宴音效！'
                    : streak >= 5
                    ? '已激活 5 连对爽快升级连击音效！'
                    : '再连对 ' + (5 - streak) + ' 题即可升级音效！'
                }`}
              >
                {streak >= 10 ? (
                  <Zap className="w-3.5 h-3.5 fill-slate-950" />
                ) : (
                  <Flame className="w-3.5 h-3.5 fill-orange-200" />
                )}
                <span>连对 x{streak}</span>
                {streak >= 10 && (
                  <span className="text-[10px] bg-slate-950 text-yellow-300 px-1 py-0.2 rounded font-black">
                    超爽
                  </span>
                )}
              </div>
            )}

            {/* Sound Effects Toggle & Audition Menu */}
            <div className="relative" ref={soundMenuRef}>
              <div className="flex items-center">
                <button
                  onClick={() => {
                    const next = soundManager.toggle();
                    setIsSoundEnabled(next);
                    if (next) soundManager.playCorrect();
                  }}
                  className={`px-2.5 py-1.5 rounded-l-lg border font-medium flex items-center gap-1 transition-colors ${
                    isSoundEnabled
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-600'
                  }`}
                  title={isSoundEnabled ? '音效已开启（做对/做错实时音效），点击静音' : '音效已静音，点击开启'}
                >
                  {isSoundEnabled ? (
                    <Volume2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span className="hidden sm:inline text-xs">
                    {isSoundEnabled ? '音效' : '静音'}
                  </span>
                </button>

                <button
                  onClick={() => setShowSoundMenu(!showSoundMenu)}
                  className="px-1.5 py-1.5 rounded-r-lg border-y border-r border-indigo-200 dark:border-indigo-800 bg-indigo-100/70 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 text-xs flex items-center"
                  title="试听升级音效 (普通 / 5连对升级 / 10连对封神)"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>

              {/* Sound Audition Menu */}
              {showSoundMenu && (
                <div className="absolute right-0 mt-1.5 w-60 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 text-xs space-y-1 animate-fadeIn">
                  <div className="px-2 py-1 font-bold text-slate-500 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span>音效试听（连对升级）</span>
                    <Music className="w-3.5 h-3.5 text-indigo-500" />
                  </div>

                  <button
                    onClick={() => {
                      soundManager.setEnabled(true);
                      setIsSoundEnabled(true);
                      soundManager.playCorrect();
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between group"
                  >
                    <span className="text-slate-700 dark:text-slate-200">🎵 普通做对 (1-4连对)</span>
                    <span className="text-[10px] text-slate-400 group-hover:text-indigo-500">清脆和弦</span>
                  </button>

                  <button
                    onClick={() => {
                      soundManager.setEnabled(true);
                      setIsSoundEnabled(true);
                      soundManager.playStreak5();
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-950/40 flex items-center justify-between group"
                  >
                    <span className="text-orange-700 dark:text-orange-300 font-bold flex items-center gap-1">
                      <Flame className="w-3 h-3 text-orange-500" /> 5连对升级音效
                    </span>
                    <span className="text-[10px] bg-orange-100 dark:bg-orange-900/60 text-orange-700 dark:text-orange-300 px-1.5 py-0.2 rounded font-bold">爽快连击</span>
                  </button>

                  <button
                    onClick={() => {
                      soundManager.setEnabled(true);
                      setIsSoundEnabled(true);
                      soundManager.playStreak10();
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/40 flex items-center justify-between group"
                  >
                    <span className="text-amber-700 dark:text-amber-300 font-extrabold flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-500" /> 10连对封神盛宴
                    </span>
                    <span className="text-[10px] bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 px-1.5 py-0.2 rounded font-black">超爽顶级</span>
                  </button>

                  <button
                    onClick={() => {
                      soundManager.setEnabled(true);
                      setIsSoundEnabled(true);
                      soundManager.playIncorrect();
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-slate-500"
                  >
                    <span>💔 做错遗憾叹气</span>
                    <span className="text-[10px] text-slate-400">温柔提醒</span>
                  </button>

                  {streak > 0 && (
                    <div className="pt-1 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between px-2 text-[11px]">
                      <span className="text-slate-500">当前连对: {streak}</span>
                      <button
                        onClick={() => soundManager.setStreak(0)}
                        className="text-rose-500 hover:underline flex items-center gap-0.5"
                      >
                        <RotateCcw className="w-3 h-3" /> 重置
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Accordion Fast Action */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
              <button
                onClick={onExpandAll}
                className="px-2 py-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded"
                title="展开全部折叠面板"
              >
                展开全部
              </button>
              <span className="text-slate-300">|</span>
              <button
                onClick={onCollapseAll}
                className="px-2 py-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded"
                title="折叠全部面板"
              >
                收起全部
              </button>
            </div>
          </div>
        </div>

        {/* Filter Chips Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-slate-400 flex items-center gap-1 shrink-0 font-medium mr-1">
            <Filter className="w-3 h-3" /> 考点筛选:
          </span>
          {[
            { id: 'all', label: '全部考点 (19)' },
            { id: 'high_freq', label: '🔥 超高频 (≥20次)' },
            { id: 'trap', label: '⚠️ 易错重灾区' },
            { id: 'with_prompt', label: '✅ 有提示词 (66%)' },
            { id: 'without_prompt', label: '🔍 无提示词 (34%)' },
            { id: 'practiced', label: `📝 已刷题目 (${practicedCount})` },
            { id: 'unpracticed', label: '⚪ 未刷考点' },
            { id: 'has_wrong', label: `📕 包含错题 (${wrongCount})` },
            { id: 'mastered', label: '已掌握' },
            { id: 'unmastered', label: '待掌握' },
          ].map((chip) => (
            <button
              key={chip.id}
              onClick={() => onSelectFilter(chip.id)}
              className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-all ${
                selectedFilter === chip.id
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
