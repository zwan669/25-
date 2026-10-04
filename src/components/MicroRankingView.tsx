import React, { useState, useMemo } from 'react';
import { MICRO_POINTS } from '../data/grammarData';
import { MicroPoint, WrongQuestionRecord } from '../types/grammar';
import { PointAccordionItem } from './PointAccordionItem';
import { Trophy, TrendingUp, Filter, ArrowUpDown } from 'lucide-react';

interface MicroRankingViewProps {
  searchQuery: string;
  isQuizMode: boolean;
  openPointIds: Set<string>;
  onTogglePoint: (id: string) => void;
  masteredIds: Set<string>;
  onToggleMastered: (id: string) => void;
  selectedFilter: string;
  onAddWrongQuestion: (record: WrongQuestionRecord) => void;
  wrongQuestionIds: Set<string>;
  onRemoveWrongQuestion: (id: string) => void;
}

export const MicroRankingView: React.FC<MicroRankingViewProps> = ({
  searchQuery,
  isQuizMode,
  openPointIds,
  onTogglePoint,
  masteredIds,
  onToggleMastered,
  selectedFilter,
  onAddWrongQuestion,
  wrongQuestionIds,
  onRemoveWrongQuestion,
}) => {
  const [sortOption, setSortOption] = useState<'frequency' | 'rank' | 'difficulty'>('frequency');

  // Filter and sort points
  const filteredAndSortedPoints = useMemo(() => {
    let result = [...MICRO_POINTS];

    // Filter by quick filter
    if (selectedFilter === 'has_wrong') {
      result = result.filter((p) => p.examples.some((ex) => wrongQuestionIds.has(ex.id)));
    } else if (selectedFilter === 'mastered') {
      result = result.filter((p) => masteredIds.has(p.id));
    } else if (selectedFilter === 'unmastered') {
      result = result.filter((p) => !masteredIds.has(p.id));
    } else if (selectedFilter === 'trap') {
      result = result.filter((p) => p.isKeyTrap);
    } else if (selectedFilter === 'high_freq') {
      result = result.filter((p) => p.frequency >= 20);
    } else if (selectedFilter === 'with_prompt') {
      result = result.filter((p) => p.blankType === 'with_prompt');
    } else if (selectedFilter === 'without_prompt') {
      result = result.filter((p) => p.blankType === 'without_prompt');
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => {
        const matchName = p.name.toLowerCase().includes(q);
        const matchSub = p.subCategory.toLowerCase().includes(q);
        const matchRule = p.ruleSummary.toLowerCase().includes(q);
        const matchSignals = p.signalWords?.some((w) => w.toLowerCase().includes(q));
        const matchExamples = p.examples.some(
          (ex) =>
            ex.sentence.toLowerCase().includes(q) ||
            ex.answer.toLowerCase().includes(q) ||
            ex.source.toLowerCase().includes(q) ||
            (ex.tag && ex.tag.toLowerCase().includes(q))
        );
        return matchName || matchSub || matchRule || matchSignals || matchExamples;
      });
    }

    // Sort
    if (sortOption === 'frequency') {
      result.sort((a, b) => b.frequency - a.frequency);
    } else if (sortOption === 'rank') {
      result.sort((a, b) => a.rank - b.rank);
    } else if (sortOption === 'difficulty') {
      result.sort((a, b) => b.difficulty.length - a.difficulty.length);
    }

    return result;
  }, [searchQuery, selectedFilter, sortOption, masteredIds]);

  const maxFreq = 46;

  return (
    <div className="space-y-6">
      {/* Title & Sorting Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            细小考点考频排行榜 (19大考点全景)
          </h2>
          <span className="text-xs bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
            共 {filteredAndSortedPoints.length} 个考点
          </span>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" /> 排序方式:
          </span>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as any)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="frequency">按考频高低排序 (高→低)</option>
            <option value="rank">按全省大考标准排名 (#1→#19)</option>
            <option value="difficulty">按考点难度等级 (难→易)</option>
          </select>
        </div>
      </div>

      {/* Top 3 Quick Glance Cards if in default view */}
      {!searchQuery && selectedFilter === 'all' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-800/60 bg-gradient-to-br from-amber-50/70 to-amber-100/30 dark:from-amber-950/30 dark:to-slate-900">
            <div className="flex items-center justify-between text-xs text-amber-800 dark:text-amber-300 font-semibold mb-1">
              <span>🥇 考频榜首 · 实词之王</span>
              <span>44 次 (10.2%)</span>
            </div>
            <div className="font-bold text-slate-900 dark:text-slate-100 text-base">
              动词非谓语 (to do / doing / done)
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-1">
              判断句子缺不缺谓语，不缺谓语一律考虑非谓语。
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-gradient-to-br from-slate-50 to-slate-100/40 dark:from-slate-800/40 dark:to-slate-900">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-semibold mb-1">
              <span>🥈 考频第二 · 名词主力</span>
              <span>42 次 (9.8%)</span>
            </div>
            <div className="font-bold text-slate-900 dark:text-slate-100 text-base">
              可数名词复数形式
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-1">
              different, many 提示，注意辅音+y变-ies与不规则。
            </div>
          </div>

          <div className="p-4 rounded-xl border border-sky-300 dark:border-sky-800/60 bg-gradient-to-br from-sky-50/70 to-sky-100/30 dark:from-sky-950/30 dark:to-slate-900">
            <div className="flex items-center justify-between text-xs text-sky-800 dark:text-sky-300 font-semibold mb-1">
              <span>🥉 虚词之王 · 介词高频</span>
              <span>46 次 (10.7%)</span>
            </div>
            <div className="font-bold text-slate-900 dark:text-slate-100 text-base">
              介词与固定搭配 (with, for, in...)
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-1">
              with (11次), for (9次), in (8次)，take part in等。
            </div>
          </div>
        </div>
      )}

      {/* Micro Points List with Visual Bars */}
      <div className="space-y-3">
        {filteredAndSortedPoints.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500">
            未找到符合条件的考点或例题，请尝试其他关键词
          </div>
        ) : (
          filteredAndSortedPoints.map((point) => {
            const percentageWidth = Math.round((point.frequency / maxFreq) * 100);

            return (
              <div key={point.id} className="relative group">
                {/* Visual Bar Indicator along top border */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800 rounded-t-xl overflow-hidden pointer-events-none z-10">
                  <div
                    className={`h-full transition-all duration-500 ${
                      point.blankType === 'with_prompt'
                        ? 'bg-emerald-500/60 group-hover:bg-emerald-500'
                        : 'bg-sky-500/60 group-hover:bg-sky-500'
                    }`}
                    style={{ width: `${percentageWidth}%` }}
                  />
                </div>

                <PointAccordionItem
                  point={point}
                  isOpen={openPointIds.has(point.id)}
                  onToggle={() => onTogglePoint(point.id)}
                  isQuizMode={isQuizMode}
                  isMastered={masteredIds.has(point.id)}
                  onToggleMastered={onToggleMastered}
                  onAddWrongQuestion={onAddWrongQuestion}
                  wrongQuestionIds={wrongQuestionIds}
                  onRemoveWrongQuestion={onRemoveWrongQuestion}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
