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
