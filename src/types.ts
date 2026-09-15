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
