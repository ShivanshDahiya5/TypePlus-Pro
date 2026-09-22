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
        >
        {/* Modal Header */}
        <div
          className="flex items-center justify-between pb-4 border-b"
          style={{ borderColor: theme.border }}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-xl shadow-md"
              style={{ backgroundColor: theme.primaryLight, color: theme.primary }}
            >
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Typing Statistics & History</h2>
              <p className="text-xs opacity-70" style={{ color: theme.textMuted }}>
                Lifetime records and performance telemetry
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl transition-all hover:opacity-100 opacity-70 cursor-pointer"
            style={{ backgroundColor: theme.bg, color: theme.text }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto py-5 space-y-6 pr-1">
          {/* Overall Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div
              className="p-4 rounded-2xl border shadow-sm"
              style={{ backgroundColor: theme.bg, borderColor: theme.border }}
            >
              <div
                className="text-[11px] uppercase tracking-widest font-bold opacity-70 mb-1"
                style={{ color: theme.textMuted }}
              >
                Tests Finished
              </div>
              <div className="text-2xl font-bold">{overallStats.testsCompleted}</div>
              <div className="text-[11px] opacity-60 mt-0.5">sessions</div>
            </div>