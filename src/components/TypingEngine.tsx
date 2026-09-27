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

          const isCaretHere =
            isCurrent && isFocused && caretStyle !== 'off' && charIdx === currentInputLength;

          return (
            <span
              key={charIdx}
              className="relative inline-block px-[0.5px] rounded-xs"
              style={{
                color: charColor,
                backgroundColor: bgColor,
              }}
            >
                {isCaretHere && (
                <span
                  className={`absolute left-0 pointer-events-none z-20 ${
                    caretStyle === 'line'
                      ? 'top-0 bottom-0 w-[2.5px] rounded-full'
                      : caretStyle === 'block'
                      ? 'inset-0 opacity-40 rounded-xs'
                      : 'bottom-0 left-0 right-0 h-[3px] rounded-full'
                  }`}
                  style={{
                    backgroundColor: theme.caret,
                    boxShadow: `0 0 10px ${theme.caret}`,
                  }}
                />
              )}
              {charObj.char}
            </span>
          );
        })}

        {/* Caret at end of current word if user typed more characters */}
        {isCurrent &&
          isFocused &&
          caretStyle !== 'off' &&
          currentInputLength >= wordObj.characters.length && (
            <span
              className={`inline-block pointer-events-none ${
                caretStyle === 'line'
                ? 'w-[2.5px] h-[1.2em] rounded-full align-middle'
                  : caretStyle === 'block'
                  ? 'w-[0.6em] h-[1.2em] opacity-40 align-middle rounded-xs'
                  : 'w-[0.6em] h-[3px] rounded-full align-bottom'
              }`}
              style={{
                backgroundColor: theme.caret,
                boxShadow: `0 0 10px ${theme.caret}`,
              }}
            />
          )}
      </div>
    );
  }
);
WordItem.displayName = 'WordItem';

