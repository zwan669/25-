import React, { useState } from 'react';
import { MACRO_CATEGORIES } from '../data/grammarData';
import { MicroPoint, WrongQuestionRecord } from '../types/grammar';
import { PointAccordionItem } from './PointAccordionItem';
import { Layers } from 'lucide-react';

interface MacroViewProps {
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

export const MacroView: React.FC<MacroViewProps> = ({
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
  // Allow toggling macro category active subtab
  const [activeMacroTab, setActiveMacroTab] = useState<'all' | 'with_prompt' | 'without_prompt'>('all');

  // Filter function for search query & filter tags
  const filterPoint = (point: MicroPoint) => {
    // Mastered & Wrong filter
    if (selectedFilter === 'has_wrong') {
      const hasWrong = point.examples.some((ex) => wrongQuestionIds.has(ex.id));
      if (!hasWrong) return false;
    }
    if (selectedFilter === 'mastered' && !masteredIds.has(point.id)) return false;
    if (selectedFilter === 'unmastered' && masteredIds.has(point.id)) return false;
    if (selectedFilter === 'trap' && !point.isKeyTrap) return false;
    if (selectedFilter === 'high_freq' && point.frequency < 20) return false;

    // Search query
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchName = point.name.toLowerCase().includes(q);
    const matchSub = point.subCategory.toLowerCase().includes(q);
    const matchRule = point.ruleSummary.toLowerCase().includes(q);
    const matchSignals = point.signalWords?.some((w) => w.toLowerCase().includes(q));
    const matchExamples = point.examples.some(
      (ex) =>
        ex.sentence.toLowerCase().includes(q) ||
        ex.answer.toLowerCase().includes(q) ||
        ex.source.toLowerCase().includes(q) ||
        (ex.tag && ex.tag.toLowerCase().includes(q))
    );

    return matchName || matchSub || matchRule || matchSignals || matchExamples;
  };

  const visibleMacroCategories = MACRO_CATEGORIES.filter((cat) => {
    if (activeMacroTab === 'all') return true;
    return cat.id === activeMacroTab;
  });

  return (
    <div className="space-y-8">
      {/* Sub-tab switcher within Macro view */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            宏观两大模块分类导图
          </h2>
          <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full">
            实词变形 66% + 虚词填空 34%
          </span>
        </div>

        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-medium">
          <button
            onClick={() => setActiveMacroTab('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeMacroTab === 'all'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            全部大类 (430空)
          </button>
          <button
            onClick={() => setActiveMacroTab('with_prompt')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeMacroTab === 'with_prompt'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            ✅ 有提示词 (284空 / 66%)
          </button>
          <button
            onClick={() => setActiveMacroTab('without_prompt')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeMacroTab === 'without_prompt'
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            🔍 无提示词 (146空 / 34%)
          </button>
        </div>
      </div>

      {/* Categories Loop */}
      {visibleMacroCategories.map((category) => {
        return (
          <section
            key={category.id}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 p-5 sm:p-6 space-y-6 shadow-xs"
          >
            {/* Macro Group Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    {category.title}
                  </h3>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${category.badgeColor}`}
                  >
                    {category.count} 空 · {category.percentage}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  {category.description}
                </p>
              </div>

              {/* Quick Visual Proportion Bar */}
              <div className="w-full md:w-56 shrink-0 bg-slate-100 dark:bg-slate-800 rounded-lg p-2.5">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500 font-medium">中考题量占比</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {category.percentage}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      category.id === 'with_prompt' ? 'bg-emerald-500' : 'bg-sky-500'
                    }`}
                    style={{ width: category.percentage }}
                  />
                </div>
              </div>
            </div>

            {/* Sub Groups inside Macro Group */}
            <div className="space-y-6">
              {category.subGroups.map((subGroup, sIdx) => {
                const filteredPoints = subGroup.points.filter(filterPoint);
                if (filteredPoints.length === 0) return null;

                return (
                  <div key={sIdx} className="space-y-3">
                    {/* SubGroup Header Bar */}
                    <div className="flex items-center justify-between bg-slate-100/80 dark:bg-slate-800/60 px-4 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        <h4 className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-200">
                          {subGroup.name}
                        </h4>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">
                          {subGroup.count} 空
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">
                          {subGroup.ratio}
                        </span>
                      </div>
                    </div>

                    {/* Point Accordion Items */}
                    <div className="space-y-2.5 pl-0 sm:pl-2">
                      {filteredPoints.map((point) => (
                        <PointAccordionItem
                          key={point.id}
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
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
};
