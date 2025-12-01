
export interface Chapter {
  id: string;
  title: string;
  description: string;
  duration: string;
  isLocked: boolean;
  prerequisiteIds?: string[];
  videoUrl?: string;  // URL for iframe embed (YouTube/Vimeo)
  slidesUrl?: string; // URL for PDF/Slides download
}

export enum TradeResult {
  WIN = 'WIN',
  LOSS = 'LOSS',
  BE = 'BE' // Break Even
}

export enum TradeType {
  LONG = 'LONG',
  SHORT = 'SHORT'
}

export interface TradeEntry {
  id: string;
  pair: string;
  type: TradeType;
  entryDate: number;
  result: TradeResult;
  pnl: number; // Profit and Loss in currency or %
  notes: string;
  screenshotUrl?: string;
  user_id?: string; // Added for database linkage
}

export enum AppTab {
  LEARN = 'LEARN',
  JOURNAL = 'JOURNAL',
  MENTOR = 'MENTOR'
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export type UserRole = 'student' | 'teacher';
