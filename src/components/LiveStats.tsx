import React from 'react';
import { Gauge, Target, Clock } from 'lucide-react';
import { TestMode, ThemeConfig } from '../types';

interface LiveStatsProps {
  theme: ThemeConfig;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  errorsCount: number;
  timeRemaining?: number;
  totalTime?: number;
  currentWordIndex: number;
  totalWords: number;
  mode: TestMode;
  isTestActive: boolean;
}

export const LiveStats: React.FC<LiveStatsProps> = ({
  theme,
  wpm,
  rawWpm,
  accuracy,
  errorsCount,
  timeRemaining,
  totalTime,
  currentWordIndex,
  totalWords,
  mode,
  isTestActive,
}) => {
  return (
    <div
      className={`w-full max-w-4xl mx-auto mb-5 px-5 py-3 rounded-2xl flex items-center justify-between gap-4 font-mono transition-all duration-300 backdrop-blur-md shadow-md ${
        isTestActive ? 'opacity-100 scale-100' : 'opacity-80 scale-[0.99]'
      }`}
      style={{
        backgroundColor: theme.cardBg,
        border: `1px solid ${theme.border}`,
      }}
    >
