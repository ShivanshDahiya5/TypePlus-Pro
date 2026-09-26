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

// Memoized single Word component to avoid re-rendering entire word list on every keystroke
interface WordItemProps {
  wordObj: WordState;
  wordIdx: number;
  isCurrent: boolean;
  theme: ThemeConfig;
  blindMode: boolean;
  caretStyle: CaretStyle;
  currentInputLength: number;
  isFocused: boolean;
}

const WordItem = memo<WordItemProps>(
  ({
    wordObj,
    wordIdx,
    isCurrent,
    theme,
    blindMode,
    caretStyle,
    currentInputLength,
    isFocused,
  }) => {
    const hasError =
      wordObj.isComplete &&
      wordObj.characters.some((c) => c.status === 'incorrect' || c.status === 'extra');

      return (
      <div
        data-word-idx={wordIdx}
        className={`relative inline-flex items-center transition-opacity select-none ${
          isCurrent ? 'opacity-100 font-medium' : 'opacity-80'
        } ${hasError ? 'border-b-2 border-rose-500/80' : ''}`}
      >
        {wordObj.characters.map((charObj, charIdx) => {
          let charColor = theme.charUntyped;
          let bgColor = 'transparent';

          if (charObj.status === 'correct') {
            charColor = theme.charCorrect;
          } else if (charObj.status === 'incorrect') {
            charColor = blindMode ? theme.charUntyped : theme.charIncorrect;
            bgColor = blindMode ? 'transparent' : 'rgba(244, 63, 94, 0.18)';
          } else if (charObj.status === 'extra') {
            charColor = blindMode ? theme.charUntyped : theme.charExtra;
            bgColor = blindMode ? 'transparent' : 'rgba(225, 29, 72, 0.25)';
          }