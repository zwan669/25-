export type BlankType = 'with_prompt' | 'without_prompt';

export interface ExamExample {
  id: string;
  source: string; // e.g. "2025·杭州拱墅区二模第1空"
  sentence: string; // e.g. "different _______ (place) start the new year at different time."
  prompt?: string; // e.g. "place"
  answer: string; // e.g. "places"
  analysis: string; // Detailed reason
  tag?: string; // e.g. "可数名词复数", "目的状语"
}

export interface MicroPoint {
  id: string;
  rank: number; // 1 to 19
  name: string; // e.g. "动词非谓语 (to do / doing / done)"
  macroCategory: '有提示词（实词变形）' | '无提示词（虚词填空）';
  subCategory: string; // "动词", "名词", "形容词 & 副词", "代词", "数词", "介词", "连词", "冠词", "从句引导词", "句型代词"
  blankType: BlankType;
  frequency: number; // e.g. 44
  ratioInType: string; // e.g. "39.4%" (for verb in with_prompt) or "31.5%" (for prep in without_prompt)
  ratioInTotal: string; // e.g. "10.2%"
  difficulty: '⭐' | '⭐⭐' | '⭐⭐⭐' | '⭐⭐⭐⭐' | '⭐⭐⭐⭐⭐';
  isKeyTrap: boolean; // 是否易错丢分重灾区
  ruleSummary: string; // 核心解题规律与公式
  signalWords: string[]; // 常见标志词/提示词
  trapWarning?: string; // 常见失分坑点
  examples: ExamExample[];
}

export interface MacroCategoryGroup {
  id: string;
  title: string;
  count: number;
  percentage: string;
  description: string;
  badgeColor: string;
  subGroups: {
    name: string;
    count: number;
    ratio: string;
    points: MicroPoint[];
  }[];
}

export interface WrongQuestionRecord {
  id: string; // example id
  pointId: string;
  pointName: string;
  subCategory: string;
  source: string;
  sentence: string;
  prompt?: string;
  answer: string;
  analysis: string;
  tag?: string;
  userAnswer: string;
  addedAt: number;
}
