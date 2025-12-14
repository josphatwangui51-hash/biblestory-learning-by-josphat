export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface ScriptureSection {
  book: string;
  chapter: number;
  verses: string;
  text: string;
}

export enum InsightType {
  EXPLAIN = 'EXPLAIN',
  DEVOTIONAL = 'DEVOTIONAL',
  CONTEXT = 'CONTEXT',
  APPLICATION = 'APPLICATION'
}

export interface Note {
  id: string;
  content: string;
  source?: string;
  createdAt: string;
}

export interface StoryData {
  id: string;
  chapterRef: string;       // e.g. "Exodus 3"
  titlePrefix: string;      // e.g. "The Burning"
  titleHighlight: string;   // e.g. "Bush"
  theme: string;
  reference: string;        // e.g. "Exodus 3:4-6"
  text: string;
  backgroundImage: string;
  aiContext: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number; // 0-3
  explanation: string;
}