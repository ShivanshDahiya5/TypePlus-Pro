import React, { useEffect, useState } from 'react';
import {
  Trophy,
  RotateCcw,
  Play,
  Copy,
  Check,
  TrendingUp,
  Activity,
  AlertTriangle,
  Target,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TestResult, ThemeConfig } from '../types';

interface ResultsViewProps {
  theme: ThemeConfig;
  result: TestResult;
  onNextTest: () => void;
  onRepeatTest: () => void;
  onOpenHistory: () => void;
}
