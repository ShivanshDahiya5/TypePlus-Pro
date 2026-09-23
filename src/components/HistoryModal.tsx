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

            <div
              className="p-4 rounded-2xl border shadow-sm"
              style={{ backgroundColor: theme.bg, borderColor: theme.border }}
            >
              <div
                className="text-[11px] uppercase tracking-widest font-bold opacity-70 mb-1"
                style={{ color: theme.textMuted }}
              >
                Highest Speed
              </div>
              <div className="text-2xl font-bold" style={{ color: theme.primary }}>
                {overallStats.highestWpm} <span className="text-xs">WPM</span>
              </div>
              <div className="text-[11px] opacity-60 mt-0.5">personal record</div>
            </div>

            <div
              className="p-4 rounded-2xl border shadow-sm"
              style={{ backgroundColor: theme.bg, borderColor: theme.border }}
            >
              <div
                className="text-[11px] uppercase tracking-widest font-bold opacity-70 mb-1"
                style={{ color: theme.textMuted }}
              >
                Average Speed
              </div>
              <div className="text-2xl font-bold">
                {overallStats.averageWpm} <span className="text-xs">WPM</span>
              </div>
              <div className="text-[11px] opacity-60 mt-0.5">overall average</div>
            </div>

            <div
              className="p-4 rounded-2xl border shadow-sm"
              style={{ backgroundColor: theme.bg, borderColor: theme.border }}
            >
              <div
                className="text-[11px] uppercase tracking-widest font-bold opacity-70 mb-1"
                style={{ color: theme.textMuted }}
              >
                Avg Accuracy
              </div>
              <div className="text-2xl font-bold" style={{ color: '#10b981' }}>
                {overallStats.averageAccuracy}%
              </div>
              <div className="text-[11px] opacity-60 mt-0.5">
                {formatTimeTyped(overallStats.totalTimeTypedSeconds)} total
              </div>
            </div>
          </div>

          {/* Personal Bests by Mode */}
          {Object.keys(overallStats.bestRecords).length > 0 && (
            <div
              className="p-5 rounded-2xl border shadow-sm"
              style={{ backgroundColor: theme.bg, borderColor: theme.border }}
            >
              <div
                className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2"
                style={{ color: theme.accent }}
              >
                <Award className="w-4 h-4" />
                <span>Personal Bests (by test mode)</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {Object.entries(overallStats.bestRecords).map(([modeName, pbWpm]) => (
                  <div
                    key={modeName}
                    className="p-3 rounded-xl border flex flex-col justify-between"
                    style={{
                      backgroundColor: theme.cardBg,
                      borderColor: theme.border,
                    }}
                  >
                    <span className="text-[11px] capitalize opacity-80 truncate">
                      {modeName}
                    </span>
                    <span
                      className="text-lg font-bold mt-1"
                      style={{ color: theme.primary }}
                    >
                      {pbWpm} <span className="text-xs font-normal">wpm</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Past Tests Log */}
          <div>
            <div
              className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center justify-between"
              style={{ color: theme.textMuted }}
            >
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-400" />
                <span>Recent Tests ({history.length})</span>
              </div>

              {history.length > 0 && !showClearConfirm && (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear History</span>
                </button>
              )}

              {showClearConfirm && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-rose-400 font-semibold">Delete all data?</span>
                  <button
                    onClick={() => {
                      onClearHistory();
                      setShowClearConfirm(false);
                    }}
                    className="px-2.5 py-1 rounded-md bg-rose-500 text-white font-bold text-[10px] cursor-pointer"
                  >
                    Yes, Delete
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="px-2.5 py-1 rounded-md bg-black/20 text-[10px] cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {history.length === 0 ? (
              <div
                className="py-12 text-center text-xs opacity-60 border rounded-2xl"
                style={{ borderColor: theme.border }}
              >
                No tests completed yet. Complete your first typing test!
              </div>
            ) : (
              <div
                className="border rounded-2xl overflow-hidden shadow-sm"
                style={{ borderColor: theme.border }}
              >
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr
                      className="border-b"
                      style={{
                        backgroundColor: theme.bg,
                        borderColor: theme.border,
                      }}
                    >
                      <th className="p-3.5 font-semibold opacity-70">Date</th>
                      <th className="p-3.5 font-semibold opacity-70">Mode</th>
                      <th className="p-3.5 font-semibold opacity-70">Speed</th>
                      <th className="p-3.5 font-semibold opacity-70">Accuracy</th>
                      <th className="p-3.5 font-semibold opacity-70">Consistency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item, idx) => (
                      <tr
                        key={item.id || idx}
                        className="border-b last:border-0 hover:bg-white/5 transition-colors"
                        style={{ borderColor: theme.border }}
                      >
                        <td className="p-3.5 opacity-80 whitespace-nowrap">
                          {formatDate(item.timestamp)}
                        </td>
                        <td className="p-3.5 capitalize opacity-90">
                          {item.modeDescription}
                        </td>
                        <td
                          className="p-3.5 font-bold"
                          style={{ color: theme.primary }}
                        >
                          {item.wpm}{' '}
                          <span className="text-[10px] font-normal opacity-70">
                            ({item.rawWpm} raw)
                          </span>
                        </td>
                        <td
                          className="p-3.5 font-semibold"
                          style={{
                            color: item.accuracy >= 95 ? '#10b981' : theme.accent,
                          }}
                        >
                          {item.accuracy}%
                        </td>
                        <td className="p-3.5 opacity-80">{item.consistency}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div
          className="pt-4 border-t flex justify-end"
          style={{ borderColor: theme.border }}
        >
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all hover:scale-105 shadow-md shadow-indigo-600/20"
            style={{
              backgroundColor: theme.primary,
              color: '#ffffff',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};