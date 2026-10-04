import React from 'react';
import { PITFALLS_GUIDE } from '../data/grammarData';
import { X, AlertTriangle, ShieldCheck, BookmarkCheck } from 'lucide-react';

interface PitfallsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PitfallsModal: React.FC<PitfallsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full max-h-[88vh] overflow-y-auto shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                浙江中考语法填空高频易错避坑指南
              </h3>
              <p className="text-xs text-slate-500">
                基于 43 篇中考一模二模真题丢分重灾区总结的 6 大黄金定律
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 6 Rules Cards */}
        <div className="space-y-3.5">
          {PITFALLS_GUIDE.map((item) => (
            <div
              key={item.num}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  定律 {item.num}：{item.title}
                </span>
                <span className="text-[11px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded-full font-medium">
                  {item.tag}
                </span>
              </div>
              <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
                {item.rule}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80">
                {item.detail}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-medium rounded-xl shadow-xs"
          >
            我已掌握，返回复习
          </button>
        </div>
      </div>
    </div>
  );
};
