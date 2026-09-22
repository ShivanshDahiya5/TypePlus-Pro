import React, { useState } from 'react';
import {
  X,
  Trophy,
  History,
  Trash2,
  Award,
} from 'lucide-react';
import { OverallStats, TestResult, ThemeConfig } from '../types';

interface HistoryModalProps {
  theme: ThemeConfig;
  isOpen: boolean;
  history: TestResult[];
  overallStats: OverallStats;
  onClose: () => void;
  onClearHistory: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  theme,
  isOpen,
  history,
  overallStats,
  onClose,
  onClearHistory,
}) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);

    if (!isOpen) return null;

  const formatTimeTyped = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/70 font-mono">
      <div
        className="relative w-full max-w-3xl max-h-[85vh] rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col overflow-hidden border backdrop-blur-xl"
        style={{
          backgroundColor: theme.cardBg,
          borderColor: theme.border,
          color: theme.text,
        }}
