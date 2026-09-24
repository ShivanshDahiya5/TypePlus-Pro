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
        {/* Real-time WPM Counter */}
      <div className="flex items-center gap-3.5">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
          style={{
            backgroundColor: theme.primaryLight,
            color: theme.primary,
            border: `1px solid ${theme.primary}30`,
          }}
        >
          <Gauge className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span
              className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono"
              style={{ color: theme.primary }}
            >
              {wpm}
            </span>
            <span className="text-[11px] uppercase tracking-widest font-bold opacity-75" style={{ color: theme.textMuted }}>
              wpm
            </span>
          </div>
          <div className="text-[11px] font-medium opacity-65 flex items-center gap-1" style={{ color: theme.textMuted }}>
            <span>raw {rawWpm}</span>
          </div>
        </div>
      </div>

      {/* Accuracy Meter */}
      <div className="flex items-center gap-3.5">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center hidden sm:flex shadow-md"
          style={{
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            color: '#10b981',
            border: '1px solid rgba(16, 185, 129, 0.25)',
          }}
        >
          <Target className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span
              className="text-2xl sm:text-3xl font-extrabold tracking-tight font-mono"
              style={{ color: accuracy >= 95 ? '#10b981' : accuracy >= 85 ? theme.accent : '#f43f5e' }}
            ></span>