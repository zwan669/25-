import React from 'react';
import { X, Clock, HelpCircle, CheckCheck, Target, Award } from 'lucide-react';
import { EXAM_STATISTICS } from '../data/grammarData';

interface ExamStrategyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExamStrategyModal: React.FC<ExamStrategyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full max-h-[88vh] overflow-y-auto shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Target className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                浙江中考语法填空考情导向与解题三步法
              </h3>
              <p className="text-xs text-slate-500">
                试题命题规则 · 标准解题流程 · 高效提分秘诀
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

        {/* 1. Exam Rules Card */}
        <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/40 bg-indigo-50/50 dark:bg-indigo-950/20 space-y-2">
          <h4 className="font-bold text-sm text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            浙江中考语法填空官方命题规则
          </h4>
          <ul className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-1.5 list-disc list-inside">
            <li>
              <strong>题量与配比：</strong>整篇共 10 空；通常 6-7 个<strong>有提示词（实词变形）</strong>，3-4 个<strong>无提示词（纯虚词填空）</strong>。
            </li>
            <li>
              <strong>词数严格限制：</strong>有提示词空格最多填 3 个单词（如 is grown, has become）；无提示词空格<strong>严格限制仅填 1 个词</strong>！
            </li>
            <li>
              <strong>样本大数据：</strong>一模 21 篇 + 二模 22 篇 = 43 篇（共 430 空）；实词占 66.0%，虚词占 34.0%。
            </li>
          </ul>
        </div>

        {/* 2. Three-Step Strategy */}
        <div className="space-y-3">
          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <CheckCheck className="w-4 h-4 text-emerald-500" />
            考场标准解题三步法（建议 8 分钟内完成）
          </h4>

          {/* Step 1 */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                1
              </span>
              <strong className="text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                第一步：通读全文抓大意（用时 1 分钟）
              </strong>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 pl-7 leading-relaxed">
              跳过空格快速略读，弄清文体（记叙文故事 / 说明文科普）、主线人物与故事基调，特别圈注<strong>时间状语</strong>（判定全文基准时态）与<strong>逻辑衔接词</strong>。
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                2
              </span>
              <strong className="text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                第二步：分块突破，精准定型（用时 5 分钟）
              </strong>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 pl-7 space-y-1 leading-relaxed">
              <p>
                • <strong>有提示词（看词性）：</strong>动词（查是否缺谓语 → 缺则时态被动，不缺则非谓语）；名词（查修饰词定复数/所有格/派生）；形容词（修饰动词变副词，遇 than 变比较级）；代词（名后用形代，名无用名代/反身）；数词（必变序数词）。
              </p>
              <p>
                • <strong>无提示词（看结构）：</strong>介词（固定动宾/介词短语）；连词（前后两整句用转折but/顺承and/因果because）；冠词（泛指 a/an 或特指 the）；从句引导词（缺主宾填 what，指人填 who）；句型代词（it 形式主语）。
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                3
              </span>
              <strong className="text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                第三步：代入复查，消除粗心（用时 1.5-2 分钟）
              </strong>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 pl-7 leading-relaxed">
              代入答案通读句子，检查：① 主谓单复数一致；② 时态前后连贯；③ 被动语态是否漏掉 be 动词；④ 名词变复数拼写；⑤ 句首字母必须大写；⑥ 虚词是否多填了单词。
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-medium rounded-xl shadow-xs"
          >
            明白，继续刷题复习
          </button>
        </div>
      </div>
    </div>
  );
};
