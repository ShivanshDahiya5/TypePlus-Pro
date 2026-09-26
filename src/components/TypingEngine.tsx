import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import {
  CaretStyle,
  FontSize,
  SecondSnapshot,
  SoundType,
  TestResult,
  TestSettings,
  ThemeConfig,
  WordState,
} from '../types';
import { playKeySound, playCompletionSound } from '../utils/audio';
import { MousePointer, Keyboard, RotateCcw, Sparkles } from 'lucide-react';

interface TypingEngineProps {
  theme: ThemeConfig;
  settings: TestSettings;
  wordsList: string[];
  quoteAuthor?: string;
  soundType: SoundType;
  soundVolume: number;
  caretStyle: CaretStyle;
  fontSize: FontSize;
  blindMode: boolean;
  smoothCaret?: boolean;
  onFinishTest: (result: TestResult) => void;
  onLiveUpdate: (stats: {
    wpm: number;
    rawWpm: number;
    accuracy: number;
    errorsCount: number;
    timeRemaining?: number;
    currentWordIndex: number;
    totalWords: number;
    isTestActive: boolean;
  }) => void;
  onRestart: () => void;
}
