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

  const trackKey = (char: string, isError: boolean) => {
    const k = char.toLowerCase();
    if (!keyStatsRef.current[k]) {
      keyStatsRef.current[k] = { total: 0, mistakes: 0 };
    }
    keyStatsRef.current[k].total += 1;
    if (isError) {
      keyStatsRef.current[k].mistakes += 1;
    }
  };

  const emitLiveUpdateNow = (
    nextStates: WordState[],
    nextWordIndex: number,
    nextInput: string,
    nextCorrectKeys: number,
    nextErrorKeys: number,
    nextTotalKeys: number
    ) => {
    const now = Date.now();
    const startTime = startTimeRef.current || now;
    const elapsedSec = Math.max(0.1, (now - startTime) / 1000);
    const durationMins = elapsedSec / 60;
    const netCorrect = computeNetCorrectChars(nextStates, nextWordIndex, nextInput);
    const currentWpm = Math.max(0, Math.round(netCorrect / 5 / durationMins));
    const currentRawWpm = Math.max(0, Math.round(nextTotalKeys / 5 / durationMins));
    const totalAttempts = nextCorrectKeys + nextErrorKeys;
    const currentAcc =
      totalAttempts > 0
        ? Number(((nextCorrectKeys / totalAttempts) * 100).toFixed(1))
        : 100;
    const remaining =
      settings.mode === 'time'
        ? Math.max(0, Math.ceil(settings.timeOption - elapsedSec))
        : undefined;

    onLiveUpdate({
      wpm: currentWpm,
      rawWpm: currentRawWpm,
      accuracy: currentAcc,
      errorsCount: nextErrorKeys,
      timeRemaining: remaining,
      currentWordIndex: nextWordIndex,
      totalWords: wordsList.length,
      isTestActive: true,
    });
  };

    // Character Typed
  const executeCharInput = useCallback(
    (charTyped: string) => {
      if (isFinished) return;
      const currentWord = wordStates[currentWordIdx];
      if (!currentWord) return;

      if (!hasStarted) {
        setHasStarted(true);
        startTimeRef.current = Date.now();
        lastRecordedSecRef.current = 0;
      }

      const nextInput = currentInput + charTyped;
      setCurrentInput(nextInput);
      const nextTotal = totalKeystrokes + 1;
      setTotalKeystrokes(nextTotal);

      const targetChar = currentWord.original[currentInput.length];
      const isCorrect = targetChar === charTyped;

      trackKey(targetChar || charTyped, !isCorrect);

      let nextCorrectKeys = correctKeystrokes;
      let nextErrorKeys = errorKeystrokes;
      let nextCorrect = correctCharsCount;
      let nextIncorrect = incorrectCharsCount;
      let nextExtra = extraCharsCount;

      if (isCorrect) {
        nextCorrect = correctCharsCount + 1;
        setCorrectCharsCount(nextCorrect);
        nextCorrectKeys = correctKeystrokes + 1;
        setCorrectKeystrokes(nextCorrectKeys);
      } else {
        nextErrorKeys = errorKeystrokes + 1;
        setErrorKeystrokes(nextErrorKeys);
        if (currentInput.length < currentWord.original.length) {
          nextIncorrect = incorrectCharsCount + 1;
          setIncorrectCharsCount(nextIncorrect);
        } else {
          nextExtra = extraCharsCount + 1;
          setExtraCharsCount(nextExtra);
        }
      }

      playKeySound(soundType, soundVolume, !isCorrect, false);

      const updated = [...wordStates];
      const chars = [...updated[currentWordIdx].characters];

      if (currentInput.length < currentWord.original.length) {
        chars[currentInput.length] = {
          char: currentWord.original[currentInput.length],
          status: isCorrect ? 'correct' : 'incorrect',
        };
      } else {
        if (chars.length < currentWord.original.length + 10) {
          chars.push({
            char: charTyped,
            status: 'extra',
          });
        }
      }

      updated[currentWordIdx] = {
        ...updated[currentWordIdx],
        characters: chars,
      };
      setWordStates(updated);

      emitLiveUpdateNow(
        updated,
        currentWordIdx,
        nextInput,
        nextCorrectKeys,
        nextErrorKeys,
        nextTotal
      );

      // Auto-complete if finished final word perfectly
      if (
        currentWordIdx === wordStates.length - 1 &&
        nextInput.length === currentWord.original.length &&
        nextInput === currentWord.original
      ) {
        updated[currentWordIdx].isComplete = true;
        setWordStates(updated);
        setTimeout(() => completeTest(), 0);
      }
    },
    [
      isFinished,
      wordStates,
      currentWordIdx,
      hasStarted,
      currentInput,
      totalKeystrokes,
      correctKeystrokes,
      errorKeystrokes,
      correctCharsCount,
      incorrectCharsCount,
      extraCharsCount,
      soundType,
      soundVolume,
      completeTest,
    ]
  );

  // Space Pressed (advance word)
  const executeSpace = useCallback(() => {
    if (isFinished) return;
    const currentWord = wordStates[currentWordIdx];
    if (!currentWord || currentInput.length === 0) return;

    const nextTotal = totalKeystrokes + 1;
    setTotalKeystrokes(nextTotal);

    const updated = [...wordStates];
    const origWord = currentWord.original;
    let wordCorrect = true;
    let addedMissed = 0;

    const finalChars: WordState['characters'] = origWord.split('').map((c, i) => {
      if (i < currentInput.length) {
        const isMatch = currentInput[i] === c;
        if (!isMatch) wordCorrect = false;
        return {
          char: c,
          status: isMatch ? ('correct' as const) : ('incorrect' as const),
        };
      } else {
        wordCorrect = false;
        addedMissed += 1;
        return { char: c, status: 'incorrect' as const };
      }
    });

    if (addedMissed > 0) {
      setMissedCharsCount((m) => m + addedMissed);
    }

    if (currentInput.length > origWord.length) {
      wordCorrect = false;
      const extras = currentInput.slice(origWord.length).split('').map((c) => ({
        char: c,
        status: 'extra' as const,
      }));
      finalChars.push(...extras);
    }

    let nextCorrectKeys = correctKeystrokes;
    let nextErrorKeys = errorKeystrokes;

    if (wordCorrect && currentInput === origWord) {
      nextCorrectKeys = correctKeystrokes + 1;
      setCorrectKeystrokes(nextCorrectKeys);
      trackKey('space', false);
    } else {
      const penalty = addedMissed > 0 ? addedMissed : 1;
      nextErrorKeys = errorKeystrokes + penalty;
      setErrorKeystrokes(nextErrorKeys);
      trackKey('space', true);
    }

    updated[currentWordIdx] = {
      ...updated[currentWordIdx],
      characters: finalChars,
      isCurrent: false,
      isComplete: true,
    };

    playKeySound(soundType, soundVolume, !wordCorrect, true);

    if (currentWordIdx + 1 >= wordStates.length) {
      setWordStates(updated);
      setCurrentInput('');
      emitLiveUpdateNow(
        updated,
        currentWordIdx + 1,
        '',
        nextCorrectKeys,
        nextErrorKeys,
        nextTotal
      );
      setTimeout(() => completeTest(), 0);
      } else {
      const nextIdx = currentWordIdx + 1;
      updated[nextIdx] = {
        ...updated[nextIdx],
        isCurrent: true,
      };
      setWordStates(updated);
      setCurrentWordIdx(nextIdx);
      setCurrentInput('');
      checkAutoScroll(nextIdx);
      emitLiveUpdateNow(
        updated,
        nextIdx,
        '',
        nextCorrectKeys,
        nextErrorKeys,
        nextTotal
      );
    }
    }, [
    isFinished,
    wordStates,
    currentWordIdx,
    currentInput,
    totalKeystrokes,
    correctKeystrokes,
    errorKeystrokes,
    soundType,
    soundVolume,
    completeTest,
    checkAutoScroll,
  ]);

  // Backspace Pressed
  const executeBackspace = useCallback(
    (isWordDelete = false) => {
      if (isFinished || !hasStarted) return;
      const currentWord = wordStates[currentWordIdx];
      if (!currentWord) return;

      if (isWordDelete) {
        setCurrentInput('');
        const updated = [...wordStates];
        updated[currentWordIdx] = {
          ...updated[currentWordIdx],
          characters: updated[currentWordIdx].original.split('').map((c) => ({
            char: c,
            status: 'untyped',
          })),
        };
        setWordStates(updated);
        playKeySound(soundType, soundVolume);
        emitLiveUpdateNow(
          updated,
          currentWordIdx,
          '',
          correctKeystrokes,
          errorKeystrokes,
          totalKeystrokes
        );
        return;
      }

      if (currentInput.length > 0) {
        const nextInput = currentInput.slice(0, -1);
        setCurrentInput(nextInput);

        const updated = [...wordStates];
        const chars = [...updated[currentWordIdx].characters];
        let nextExtra = extraCharsCount;

        if (currentInput.length > currentWord.original.length) {
          chars.pop();
          nextExtra = Math.max(0, extraCharsCount - 1);
          setExtraCharsCount(nextExtra);
        } else {
          const charIdx = currentInput.length - 1;
          if (chars[charIdx]) {
            chars[charIdx] = { ...chars[charIdx], status: 'untyped' };
          }
        }

        updated[currentWordIdx] = {
          ...updated[currentWordIdx],
          characters: chars,
        };
        setWordStates(updated);
        playKeySound(soundType, soundVolume);
        emitLiveUpdateNow(
          updated,
          currentWordIdx,
          nextInput,
          correctKeystrokes,
          errorKeystrokes,
          totalKeystrokes
        );
      } else if (currentWordIdx > 0) {
        const prevWord = wordStates[currentWordIdx - 1];
        const prevHadErrors = prevWord.characters.some(
          (c) => c.status === 'incorrect' || c.status === 'extra'
        );

        if (prevHadErrors) {
          const updated = [...wordStates];
          updated[currentWordIdx] = { ...updated[currentWordIdx], isCurrent: false };
          const nextIdx = currentWordIdx - 1;
          const reconstructedInput = prevWord.characters.map((c) => c.char).join('');
          updated[nextIdx] = {
            ...updated[nextIdx],
            isCurrent: true,
            isComplete: false,
          };
          setWordStates(updated);
          setCurrentWordIdx(nextIdx);
          setCurrentInput(reconstructedInput);
          checkAutoScroll(nextIdx);
          playKeySound(soundType, soundVolume);
          emitLiveUpdateNow(
            updated,
            nextIdx,
            reconstructedInput,
            correctKeystrokes,
            errorKeystrokes,
            totalKeystrokes
          );
        }
      }
    },
    [
      isFinished,
      hasStarted,
      wordStates,
      currentWordIdx,
      currentInput,
      extraCharsCount,
      correctKeystrokes,
      errorKeystrokes,
      totalKeystrokes,
      soundType,
      soundVolume,
      checkAutoScroll,
    ]
  );

  // Desktop physical keyboard listener
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isFinished) return;

    if (e.key === 'Tab' || e.key === 'Escape') {
      e.preventDefault();
      onRestart();
      return;
    }

    if (e.key === 'Unidentified' || e.keyCode === 229 || e.key === 'Process') {
      return;
    }

    const ignoredKeys = [
      'Shift',
      'Control',
      'Alt',
      'Meta',
      'CapsLock',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'PageUp',
      'PageDown',
      'Home',
      'End',
      'Insert',
      'Delete',
      'ContextMenu',
      'NumLock',
      'ScrollLock',
      'Pause',
      'F1',
      'F2',
      'F3',
      'F4',
      'F5',
      'F6',
      'F7',
      'F8',
      'F9',
      'F10',
      'F11',
      'F12',
    ];
    if (ignoredKeys.includes(e.key) || (e.key.startsWith('F') && e.key.length > 1)) {
      return;
    }

    if (e.key === 'Backspace') {
      e.preventDefault();
      executeBackspace(e.ctrlKey || e.metaKey);
      return;
    }

    if (e.key === ' ') {
      e.preventDefault();
      executeSpace();
      return;
    }

    if (e.key.length === 1) {
      e.preventDefault();
      executeCharInput(e.key);
    }
  };

  // Mobile virtual keyboard onChange listener
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFinished) return;
    const newVal = e.target.value;

    if (newVal.length > currentInput.length) {
      const diff = newVal.slice(currentInput.length);
      for (const char of diff) {
        if (char === ' ') {
          executeSpace();
        } else {
          executeCharInput(char);
        }
      }
    } else if (newVal.length < currentInput.length) {
      const deletions = currentInput.length - newVal.length;
      for (let i = 0; i < deletions; i++) {
        executeBackspace(false);
      }
    }
  };

  const triggerFocus = useCallback(() => {
    inputRef.current?.focus();
    setIsFocused(true);
  }, []);

  const fontSizeClasses = {
    small: 'text-base sm:text-xl leading-relaxed',
    medium: 'text-lg sm:text-2xl leading-relaxed',
    large: 'text-xl sm:text-3xl leading-loose',
  }[fontSize];

  return (
    <div
      id="typing-area-container"
      onClick={triggerFocus}
      onTouchStart={triggerFocus}
      className="relative w-full max-w-4xl mx-auto rounded-3xl p-5 sm:p-10 select-none transition-all cursor-text focus:outline-none shadow-2xl backdrop-blur-md"
      style={{
        backgroundColor: theme.cardBg,
        border: `1px solid ${theme.border}`,
        minHeight: '260px',
        touchAction: 'manipulation',
      }}
    >
      {/* Invisible input capturing physical keystrokes & mobile soft keyboard */}
      <input
        ref={inputRef}
        type="text"
        value={currentInput}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="absolute opacity-0 inset-0 w-full h-full cursor-text text-base z-10"
        style={{
          fontSize: '16px',
          caretColor: 'transparent',
          pointerEvents: isFocused ? 'auto' : 'none',
        }}
        autoFocus
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        inputMode="text"
        enterKeyHint="done"
        tabIndex={0}
      />

      {/* Unfocused overlay prompt */}
      {!isFocused && !isFinished && (
        <div
          className="absolute inset-0 z-30 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center transition-opacity cursor-pointer p-4 text-center"
          style={{ backgroundColor: `${theme.cardBg}ee` }}
          onClick={triggerFocus}
          onTouchStart={triggerFocus}
        >
          <button
            type="button"
            className="px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-2.5 font-mono text-sm font-semibold border transition-transform active:scale-95 cursor-pointer animate-pulse"
            style={{
              backgroundColor: theme.bg,
              borderColor: theme.border,
              color: theme.primary,
              boxShadow: `0 4px 24px ${theme.primary}30`,
            }}
          >
            <Keyboard className="w-5 h-5 sm:hidden" />
            <MousePointer className="w-4 h-4 hidden sm:inline" />
            <span>Click or Tap to start typing</span>
          </button>
          <p
          className="mt-2 text-xs font-mono opacity-60"
            style={{ color: theme.textMuted }}
          >
            Touch screen & physical keyboards supported
          </p>
        </div>
      )}

      {/* Words Rendering Container */}
      <div
        ref={wordsContainerRef}
        className={`relative font-mono font-normal tracking-wider overflow-y-auto max-h-48 sm:max-h-60 scroll-smooth pr-2 transition-all ${fontSizeClasses}`}
        style={{
          color: theme.charUntyped,
          lineHeight: '1.9',
        }}
      >
        <div className="flex flex-wrap gap-x-[0.65em] gap-y-2.5">
          {wordStates.map((wordObj, wordIdx) => (
            <WordItem
              key={wordIdx}
              wordObj={wordObj}
              wordIdx={wordIdx}
              isCurrent={wordIdx === currentWordIdx}
              theme={theme}
              blindMode={blindMode}
              caretStyle={caretStyle}
              currentInputLength={currentInput.length}
              isFocused={isFocused}
            />
          ))}
        </div>
      </div>

      {/* Quote author attribution */}
      {quoteAuthor && (
        <div
          className="mt-5 pt-3.5 border-t flex items-center justify-end text-xs font-mono italic opacity-75"
          style={{ borderColor: theme.border, color: theme.textMuted }}
        >
          <span>— {quoteAuthor}</span>
        </div>
      )}

{/* Footer shortcut helper & Mobile Restart button */}
      <div
        className="mt-6 pt-3.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono opacity-80 border-t"
        style={{ borderColor: theme.border, color: theme.textMuted }}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRestart();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/20 hover:bg-black/35 active:scale-95 border transition-all text-xs cursor-pointer shadow-xs"
            style={{ borderColor: theme.border, color: theme.text }}
            title="Restart test"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart</span>
          </button>

          <span className="hidden sm:inline text-[11px] opacity-60">or press</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-black/30 border border-current text-[10px] shadow-xs">
            tab
          </kbd>
          <span className="hidden sm:inline">+</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-black/30 border border-current text-[10px] shadow-xs">
            enter
          </kbd>
        </div>
        <div className="flex items-center gap-1.5 font-medium text-[11px]">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Zero-Latency 120fps Engine</span>
        </div>
      </div>
    </div>
  );
};
