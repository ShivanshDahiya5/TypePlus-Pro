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
