/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import {
  OverallStats,
  TestResult,
  TestSettings,
  UserPreferences,
} from './types';
import { THEMES } from './utils/themes';
import { generateTestText } from './utils/words';
import {
  clearAllHistory,
  loadHistory,
  loadOverallStats,
  loadPreferences,
  savePreferences,
  saveTestResult,
} from './utils/storage';
import { Header } from './components/Header';
import { ConfigBar } from './components/ConfigBar';
import { LiveStats } from './components/LiveStats';
import { TypingEngine } from './components/TypingEngine';
import { ResultsView } from './components/ResultsView';
import { HistoryModal } from './components/HistoryModal';
import { CustomTextModal } from './components/CustomTextModal';
import { KeyboardVisualizer } from './components/KeyboardVisualizer';

export default function App() {
  // Preferences & Themes
  const [preferences, setPreferences] = useState<UserPreferences>(() => loadPreferences());
  const theme = THEMES[preferences.theme] || THEMES.midnight;

  // History & Lifetime Stats
  const [history, setHistory] = useState<TestResult[]>(() => loadHistory());
  const [overallStats, setOverallStats] = useState<OverallStats>(() => loadOverallStats());

  // Modals
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isCustomTextOpen, setIsCustomTextOpen] = useState(false);

  // Test Settings
  const [settings, setSettings] = useState<TestSettings>({
    mode: 'time',
    timeOption: 30,
    wordOption: 25,
    quoteLength: 'medium',
    punctuation: false,
    numbers: false,
    customText: '',
    customTitle: '',
  });

    const [wordsList, setWordsList] = useState<string[]>([]);
  const [quoteAuthor, setQuoteAuthor] = useState<string | undefined>(undefined);
  const [testSessionKey, setTestSessionKey] = useState<number>(1);

  // Live HUD States
  const [liveStats, setLiveStats] = useState<{
    wpm: number;
    rawWpm: number;
    accuracy: number;
    errorsCount: number;
    timeRemaining?: number;
    currentWordIndex: number;
    totalWords: number;
    isTestActive: boolean;
}>({
    wpm: 0,
    rawWpm: 0,
    accuracy: 100,
    errorsCount: 0,
    timeRemaining: 30,
    currentWordIndex: 0,
    totalWords: 0,
    isTestActive: false,
  });

  // Result state
  const [currentResult, setCurrentResult] = useState<TestResult | null>(null);

  // Regenerate test text
  const initializeTest = useCallback(
    (customSettings?: Partial<TestSettings>) => {
      const activeSettings = { ...settings, ...customSettings };
      const { words, quoteAuthor: author } = generateTestText(activeSettings);
      setWordsList(words);
      setQuoteAuthor(author);
      setCurrentResult(null);
      setLiveStats({
        wpm: 0,
        rawWpm: 0,
        accuracy: 100,
        errorsCount: 0,
        timeRemaining: activeSettings.mode === 'time' ? activeSettings.timeOption : undefined,
        currentWordIndex: 0,
        totalWords: words.length,
        isTestActive: false,
      });
      setTestSessionKey((k) => k + 1);
    },
    [settings]
  );

  // Initial load
  useEffect(() => {
    initializeTest();
  }, []);

  // Update preferences handler
  const handleUpdatePreferences = (newPrefs: Partial<UserPreferences>) => {
    setPreferences((prev) => {
      const updated = { ...prev, ...newPrefs };
      savePreferences(updated);
      return updated;
    });
  };

  // Update test settings handler
  const handleUpdateSettings = (newSettings: Partial<TestSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      initializeTest(updated);
      return updated;
    });
  };

  // Test completion handler
  const handleFinishTest = (result: TestResult) => {
    const { updatedHistory, isPersonalBest } = saveTestResult(result);
    setHistory(updatedHistory);
    setOverallStats(loadOverallStats());
    setCurrentResult({ ...result, isPersonalBest });
  };

  // Clear history handler
  const handleClearHistory = () => {
    clearAllHistory();
    setHistory([]);
    setOverallStats(loadOverallStats());
  };

  // Apply custom text
  const handleApplyCustomText = (text: string, title?: string) => {
    const newSettings: Partial<TestSettings> = {
      mode: 'custom',
      customText: text,
      customTitle: title || 'Custom Text',
    };
    setSettings((prev) => ({ ...prev, ...newSettings }));
    initializeTest(newSettings);
  };
