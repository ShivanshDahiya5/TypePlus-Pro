import React from 'react';
import {
  Clock,
  Type,
  Quote as QuoteIcon,
  Sliders,
  AtSign,
  Hash,
  RotateCcw,
} from 'lucide-react';
import {
  QuoteLength,
  TestSettings,
  ThemeConfig,
  TimeOption,
  WordOption,
} from '../types';

interface ConfigBarProps {
  theme: ThemeConfig;
  settings: TestSettings;
  isTestActive: boolean;
  onUpdateSettings: (newSettings: Partial<TestSettings>) => void;
  onResetTest: () => void;
  onOpenCustomText: () => void;
}

export const ConfigBar: React.FC<ConfigBarProps> = ({
  theme,
  settings,
  isTestActive,
  onUpdateSettings,
  onResetTest,
  onOpenCustomText,
}) => {
  return (
    <div
      className={`w-full max-w-4xl mx-auto mb-6 px-4 py-2.5 rounded-2xl backdrop-blur-sm transition-all duration-200 flex flex-wrap items-center justify-between gap-3 text-xs font-mono select-none shadow-sm ${
        isTestActive ? 'opacity-30 hover:opacity-100 pointer-events-auto' : 'opacity-100'
      }`}
      style={{
        backgroundColor: theme.cardBg,
        border: `1px solid ${theme.border}`,
        color: theme.textMuted,
      }}
    >
