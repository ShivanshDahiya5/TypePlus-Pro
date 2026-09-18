import { ThemeConfig, ThemeId } from '../types';

export const THEMES: Record<ThemeId, ThemeConfig> = {
  midnight: {
    id: 'midnight',
    name: 'Midnight Pro',
    bg: '#090d16',
    cardBg: '#0f172a',
    primary: '#6366f1',
    primaryLight: 'rgba(99, 102, 241, 0.15)',
    accent: '#38bdf8',
    border: '#1e293b',
    text: '#f8fafc',
    textMuted: '#64748b',
    charUntyped: '#475569',
    charCorrect: '#e2e8f0',
    charIncorrect: '#f43f5e',
    charExtra: '#be123c',
    caret: '#6366f1',
  },