export const TypingEngine: React.FC<TypingEngineProps> = ({
  theme,
  settings,
  wordsList,
  quoteAuthor,
  soundType,
  soundVolume,
  caretStyle,
  fontSize,
  blindMode,
  onFinishTest,
  onLiveUpdate,
  onRestart,
}) => {
    // Core typing state
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [currentInput, setCurrentInput] = useState('');
  const [isFocused, setIsFocused] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [wordStates, setWordStates] = useState<WordState[]>([]);

  // Keystrokes & error counters
  const [correctCharsCount, setCorrectCharsCount] = useState(0);
  const [incorrectCharsCount, setIncorrectCharsCount] = useState(0);
  const [extraCharsCount, setExtraCharsCount] = useState(0);
  const [missedCharsCount, setMissedCharsCount] = useState(0);
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0);
  const [errorKeystrokes, setErrorKeystrokes] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);

  // Performance telemetry refs to avoid re-renders during high-speed typing
  const startTimeRef = useRef<number | null>(null);
  const lastRecordedSecRef = useRef<number>(0);
  const timelineRef = useRef<SecondSnapshot[]>([]);
  const keyStatsRef = useRef<Record<string, { total: number; mistakes: number }>>({});
  const statsRef = useRef({
    netCorrectChars: 0,
    correctCharsCount: 0,
    incorrectCharsCount: 0,
    extraCharsCount: 0,
    missedCharsCount: 0,
    correctKeystrokes: 0,
    errorKeystrokes: 0,
    totalKeystrokes: 0,
    currentWordIdx: 0,
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const wordsContainerRef = useRef<HTMLDivElement>(null);

  // Calculate total net correct characters fast
  const computeNetCorrectChars = useCallback(
    (states: WordState[], activeIdx: number, activeInput: string): number => {
      let count = 0;
      for (let i = 0; i < states.length; i++) {
        const w = states[i];
        if (i < activeIdx) {
          let wordAllCorrect = true;
          for (let j = 0; j < w.original.length; j++) {
            if (w.characters[j]?.status === 'correct') {
              count += 1;
            } else {
              wordAllCorrect = false;
            }
          }
          if (w.characters.some((c) => c.status === 'extra')) {
            wordAllCorrect = false;
          }
          if (wordAllCorrect) {
            count += 1; // space delimiter
          }
        } else if (i === activeIdx) {
          for (let j = 0; j < activeInput.length && j < w.original.length; j++) {
            if (activeInput[j] === w.original[j]) {
              count += 1;
            }
          }
        }
      }
      return count;
    },
    []
  );

  // Synchronize statsRef
  useEffect(() => {
    const netCorrect = computeNetCorrectChars(wordStates, currentWordIdx, currentInput);
    statsRef.current = {
      netCorrectChars: netCorrect,
      correctCharsCount,
      incorrectCharsCount,
      extraCharsCount,
      missedCharsCount,
      correctKeystrokes,
      errorKeystrokes,
      totalKeystrokes,
      currentWordIdx,
    };
    }, [
    wordStates,
    currentWordIdx,
    currentInput,
    correctCharsCount,
    incorrectCharsCount,
    extraCharsCount,
    missedCharsCount,
    correctKeystrokes,
    errorKeystrokes,
    totalKeystrokes,
    computeNetCorrectChars,
  ]);

  // Initialize test states on wordsList change
  useEffect(() => {
    const states: WordState[] = wordsList.map((w, idx) => ({
      original: w,
      characters: w.split('').map((c) => ({ char: c, status: 'untyped' })),
      isCurrent: idx === 0,
      isComplete: false,
    }));
    setWordStates(states);
    setCurrentWordIdx(0);
    setCurrentInput('');
    setHasStarted(false);
    setIsFinished(false);
    setCorrectCharsCount(0);
    setIncorrectCharsCount(0);
    setExtraCharsCount(0);
    setMissedCharsCount(0);
    setCorrectKeystrokes(0);
    setErrorKeystrokes(0);
    setTotalKeystrokes(0);
    startTimeRef.current = null;
    lastRecordedSecRef.current = 0;
    timelineRef.current = [];
    keyStatsRef.current = {};
    statsRef.current = {
      netCorrectChars: 0,
      correctCharsCount: 0,
      incorrectCharsCount: 0,
      extraCharsCount: 0,
      missedCharsCount: 0,
      correctKeystrokes: 0,
      errorKeystrokes: 0,
      totalKeystrokes: 0,
      currentWordIdx: 0,
    };

    onLiveUpdate({
      wpm: 0,
      rawWpm: 0,
      accuracy: 100,
      errorsCount: 0,
      timeRemaining: settings.mode === 'time' ? settings.timeOption : undefined,
      currentWordIndex: 0,
      totalWords: wordsList.length,
      isTestActive: false,
    });

    if (wordsContainerRef.current) {
      wordsContainerRef.current.scrollTop = 0;
    }

    setTimeout(() => {
      inputRef.current?.focus();
    }, 20);
  }, [wordsList, settings, onLiveUpdate]);

  // Complete test
  const completeTest = useCallback(() => {
    if (isFinished) return;
    setIsFinished(true);

    playCompletionSound(soundVolume);

    const now = Date.now();
    const startTime = startTimeRef.current || now;
    const exactDuration = Math.max(0.5, (now - startTime) / 1000);
    const durationMinutes = exactDuration / 60;
    const stats = statsRef.current;

    const displayDuration =
      settings.mode === 'time' ? settings.timeOption : Math.max(1, Math.round(exactDuration));

    const totalAttempts = stats.correctKeystrokes + stats.errorKeystrokes;
    const accuracy =
      totalAttempts > 0
        ? Number(((stats.correctKeystrokes / totalAttempts) * 100).toFixed(1))
        : 100;

    const wpm = Math.max(0, Math.round(stats.netCorrectChars / 5 / durationMinutes));
    const rawWpm = Math.max(0, Math.round(stats.totalKeystrokes / 5 / durationMinutes));
    const cpm = Math.round(stats.netCorrectChars / durationMinutes);

    const finalSec = Math.max(1, Math.round(exactDuration));
    if (
      timelineRef.current.length === 0 ||
      timelineRef.current[timelineRef.current.length - 1].second < finalSec
    ) {
      timelineRef.current.push({
        second: finalSec,
        wpm,
        rawWpm,
        accuracy,
        errors: stats.errorKeystrokes,
        keystrokes: stats.totalKeystrokes,
      });
    }

    // Consistency calculations
    const timeline = timelineRef.current;
    let consistency = 100;
    if (timeline.length > 2) {
      const wpms = timeline.map((s) => s.wpm);
      const mean = wpms.reduce((a, b) => a + b, 0) / wpms.length;
      if (mean > 0) {
        const variance =
          wpms.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / wpms.length;
        const stdDev = Math.sqrt(variance);
        const cv = (stdDev / mean) * 100;
        consistency = Math.max(0, Math.min(100, Math.round(100 - cv)));
      }
    }

    // Problem keys
    const problemKeys = (
      Object.entries(keyStatsRef.current) as [string, { total: number; mistakes: number }][]
    )
      .filter(([_, stat]) => stat.mistakes > 0)
      .map(([key, stat]) => ({
        key,
        errorRate: Math.round((stat.mistakes / stat.total) * 100),
        count: stat.mistakes,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    let modeDescription = `${settings.mode}`;
    if (settings.mode === 'time') modeDescription = `time ${settings.timeOption}s`;
    if (settings.mode === 'words') modeDescription = `words ${settings.wordOption}`;
    if (settings.mode === 'quote') modeDescription = `quote (${settings.quoteLength})`;
    if (settings.mode === 'custom') modeDescription = `custom`;

    const result: TestResult = {
      id: `test_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: Date.now(),
      mode: settings.mode,
      modeDescription,
      wpm,
      rawWpm,
      cpm,
      accuracy,
      consistency,
      durationSeconds: displayDuration,
      correctChars: stats.netCorrectChars,
      incorrectChars: stats.incorrectCharsCount,
      extraChars: stats.extraCharsCount,
      missedChars: stats.missedCharsCount,
      totalKeystrokes: stats.totalKeystrokes,
      timeline,
      problemKeys,
      quoteAuthor,
    };

    onFinishTest(result);
  }, [isFinished, settings, quoteAuthor, soundVolume, onFinishTest]);

  // Smooth scroll active word when needed without thrashing
  const checkAutoScroll = useCallback((wordIndex: number) => {
    const container = wordsContainerRef.current;
    if (!container) return;
    const currentWordEl = container.querySelector(
      `[data-word-idx="${wordIndex}"]`
    ) as HTMLElement;
    if (currentWordEl) {
      const wordOffsetTop = currentWordEl.offsetTop;
      if (wordOffsetTop > 60) {
        container.scrollTo({
          top: wordOffsetTop - 45,
          behavior: 'smooth',
        });
      } else {
        container.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      }
    }
  }, []);

  // Countdown and telemetry tick timer
  useEffect(() => {
    if (!hasStarted || isFinished) return;

    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
    }

    const intervalId = setInterval(() => {
      const now = Date.now();
      const startTime = startTimeRef.current || now;
      const elapsedSecExact = (now - startTime) / 1000;
      const wholeSec = Math.floor(elapsedSecExact);

      const stats = statsRef.current;
      const durationMins = Math.max(0.016, elapsedSecExact / 60);
      const currentWpm = Math.max(
        0,
        Math.round(stats.netCorrectChars / 5 / durationMins)
      );
      const currentRawWpm = Math.max(
        0,
        Math.round(stats.totalKeystrokes / 5 / durationMins)
      );
      const totalAttempts = stats.correctKeystrokes + stats.errorKeystrokes;
      const currentAcc =
        totalAttempts > 0
          ? Number(((stats.correctKeystrokes / totalAttempts) * 100).toFixed(1))
          : 100;

           if (settings.mode === 'time') {
        const remaining = Math.max(
          0,
          Math.ceil(settings.timeOption - elapsedSecExact)
        );

        if (elapsedSecExact >= settings.timeOption) {
          clearInterval(intervalId);
          completeTest();
          return;
        }
      }

      if (wholeSec > lastRecordedSecRef.current) {
        timelineRef.current.push({
          second: wholeSec,
          wpm: currentWpm,
          rawWpm: currentRawWpm,
          accuracy: currentAcc,
          errors: stats.errorKeystrokes,
          keystrokes: stats.totalKeystrokes,
        });
        lastRecordedSecRef.current = wholeSec;
      }

      onLiveUpdate({
        wpm: currentWpm,
        rawWpm: currentRawWpm,
        accuracy: currentAcc,
        errorsCount: stats.errorKeystrokes,
        timeRemaining:
          settings.mode === 'time'
            ? Math.max(0, Math.ceil(settings.timeOption - elapsedSecExact))
            : undefined,
        currentWordIndex: stats.currentWordIdx,
        totalWords: wordsList.length,
        isTestActive: true,
      });
    }, 150);

    return () => clearInterval(intervalId);
  }, [
    hasStarted,
    isFinished,
    settings.mode,
    settings.timeOption,
    completeTest,
    wordsList.length,
    onLiveUpdate,
  ]);