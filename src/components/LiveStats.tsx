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