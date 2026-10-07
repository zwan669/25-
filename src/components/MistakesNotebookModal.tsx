import React, { useState, useMemo } from 'react';
import { WrongQuestionRecord } from '../types/grammar';
import { soundManager } from '../utils/soundEffects';
import {
  X,
  BookOpen,
  Trash2,
  CheckCircle,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  Search,
  Tag,
  ArrowRight,
  HelpCircle,
  Filter,
} from 'lucide-react';

interface MistakesNotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  wrongQuestions: WrongQuestionRecord[];
  onRemoveWrongQuestion: (id: string) => void;
  onClearAll: () => void;
  onUpdateAnswer: (id: string, newAnswer: string) => void;
}

export const MistakesNotebookModal: React.FC<MistakesNotebookModalProps> = ({
  isOpen,
  onClose,
  wrongQuestions,
  onRemoveWrongQuestion,
  onClearAll,
  onUpdateAnswer,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [redoInputs, setRedoInputs] = useState<Record<string, string>>({});
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});

  // Filter categories available in the wrong questions (Hooks MUST run unconditionally)
  const categories = useMemo(() => {
    const set = new Set<string>();
    wrongQuestions.forEach((q) => {
      if (q.subCategory) set.add(q.subCategory);
    });
    return Array.from(set);
  }, [wrongQuestions]);

  // Filtered list
  const filteredQuestions = useMemo(() => {
    return wrongQuestions.filter((item) => {
      if (selectedCategory !== 'all' && item.subCategory !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inSentence = item.sentence.toLowerCase().includes(q);
        const inSource = item.source.toLowerCase().includes(q);
        const inPoint = item.pointName.toLowerCase().includes(q);
        const inAnswer = item.answer.toLowerCase().includes(q);
        if (!inSentence && !inSource && !inPoint && !inAnswer) return false;
      }
      return true;
    });
  }, [wrongQuestions, selectedCategory, searchQuery]);

  if (!isOpen) return null;

  const checkAnswerCorrect = (userAns: string, actualAns: string) => {
    const cleanUser = userAns.trim().toLowerCase();
    if (!cleanUser) return false;
    const parts = actualAns.split('/').map((s) => s.trim().toLowerCase());
    return parts.includes(cleanUser);
  };

  const handleRedoChange = (id: string, val: string) => {
    setRedoInputs((prev) => ({
      ...prev,
      [id]: val,
    }));
  };

  const handleCheckRedo = (id: string, actualAns: string) => {
    const val = redoInputs[id]?.trim() || '';
    if (!val) return;
    const isCorrect = checkAnswerCorrect(val, actualAns);
    if (isCorrect) {
      soundManager.playCorrect();
    } else {
      soundManager.playIncorrect();
    }
  };

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  错题本 · 专项攻坚区
                </h3>
                <span className="text-xs bg-rose-500 text-white font-bold px-2 py-0.5 rounded-full">
                  {wrongQuestions.length} 道错题
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                自测模式下回答错误的题目已自动本地备份保存，刷新或断开重启不丢失
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {wrongQuestions.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('确定要清空全部错题记录吗？')) {
                    onClearAll();
                  }
                }}
                className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 px-2.5 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> 清空错题
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar: Search & Category Chips */}
        <div className="p-3 sm:p-4 border-b border-slate-100 dark:border-slate-800 space-y-2.5 bg-white dark:bg-slate-900">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索错题题干、考点、真题来源、答案..."
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 placeholder-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar pb-0.5">
              <span className="text-slate-400 flex items-center gap-1 shrink-0">
                <Filter className="w-3 h-3" /> 分类:
              </span>
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-2.5 py-0.5 rounded-full transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-rose-600 text-white font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                全部 ({wrongQuestions.length})
              </button>
              {categories.map((cat) => {
                const count = wrongQuestions.filter((q) => q.subCategory === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-0.5 rounded-full transition-colors ${
                      selectedCategory === cat
                        ? 'bg-rose-600 text-white font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Question Cards List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-base">
                {wrongQuestions.length === 0
                  ? '太棒了！错题本为空'
                  : '未找到符合条件的错题'}
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {wrongQuestions.length === 0
                  ? '在自测模式下练习时，回答错误的题目会自动记录到这里，随时重练巩固。'
                  : '请尝试切换分类或清空搜索关键词。'}
              </p>
            </div>
          ) : (
            filteredQuestions.map((item, index) => {
              const currentRedo = redoInputs[item.id] || '';
              const isRedoCorrect = checkAnswerCorrect(currentRedo, item.answer);
              const isRevealed = revealedIds[item.id];

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-rose-200/80 dark:border-rose-900/40 bg-white dark:bg-slate-850 shadow-xs space-y-3"
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between text-xs gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded">
                        错题 #{index + 1}
                      </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {item.pointName}
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-500">{item.source}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onRemoveWrongQuestion(item.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="移出错题本"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Sentence */}
                  <div className="text-slate-800 dark:text-slate-200 font-serif leading-relaxed text-sm sm:text-base bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                    {item.sentence}
                  </div>

                  {/* Previous wrong record */}
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>上次错误回答：</span>
                    <span className="font-mono line-through text-rose-500 font-bold bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded">
                      {item.userAnswer || '未填写'}
                    </span>
                  </div>

                  {/* Interactive Redo Bar */}
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    <input
                      type="text"
                      placeholder={
                        item.prompt
                          ? `输入正确变形 (原词: ${item.prompt})`
                          : '输入虚词答案'
                      }
                      value={currentRedo}
                      onChange={(e) => handleRedoChange(item.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleCheckRedo(item.id, item.answer);
                        }
                      }}
                      className="px-3 py-1.5 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 max-w-xs"
                    />

                    <button
                      type="button"
                      onClick={() => handleCheckRedo(item.id, item.answer)}
                      className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-rose-500 text-white hover:bg-rose-600 shadow-xs"
                    >
                      核对
                    </button>

                    <button
                      onClick={() => toggleReveal(item.id)}
                      className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 border border-slate-200 dark:border-slate-700"
                    >
                      {isRevealed ? '隐藏解析' : '查看答案与解析'}
                    </button>

                    {currentRedo && (
                      <div className="flex items-center gap-1.5 text-xs">
                        {isRedoCorrect ? (
                          <>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" /> 攻克成功！
                            </span>
                            <button
                              onClick={() => onRemoveWrongQuestion(item.id)}
                              className="text-xs text-emerald-700 dark:text-emerald-300 hover:underline font-semibold"
                            >
                              移出错题本
                            </button>
                          </>
                        ) : (
                          <span className="text-rose-600 font-semibold bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded-full">
                            仍未答对，请继续尝试或查看解析
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Revealed Answer & Analysis */}
                  {isRevealed && (
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-2 text-xs sm:text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" /> 标准答案：
                        </span>
                        <span className="font-mono font-bold text-slate-900 dark:text-slate-100 bg-emerald-100/70 dark:bg-emerald-950 px-2.5 py-0.5 rounded text-sm">
                          {item.answer}
                        </span>
                        {item.tag && (
                          <span className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                            考点：{item.tag}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                        <strong className="text-slate-800 dark:text-slate-200">
                          解题解析：
                        </strong>
                        {item.analysis}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-xs text-slate-500">
          <span>
            共 {wrongQuestions.length} 道错题已保存至浏览器本地缓存
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-700 font-medium transition-colors"
          >
            完成复习
          </button>
        </div>
      </div>
    </div>
  );
};
