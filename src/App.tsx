/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { MICRO_POINTS } from './data/grammarData';
import { WrongQuestionRecord, PracticeRecord, LastActiveLocation } from './types/grammar';
import { Header } from './components/Header';
import { MacroView } from './components/MacroView';
import { MicroRankingView } from './components/MicroRankingView';
import { PitfallsModal } from './components/PitfallsModal';
import { ExamStrategyModal } from './components/ExamStrategyModal';
import { MistakesNotebookModal } from './components/MistakesNotebookModal';
import { StreakToast } from './components/StreakToast';
import { FloatingStatsHud } from './components/FloatingStatsHud';
import { BookOpen, GraduationCap, Sparkles } from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState<'macro' | 'micro'>('macro');
  const [searchQuery, setSearchQuery] = useState('');
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Set of opened point IDs
  // By default, open the top 3 highest-frequency points so students see rich content right away
  const [openPointIds, setOpenPointIds] = useState<Set<string>>(() => {
    return new Set(['non-finite-verbs', 'noun-plural', 'prepositions']);
  });

  // Track mastered points in localStorage
  const [masteredIds, setMasteredIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('zj_mastered_points');
      if (saved) {
        return new Set(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
    return new Set<string>();
  });

  // Track wrong questions in localStorage
  const [wrongQuestions, setWrongQuestions] = useState<WrongQuestionRecord[]>(() => {
    try {
      const saved = localStorage.getItem('zj_wrong_questions');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Track user answered practice questions in localStorage
  const [practiceRecords, setPracticeRecords] = useState<Record<string, PracticeRecord>>(() => {
    try {
      const saved = localStorage.getItem('zj_practice_records');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return {};
  });

  // Track last active location in localStorage
  const [lastActiveLocation, setLastActiveLocation] = useState<LastActiveLocation | null>(() => {
    try {
      const saved = localStorage.getItem('zj_last_active');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  // Highlight question ID for jump / locating
  const [highlightedQuestionId, setHighlightedQuestionId] = useState<string | null>(null);

  // Modals
  const [isPitfallsOpen, setIsPitfallsOpen] = useState(false);
  const [isStrategyOpen, setIsStrategyOpen] = useState(false);
  const [isMistakesOpen, setIsMistakesOpen] = useState(false);

  // Sync masteredIds to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('zj_mastered_points', JSON.stringify(Array.from(masteredIds)));
    } catch (e) {
      console.error(e);
    }
  }, [masteredIds]);

  // Sync wrongQuestions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('zj_wrong_questions', JSON.stringify(wrongQuestions));
    } catch (e) {
      console.error(e);
    }
  }, [wrongQuestions]);

  // Sync practiceRecords to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('zj_practice_records', JSON.stringify(practiceRecords));
    } catch (e) {
      console.error(e);
    }
  }, [practiceRecords]);

  // Sync lastActiveLocation to localStorage
  useEffect(() => {
    if (lastActiveLocation) {
      try {
        localStorage.setItem('zj_last_active', JSON.stringify(lastActiveLocation));
      } catch (e) {
        console.error(e);
      }
    }
  }, [lastActiveLocation]);

  // Set of wrong question IDs for fast lookup
  const wrongQuestionIds = useMemo(() => {
    return new Set(wrongQuestions.map((q) => q.id));
  }, [wrongQuestions]);

  // Practice statistics
  const practicedCount = useMemo(() => {
    return Object.keys(practiceRecords).length;
  }, [practiceRecords]);

  const correctCount = useMemo(() => {
    return Object.values(practiceRecords).filter((r) => r.isCorrect).length;
  }, [practiceRecords]);

  // Handle adding a wrong question
  const handleAddWrongQuestion = (record: WrongQuestionRecord) => {
    setWrongQuestions((prev) => {
      const existsIndex = prev.findIndex((q) => q.id === record.id);
      if (existsIndex >= 0) {
        const updated = [...prev];
        updated[existsIndex] = {
          ...updated[existsIndex],
          userAnswer: record.userAnswer,
          addedAt: Date.now(),
        };
        return updated;
      }
      return [record, ...prev];
    });
  };

  // Handle recording a practice submission
  const handleRecordPractice = (
    record: PracticeRecord,
    source: string,
    pointName: string
  ) => {
    setPracticeRecords((prev) => ({
      ...prev,
      [record.questionId]: record,
    }));
    setLastActiveLocation({
      questionId: record.questionId,
      pointId: record.pointId,
      pointName,
      source,
      timestamp: Date.now(),
    });
  };

  // Handle resetting practice of a single question
  const handleResetPractice = (questionId: string) => {
    setPracticeRecords((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  };

  // Handle resume last active location
  const handleResumeLastActive = () => {
    if (!lastActiveLocation) return;
    setOpenPointIds((prev) => {
      const next = new Set(prev);
      next.add(lastActiveLocation.pointId);
      return next;
    });
    setHighlightedQuestionId(lastActiveLocation.questionId);

    setTimeout(() => {
      const el = document.getElementById(`q-${lastActiveLocation.questionId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 120);

    setTimeout(() => {
      setHighlightedQuestionId(null);
    }, 3500);
  };

  // Handle removing a wrong question
  const handleRemoveWrongQuestion = (id: string) => {
    setWrongQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  // Handle clearing all wrong questions
  const handleClearAllWrong = () => {
    setWrongQuestions([]);
  };

  // Handle updating an answer in mistakes notebook
  const handleUpdateAnswer = (id: string, newAnswer: string) => {
    setWrongQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, userAnswer: newAnswer } : q))
    );
  };

  // When search query is entered, auto-expand matching points
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const q = searchQuery.toLowerCase();
      const matchingIds = new Set<string>();
      MICRO_POINTS.forEach((p) => {
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
        if (matchName || matchSub || matchRule || matchSignals || matchExamples) {
          matchingIds.add(p.id);
        }
      });
      setOpenPointIds(matchingIds);
    }
  }, [searchQuery]);

  // Toggle single point
  const handleTogglePoint = (id: string) => {
    setOpenPointIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Expand all
  const handleExpandAll = () => {
    setOpenPointIds(new Set(MICRO_POINTS.map((p) => p.id)));
  };

  // Collapse all
  const handleCollapseAll = () => {
    setOpenPointIds(new Set());
  };

  // Toggle mastered status
  const handleToggleMastered = (id: string) => {
    setMasteredIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
        {/* Top Header & Search & Controls */}
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeView={activeView}
          onViewChange={setActiveView}
          isQuizMode={isQuizMode}
          onToggleQuizMode={() => setIsQuizMode(!isQuizMode)}
          onExpandAll={handleExpandAll}
          onCollapseAll={handleCollapseAll}
          onOpenPitfalls={() => setIsPitfallsOpen(true)}
          onOpenStrategy={() => setIsStrategyOpen(true)}
          onOpenMistakes={() => setIsMistakesOpen(true)}
          selectedFilter={selectedFilter}
          onSelectFilter={setSelectedFilter}
          masteredCount={masteredIds.size}
          wrongCount={wrongQuestions.length}
          practicedCount={practicedCount}
          correctCount={correctCount}
          lastActive={lastActiveLocation}
          onResumeLast={handleResumeLastActive}
        />

        {/* Main Content Area: Macro View vs Micro View */}
        <main>
          {activeView === 'macro' ? (
            <MacroView
              searchQuery={searchQuery}
              isQuizMode={isQuizMode}
              openPointIds={openPointIds}
              onTogglePoint={handleTogglePoint}
              masteredIds={masteredIds}
              onToggleMastered={handleToggleMastered}
              selectedFilter={selectedFilter}
              onAddWrongQuestion={handleAddWrongQuestion}
              wrongQuestionIds={wrongQuestionIds}
              onRemoveWrongQuestion={handleRemoveWrongQuestion}
              practiceRecords={practiceRecords}
              onRecordPractice={handleRecordPractice}
              onResetPractice={handleResetPractice}
              highlightedQuestionId={highlightedQuestionId}
            />
          ) : (
            <MicroRankingView
              searchQuery={searchQuery}
              isQuizMode={isQuizMode}
              openPointIds={openPointIds}
              onTogglePoint={handleTogglePoint}
              masteredIds={masteredIds}
              onToggleMastered={handleToggleMastered}
              selectedFilter={selectedFilter}
              onAddWrongQuestion={handleAddWrongQuestion}
              wrongQuestionIds={wrongQuestionIds}
              onRemoveWrongQuestion={handleRemoveWrongQuestion}
              practiceRecords={practiceRecords}
              onRecordPractice={handleRecordPractice}
              onResetPractice={handleResetPractice}
              highlightedQuestionId={highlightedQuestionId}
            />
          )}
        </main>

        {/* Quick Review Summary Card at the bottom */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              备考核心要点总结（浙江中考考官命题共识）
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-1">
              <strong className="text-indigo-600 dark:text-indigo-400 block font-bold">
                1. 实词备考重中之重（占 2/3）
              </strong>
              <p className="leading-relaxed">
                动词是全卷第一大考点（占 26%），牢记<strong>“先断谓语，再判非谓”</strong>。记叙文绝大多数动词考一般过去时，被动语态务必别漏掉 be 动词。
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-1">
              <strong className="text-indigo-600 dark:text-indigo-400 block font-bold">
                2. 虚词注重固定句型与语义逻辑（占 1/3）
              </strong>
              <p className="leading-relaxed">
                介词关注固定搭配（with, for, in, of），连词以转折 but 最多、并列句式 not only...but also 反复考查，句首形式主语 It is adj to do 属于送分题。
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-4 pb-8 text-center text-xs text-slate-400 space-y-1">
          <p>
            浙江 2025 年中考英语一模与二模语法填空考情大数据分析 · 43篇 / 430空
          </p>
          <p>涵盖杭州、宁波、温州、金华、台州、湖州、绍兴、嘉兴、衢州、舟山、丽水等全省最新模考真题</p>
        </footer>
      </div>

      {/* Guidance & Mistakes Modals & Streak Toast */}
      <PitfallsModal isOpen={isPitfallsOpen} onClose={() => setIsPitfallsOpen(false)} />
      <ExamStrategyModal isOpen={isStrategyOpen} onClose={() => setIsStrategyOpen(false)} />
      {isMistakesOpen && (
        <MistakesNotebookModal
          isOpen={isMistakesOpen}
          onClose={() => setIsMistakesOpen(false)}
          wrongQuestions={wrongQuestions}
          onRemoveWrongQuestion={handleRemoveWrongQuestion}
          onClearAll={handleClearAllWrong}
          onUpdateAnswer={handleUpdateAnswer}
        />
      )}
      <StreakToast />
      <FloatingStatsHud
        correctCount={correctCount}
        practicedCount={practicedCount}
        totalQuestions={430}
      />
    </div>
  );
}
