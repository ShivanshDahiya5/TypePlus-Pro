import React from 'react';
import {
  Clock,
  Type,
  Quote as QuoteIcon,
  Sliders,
  AtSign,
  Hash,
  RotateCcw,
} from 'lucide-react';
import {
  QuoteLength,
  TestSettings,
  ThemeConfig,
  TimeOption,
  WordOption,
} from '../types';

interface ConfigBarProps {
  theme: ThemeConfig;
  settings: TestSettings;
  isTestActive: boolean;
  onUpdateSettings: (newSettings: Partial<TestSettings>) => void;
  onResetTest: () => void;
  onOpenCustomText: () => void;
}
