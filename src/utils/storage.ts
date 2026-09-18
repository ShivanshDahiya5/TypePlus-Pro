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
