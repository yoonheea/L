export type AppStep = 'S_INTRO' | 'S0' | 'S1' | 'S2' | 'S3' | 'S4';

export interface TraitItem {
  id: string; // e.g. 'strength_1', 'weakness_1'
  type: 'strength' | 'weakness';
  title: string;
  description: string;
  questionText: string; // The specific custom-generated question to gather real-life experiences
}

export interface StateData {
  apiKey: string;
  isCustomKeyUsed: boolean;
  uploadedFile: {
    name: string;
    size: number;
    fileBase64?: string;
    mimeType?: string;
    isSample?: boolean;
  } | null;
  // Deduced in S2
  riasecScores: { type: string; score: number; color: string; desc: string }[];
  detectedTraits: TraitItem[];
  
  // Dynamic fields parsed from Gemini
  personalityAnalysis?: string;
  personalityDesc?: string;
  historyAnalysis?: string;
  historyDesc?: string;
  suggestedJobs?: { title: string; desc: string }[];

  // S3 answers: maps TraitItem.id to answer string
  answers: Record<string, string>;
  // S4 State
  storyBank: {
    id: string;
    title: string;
    content: string;
    createdAt: string;
  }[];
}
