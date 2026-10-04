import React, { useState, useMemo } from 'react';
import { MicroPoint, WrongQuestionRecord } from '../types/grammar';
import {
  ChevronDown,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
  Eye,
  EyeOff,
  Bookmark,
  BookmarkCheck,
  Tag,
  Sparkles,
  ListFilter,
  BookOpen,
} from 'lucide-react';

interface PointAccordionItemProps {
  point: MicroPoint;
  isOpen: boolean;
  onToggle: () => void;
  isQuizMode: boolean;
  isMastered: boolean;
  onToggleMastered: (id: string) => void;
  onAddWrongQuestion: (record: WrongQuestionRecord) => void;
  wrongQuestionIds: Set<string>;
  onRemoveWrongQuestion: (id: string) => void;
}

export const PointAccordionItem: React.FC<PointAccordionItemProps> = ({
  point,
  isOpen,
  onToggle,
  isQuizMode,
  isMastered,
  onToggleMastered,
  onAddWrongQuestion,
  wrongQuestionIds,
  onRemoveWrongQuestion,
}) => {
  // Whether to show all examples or only the first batch (e.g. 6)
  const [showAllQuestions, setShowAllQuestions] = useState(true);
  const [regionFilter, setRegionFilter] = useState<string>('all');

  // Local state for revealing answers when in quiz mode
  const [revealedExamples, setRevealedExamples] = useState<Record<string, boolean>>({});
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});

  // Helper for flexible checking of answers (supports "who / that", "because / as" etc.)
  const isAnswerMatching = (input: string, target: string) => {
    const cleanInput = input.trim().toLowerCase();
    if (!cleanInput) return false;
    const variants = target.split('/').map((s) => s.trim().toLowerCase());
    return variants.includes(cleanInput);
  };

  const handleCheckAnswer = (exId: string) => {
    const ex = point.examples.find((e) => e.id === exId);
    if (!ex) return;

    const userAns = userAnswers[exId]?.trim() || '';
    const isCorrect = isAnswerMatching(userAns, ex.answer);

    // If answer is incorrect or empty when checking, automatically record to wrong questions notebook!
    if (!isCorrect) {
      onAddWrongQuestion({
        id: ex.id,
        pointId: point.id,
        pointName: point.name,
        subCategory: point.subCategory,
        source: ex.source,
        sentence: ex.sentence,
        prompt: ex.prompt,
        answer: ex.answer,
        analysis: ex.analysis,
        tag: ex.tag,
        userAnswer: userAns,
        addedAt: Date.now(),
      });
    }

    // Toggle reveal state
    setRevealedExamples((prev) => ({
      ...prev,
      [exId]: true,
    }));
  };

  const toggleReveal = (exId: string) => {
    if (!revealedExamples[exId]) {
      handleCheckAnswer(exId);
    } else {
      setRevealedExamples((prev) => ({
        ...prev,
        [exId]: false,
      }));
    }
  };

  const handleRevealAll = () => {
    const allRev: Record<string, boolean> = {};
    point.examples.forEach((ex) => {
      allRev[ex.id] = true;
      const userAns = userAnswers[ex.id]?.trim() || '';
      const isCorrect = isAnswerMatching(userAns, ex.answer);
      if (!isCorrect && userAns) {
        onAddWrongQuestion({
          id: ex.id,
          pointId: point.id,
          pointName: point.name,
          subCategory: point.subCategory,
          source: ex.source,
          sentence: ex.sentence,
          prompt: ex.prompt,
          answer: ex.answer,
          analysis: ex.analysis,
          tag: ex.tag,
          userAnswer: userAns,
          addedAt: Date.now(),
        });
      }
    });
    setRevealedExamples(allRev);
  };

  const handleHideAll = () => {
    setRevealedExamples({});
  };

  const handleInputChange = (exId: string, val: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [exId]: val,
    }));
  };

  // Helper for rank badge styling
  const getRankBadgeClass = (rank: number) => {
    if (rank === 1) return 'bg-amber-500 text-white shadow-sm';
    if (rank === 2) return 'bg-slate-400 text-white shadow-sm';
    if (rank === 3) return 'bg-amber-700 text-white shadow-sm';
    if (rank <= 6) return 'bg-blue-600 text-white';
    return 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300';
  };

  // Available regions in this point's questions
  const availableRegions = useMemo(() => {
    const regions = new Set<string>();
    point.examples.forEach((ex) => {
      const match = ex.source.match(/2025·([^·\d]+)/);
      if (match && match[1]) {
        const sourceName = match[1];
        if (sourceName.includes('杭州')) regions.add('杭州');
        else if (sourceName.includes('宁波')) regions.add('宁波');
        else if (sourceName.includes('温州')) regions.add('温州');
        else if (sourceName.includes('金华')) regions.add('金华');
        else if (sourceName.includes('台州')) regions.add('台州');
        else if (sourceName.includes('湖州')) regions.add('湖州');
        else if (sourceName.includes('绍兴')) regions.add('绍兴');
        else if (sourceName.includes('嘉兴')) regions.add('嘉兴');
        else if (sourceName.includes('衢州')) regions.add('衢州');
        else if (sourceName.includes('舟山')) regions.add('舟山');
        else if (sourceName.includes('丽水')) regions.add('丽水');
        else regions.add('名校');
      }
    });
    return Array.from(regions);
  }, [point.examples]);

  // Filtered examples
  const filteredExamples = useMemo(() => {
    return point.examples.filter((ex) => {
      if (regionFilter !== 'all') {
        if (!ex.source.includes(regionFilter)) return false;
      }
      return true;
    });
  }, [point.examples, regionFilter]);

  const displayedExamples = showAllQuestions
    ? filteredExamples
    : filteredExamples.slice(0, 6);

  return (
    <div
      className={`border rounded-xl transition-all duration-200 overflow-hidden ${
        isOpen
          ? 'border-indigo-400 dark:border-indigo-500 shadow-md ring-1 ring-indigo-400/30 bg-white dark:bg-slate-900'
          : 'border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      {/* Header bar (clickable) */}
      <div
        onClick={onToggle}
        className="p-4 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 select-none"
      >
        <div className="flex items-center gap-3 flex-wrap">
          {/* Rank Badge */}
          <span
            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${getRankBadgeClass(
              point.rank
            )}`}
          >
            #{point.rank}
          </span>

          {/* Point Name */}
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            {point.name}
            {point.isKeyTrap && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
                <AlertTriangle className="w-3 h-3 text-rose-500" />
                易错雷区
              </span>
            )}
          </h3>

          {/* Badges */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <span
              className={`px-2 py-0.5 rounded-md font-medium ${
                point.blankType === 'with_prompt'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
              }`}
            >
              {point.macroCategory.split('（')[0]}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {point.subCategory}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-medium">
              收录 {point.examples.length} 道真题
            </span>
          </div>
        </div>

        {/* Right Info: Frequency & Controls */}
        <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-indigo-600 dark:text-indigo-400 text-sm">
              {point.frequency} 次考查
            </span>
            <span className="hidden sm:inline">占比 {point.ratioInTotal}</span>
            <span className="text-amber-500 text-xs hidden sm:inline" title="考查难度">
              {point.difficulty}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Mastered toggle */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleMastered(point.id);
              }}
              title={isMastered ? '标记为未掌握' : '标记为已掌握'}
              className={`p-1.5 rounded-lg border transition-colors ${
                isMastered
                  ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              {isMastered ? (
                <BookmarkCheck className="w-4 h-4" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>

            {/* Chevron */}
            <div
              className={`p-1 text-slate-400 transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-indigo-600 dark:text-indigo-400' : ''
              }`}
            >
              <ChevronDown className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Details Panel */}
      {isOpen && (
        <div className="px-4 pb-5 pt-1 border-t border-slate-100 dark:border-slate-800 space-y-4 text-sm animate-fadeIn">
          {/* Key Rule & Formula Box */}
          <div className="bg-indigo-50/70 dark:bg-indigo-950/30 rounded-xl p-3.5 border border-indigo-100 dark:border-indigo-900/50">
            <div className="flex items-center gap-1.5 font-bold text-indigo-900 dark:text-indigo-200 mb-1.5">
              <Lightbulb className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>核心解题规律与考法解析</span>
            </div>
            <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
              {point.ruleSummary}
            </p>
          </div>

          {/* Signals & Indicators */}
          {point.signalWords && point.signalWords.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" /> 常见信号标志：
              </span>
              {point.signalWords.map((word, idx) => (
                <span
                  key={idx}
                  className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 font-mono"
                >
                  {word}
                </span>
              ))}
            </div>
          )}

          {/* Trap warning */}
          {point.trapWarning && (
            <div className="bg-amber-50/80 dark:bg-amber-950/20 rounded-xl p-3 border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm leading-relaxed">
                {point.trapWarning}
              </div>
            </div>
          )}

          {/* Real Exam Question Bank Section */}
          <div className="pt-2 space-y-3">
            {/* Question Bank Header & Sub-toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-100/70 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 text-sm sm:text-base">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  2025 浙江一模 & 二模真题全收录（共 {point.examples.length} 题）
                </h4>
                <span className="text-xs bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-medium px-2 py-0.5 rounded-full">
                  当前展示 {displayedExamples.length} 题
                </span>
              </div>

              {/* Sub-actions in Quiz Mode */}
              {isQuizMode && (
                <div className="flex items-center gap-2 text-xs flex-wrap">
                  <button
                    onClick={handleRevealAll}
                    className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> 核对本考点全部答案
                  </button>
                  <button
                    onClick={handleHideAll}
                    className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 flex items-center gap-1"
                  >
                    <EyeOff className="w-3.5 h-3.5" /> 遮罩答案
                  </button>
                </div>
              )}
            </div>

            {/* In-point filters: Region filter & Toggle all questions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-slate-600 dark:text-slate-400">
              {/* Region filter chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-slate-400 font-medium flex items-center gap-1">
                  <ListFilter className="w-3.5 h-3.5" /> 地区筛选:
                </span>
                <button
                  onClick={() => setRegionFilter('all')}
                  className={`px-2 py-0.5 rounded-md transition-colors ${
                    regionFilter === 'all'
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200'
                  }`}
                >
                  全部 ({point.examples.length})
                </button>
                {availableRegions.map((region) => {
                  const count = point.examples.filter((e) => e.source.includes(region)).length;
                  return (
                    <button
                      key={region}
                      onClick={() => setRegionFilter(region)}
                      className={`px-2 py-0.5 rounded-md transition-colors ${
                        regionFilter === region
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200'
                      }`}
                    >
                      {region} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Toggle view all vs show top 6 if many */}
              {point.examples.length > 6 && (
                <div className="shrink-0">
                  <button
                    onClick={() => setShowAllQuestions(!showAllQuestions)}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1"
                  >
                    {showAllQuestions
                      ? `折叠为精选前 6 题`
                      : `展开查看全部 ${point.examples.length} 道真题`}
                  </button>
                </div>
              )}
            </div>

            {/* List of Examples */}
            <div className="space-y-3">
              {displayedExamples.length === 0 ? (
                <div className="text-center py-6 text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                  没有找到符合该地区筛选条件的试题
                </div>
              ) : (
                displayedExamples.map((ex, index) => {
                  const isRevealed = !isQuizMode || revealedExamples[ex.id];
                  const userAns = userAnswers[ex.id]?.trim() || '';
                  const isCorrect = isAnswerMatching(userAns, ex.answer);
                  const isInWrongList = wrongQuestionIds.has(ex.id);

                  return (
                    <div
                      key={ex.id}
                      className={`p-3.5 rounded-xl border transition-colors space-y-2.5 ${
                        isInWrongList
                          ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20'
                          : 'border-slate-200/90 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40'
                      }`}
                    >
                      {/* Example Header */}
                      <div className="flex items-center justify-between text-xs gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-semibold px-2 py-0.5 rounded">
                            题 #{index + 1}
                          </span>
                          <span className="text-slate-600 dark:text-slate-300 font-medium">
                            {ex.source}
                          </span>
                          {isInWrongList && (
                            <span className="bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300 px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1">
                              <BookOpen className="w-3 h-3" /> 已在错题本
                            </span>
                          )}
                        </div>

                        {/* Top-right Tag: In quiz mode, DO NOT show ex.tag until answer is revealed! */}
                        {ex.tag && (!isQuizMode || isRevealed) && (
                          <span className="bg-slate-200/70 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded text-[11px]">
                            {ex.tag}
                          </span>
                        )}
                      </div>

                      {/* Sentence */}
                      <div className="text-slate-800 dark:text-slate-200 font-serif leading-relaxed text-sm sm:text-base">
                        {ex.sentence}
                      </div>

                      {/* Interactive quiz input when in quiz mode */}
                      {isQuizMode && (
                        <div className="flex items-center gap-2 pt-1 flex-wrap">
                          <input
                            type="text"
                            placeholder={
                              ex.prompt ? `输入单词变形 (原词: ${ex.prompt})` : '输入虚词答案'
                            }
                            value={userAnswers[ex.id] || ''}
                            onChange={(e) => handleInputChange(ex.id, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleCheckAnswer(ex.id);
                              }
                            }}
                            className="px-3 py-1.5 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-xs"
                          />
                          <button
                            type="button"
                            onClick={() => toggleReveal(ex.id)}
                            className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1"
                          >
                            {isRevealed ? (
                              <>
                                <EyeOff className="w-3.5 h-3.5" /> 隐藏答案
                              </>
                            ) : (
                              <>
                                <Eye className="w-3.5 h-3.5" /> 核对答案
                              </>
                            )}
                          </button>

                          {/* Quick Add/Remove from Mistakes button */}
                          <button
                            type="button"
                            onClick={() => {
                              if (isInWrongList) {
                                onRemoveWrongQuestion(ex.id);
                              } else {
                                onAddWrongQuestion({
                                  id: ex.id,
                                  pointId: point.id,
                                  pointName: point.name,
                                  subCategory: point.subCategory,
                                  source: ex.source,
                                  sentence: ex.sentence,
                                  prompt: ex.prompt,
                                  answer: ex.answer,
                                  analysis: ex.analysis,
                                  tag: ex.tag,
                                  userAnswer: userAns,
                                  addedAt: Date.now(),
                                });
                              }
                            }}
                            className={`px-2 py-1.5 text-xs rounded-lg border transition-colors flex items-center gap-1 ${
                              isInWrongList
                                ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-300'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 hover:bg-slate-200'
                            }`}
                            title={isInWrongList ? '从错题本移出' : '加入错题本'}
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            {isInWrongList ? '移出错题本' : '加到错题本'}
                          </button>

                          {userAns && isRevealed && (
                            <span
                              className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                isCorrect
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              }`}
                            >
                              {isCorrect
                                ? '✅ 回答正确！'
                                : '❌ 答错了，已自动收入错题本！'}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Answer and explanation */}
                      {isRevealed && (
                        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1.5 text-xs sm:text-sm">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" /> 参考答案：
                            </span>
                            <span className="font-mono font-bold text-slate-900 dark:text-slate-100 bg-emerald-100/70 dark:bg-emerald-950 px-2 py-0.5 rounded text-sm">
                              {ex.answer}
                            </span>
                            {ex.prompt && (
                              <span className="text-slate-500 text-xs">
                                （原提示词：<code className="font-mono font-bold">{ex.prompt}</code>）
                              </span>
                            )}
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                            <strong className="text-slate-700 dark:text-slate-200">
                              解析：
                            </strong>
                            {ex.analysis}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom toggle button if truncated */}
            {point.examples.length > 6 && !showAllQuestions && (
              <div className="text-center pt-2">
                <button
                  onClick={() => setShowAllQuestions(true)}
                  className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  展开本考点全部 {point.examples.length} 道真题实战例题
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
