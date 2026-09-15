export type TestMode = 'time' | 'words' | 'quote' | 'custom';
export type TimeOption = 15 | 30 | 60 | 120;
export type WordOption = 10 | 25 | 50 | 100;
export type QuoteLength = 'short' | 'medium' | 'long';
export type SoundType = 'off' | 'mechanical' | 'click' | 'beep' | 'typewriter';
export type CaretStyle = 'line' | 'block' | 'underline' | 'off';
export type FontSize = 'small' | 'medium' | 'large';

export type ThemeId =
  | 'midnight'
  | 'cyberpunk'
  | 'nord'
  | 'sunset'
  | 'forest'
  | 'coffee'
  | 'sakura'
  | 'dracula'
  | 'paper';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  bg: string;
  cardBg: string;
  primary: string;
  primaryLight: string;
  accent: string;
  border: string;
  text: string;
  textMuted: string;
  charUntyped: string;
  charCorrect: string;
  charIncorrect: string;
  charExtra: string;
  caret: string;
}

export interface TestSettings {
  mode: TestMode;
  timeOption: TimeOption;
  wordOption: WordOption;
  quoteLength: QuoteLength;
  punctuation: boolean;
  numbers: boolean;
  customText: string;
  customTitle: string;
}

export interface UserPreferences {
  theme: ThemeId;
  sound: SoundType;
  soundVolume: number;
  caretStyle: CaretStyle;
  fontSize: FontSize;
  showLiveStats: boolean;
  showKeyboard: boolean;
  blindMode: boolean;
  smoothCaret: boolean;
}

export type CharacterStatus = 'untyped' | 'correct' | 'incorrect' | 'extra';

export interface CharacterState {
  char: string;
  status: CharacterStatus;
}

export interface WordState {
  original: string;
  characters: CharacterState[];
  isCurrent: boolean;
  isComplete: boolean;
}

export interface SecondSnapshot {
  second: number;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  errors: number;
  keystrokes: number;
}

export interface KeyStat {
  key: string;
  errorRate: number;
  count: number;
}

export interface TestResult {
  id: string;
  timestamp: number;
  mode: TestMode;
  modeDescription: string;
  wpm: number;
  rawWpm: number;
  cpm: number;
  accuracy: number;
  consistency: number;
  durationSeconds: number;
  correctChars: number;
  incorrectChars: number;
  extraChars: number;
  missedChars: number;
  totalKeystrokes: number;
  timeline: SecondSnapshot[];
  problemKeys: KeyStat[];
  quoteAuthor?: string;
  isPersonalBest?: boolean;
}