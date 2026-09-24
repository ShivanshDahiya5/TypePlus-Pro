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

    // Keyboard shortcuts (Tab / Enter for Next Test, Escape for Repeat)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        onNextTest();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onRepeatTest();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNextTest, onRepeatTest]);

  // Copy shareable summary to clipboard
  const handleCopyResult = () => {
    const text = `⌨️ TypePulse Result:\n🚀 Speed: ${result.wpm} WPM (Raw: ${result.rawWpm})\n🎯 Accuracy: ${result.accuracy}%\n⏱️ Mode: ${result.modeDescription}\n🔥 Consistency: ${result.consistency}%\n`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

