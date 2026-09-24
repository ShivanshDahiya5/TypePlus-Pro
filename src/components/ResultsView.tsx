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

export const ResultsView: React.FC<ResultsViewProps> = ({
  theme,
  result,
  onNextTest,
  onRepeatTest,
  onOpenHistory,
}) => {
  const [copied, setCopied] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // Trigger confetti if personal best
  useEffect(() => {
    if (result.isPersonalBest) {
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: [theme.primary, theme.accent, '#10b981', '#f59e0b', '#ec4899'],
        });
      } catch {
        // ignore
      }
    }
  }, [result.isPersonalBest, theme]);
