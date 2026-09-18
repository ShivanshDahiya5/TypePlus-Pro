import { OverallStats, TestResult, UserPreferences } from '../types';

const STORAGE_KEYS = {
  PREFERENCES: 'typepulse_user_preferences',
  HISTORY: 'typepulse_test_history',
  STATS: 'typepulse_overall_stats',
};

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'midnight',
  sound: 'mechanical',
  soundVolume: 0.6,
  caretStyle: 'line',
  fontSize: 'medium',
  showLiveStats: true,
  showKeyboard: false,
  blindMode: false,
  smoothCaret: true,
};

const DEFAULT_STATS: OverallStats = {
  testsCompleted: 0,
  highestWpm: 0,
  averageWpm: 0,
  averageAccuracy: 100,
  totalTimeTypedSeconds: 0,
  bestRecords: {},
};

export function loadPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    if (!raw) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(prefs: UserPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs));
  } catch {
  }
}

export function loadHistory(): TestResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list.slice(0, 100) : [];
  } catch {
    return [];
  }
}

export function loadOverallStats(): OverallStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STATS);
    if (!raw) return DEFAULT_STATS;
    return { ...DEFAULT_STATS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATS;
  }
}

export function saveTestResult(result: TestResult): { updatedHistory: TestResult[]; isPersonalBest: boolean } {
  const history = loadHistory();
  const currentStats = loadOverallStats();

  const modeKey = result.modeDescription;
  const previousBestForMode = currentStats.bestRecords[modeKey] || 0;
  const isPersonalBest = result.wpm > previousBestForMode && result.accuracy >= 90;

  const newHistory = [result, ...history].slice(0, 100);

  // Recalculate lifetime stats
  const totalCompleted = newHistory.length;
  const highestWpm = Math.max(currentStats.highestWpm, result.wpm);
  const totalWpmSum = newHistory.reduce((acc, r) => acc + r.wpm, 0);
  const averageWpm = Math.round(totalWpmSum / totalCompleted);

  const totalAccSum = newHistory.reduce((acc, r) => acc + r.accuracy, 0);
  const averageAccuracy = Number((totalAccSum / totalCompleted).toFixed(1));

  const totalTimeTyped = currentStats.totalTimeTypedSeconds + (result.durationSeconds || 0);

  const updatedBestRecords = { ...currentStats.bestRecords };
  if (result.wpm > (updatedBestRecords[modeKey] || 0)) {
    updatedBestRecords[modeKey] = result.wpm;
  }

  const updatedStats: OverallStats = {
    testsCompleted: totalCompleted,
    highestWpm,
    averageWpm,
    averageAccuracy,
    totalTimeTypedSeconds: totalTimeTyped,
    bestRecords: updatedBestRecords,
  };

  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(newHistory));
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(updatedStats));
  } catch {
    // ignore quota
  }

  return { updatedHistory: newHistory, isPersonalBest };
}