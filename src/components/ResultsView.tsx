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

    // Timeline chart dimensions and calculations
  const timeline = result.timeline || [];
  const maxWpm = Math.max(
    10,
    ...timeline.map((d) => Math.max(d.wpm, d.rawWpm)),
    result.rawWpm,
    result.wpm
  );
  const chartHeight = 160;
  const chartWidth = 600;
  const padding = { top: 20, right: 30, bottom: 25, left: 40 };

  const usableWidth = chartWidth - padding.left - padding.right;
  const usableHeight = chartHeight - padding.top - padding.bottom;

  // Build SVG path points
  const pointsWpm = timeline.map((pt, idx) => {
    const x = padding.left + (idx / Math.max(1, timeline.length - 1)) * usableWidth;
    const y = padding.top + usableHeight - (pt.wpm / maxWpm) * usableHeight;
    return { x, y, pt };
  });

  const pointsRaw = timeline.map((pt, idx) => {
    const x = padding.left + (idx / Math.max(1, timeline.length - 1)) * usableWidth;
    const y = padding.top + usableHeight - (pt.rawWpm / maxWpm) * usableHeight;
    return { x, y, pt };
  });

    const pathWpm =
    pointsWpm.length > 1
      ? `M ${pointsWpm[0].x} ${pointsWpm[0].y} ` +
        pointsWpm.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ')
      : '';

  const pathRaw =
    pointsRaw.length > 1
      ? `M ${pointsRaw[0].x} ${pointsRaw[0].y} ` +
        pointsRaw.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ')
      : '';

  return (
    <div
      id="results-container"
      className="w-full max-w-4xl mx-auto rounded-3xl p-6 sm:p-10 font-mono shadow-2xl backdrop-blur-md"
      style={{
        backgroundColor: theme.cardBg,
        border: `1px solid ${theme.border}`,
        color: theme.text,
      }}
    >
        {/* Top Banner (Personal Best or Test Summary) */}
      <div
        className="flex items-center justify-between flex-wrap gap-3 pb-6 border-b"
        style={{ borderColor: theme.border }}
      >
        <div className="flex items-center gap-3">
          {result.isPersonalBest ? (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold text-sm shadow-md">
              <Trophy className="w-4 h-4" />
              <span>NEW PERSONAL BEST!</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/25 font-semibold text-xs text-indigo-300">
              <Activity className="w-4 h-4 text-indigo-400" />
              <span className="capitalize">{result.modeDescription} Completed</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyResult}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-100 opacity-85 cursor-pointer shadow-sm"
            style={{
              backgroundColor: theme.bg,
              border: `1px solid ${theme.border}`,
              color: theme.text,
            }}
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-indigo-400" />
            )}
            <span>{copied ? 'Copied Card!' : 'Copy Result'}</span>
          </button>
        </div>
      </div>

      {/* Hero Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
        {/* WPM */}
        <div
          className="p-5 rounded-2xl relative overflow-hidden shadow-sm"
          style={{ backgroundColor: theme.bg, border: `1px solid ${theme.border}` }}
        >
          <div
            className="text-[11px] uppercase tracking-widest font-bold opacity-75 mb-1"
            style={{ color: theme.textMuted }}
          >
            Net Speed
          </div>
          <div
            className="text-4xl sm:text-5xl font-black tracking-tight"
            style={{ color: theme.primary }}
          >
            {result.wpm}
          </div>
          <div
            className="text-xs font-bold mt-1 opacity-80"
            style={{ color: theme.primary }}
          >
            WPM
          </div>
        </div>

        {/* Accuracy */}
        <div
          className="p-5 rounded-2xl relative overflow-hidden shadow-sm"
          style={{ backgroundColor: theme.bg, border: `1px solid ${theme.border}` }}
        >
          <div
            className="text-[11px] uppercase tracking-widest font-bold opacity-75 mb-1"
            style={{ color: theme.textMuted }}
          >
            Accuracy
          </div>
          <div
            className="text-4xl sm:text-5xl font-black tracking-tight"
            style={{
              color:
                result.accuracy >= 95
                  ? '#10b981'
                  : result.accuracy >= 85
                  ? theme.accent
                  : '#f43f5e',
            }}
          >
            {result.accuracy}%
          </div>
          <div
            className="text-xs font-medium mt-1 opacity-70"
            style={{ color: theme.textMuted }}
          >
            {result.correctChars}/{result.totalKeystrokes} chars
          </div>
        </div>

        {/* Raw WPM */}
        <div
          className="p-5 rounded-2xl relative overflow-hidden shadow-sm"
          style={{ backgroundColor: theme.bg, border: `1px solid ${theme.border}` }}
        >
          <div
            className="text-[11px] uppercase tracking-widest font-bold opacity-75 mb-1"
            style={{ color: theme.textMuted }}
          >
            Raw Speed
          </div>
          <div
            className="text-3xl sm:text-4xl font-black tracking-tight"
            style={{ color: theme.text }}
          >
            {result.rawWpm}
          </div>
          <div
            className="text-xs font-medium mt-1 opacity-70"
            style={{ color: theme.textMuted }}
          >
            {result.cpm} CPM
          </div>
        </div>

        {/* Consistency */}
        <div
          className="p-5 rounded-2xl relative overflow-hidden shadow-sm"
          style={{ backgroundColor: theme.bg, border: `1px solid ${theme.border}` }}
        >
          <div
            className="text-[11px] uppercase tracking-widest font-bold opacity-75 mb-1"
            style={{ color: theme.textMuted }}
          >
            Consistency
          </div>
          <div
            className="text-3xl sm:text-4xl font-black tracking-tight"
            style={{ color: '#818cf8' }}
          >
            {result.consistency}%
          </div>
          <div
            className="text-xs font-medium mt-1 opacity-70"
            style={{ color: theme.textMuted }}
          >
            time {result.durationSeconds}s
          </div>
        </div>
      </div>

      {/* Speed & Accuracy Timeline Progression Chart */}
      {timeline.length > 1 && (
        <div
          className="my-6 p-5 rounded-2xl shadow-sm"
          style={{ backgroundColor: theme.bg, border: `1px solid ${theme.border}` }}
        >
          <div className="flex items-center justify-between mb-3 text-xs">
            <div className="flex items-center gap-2 font-semibold">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <span>Speed & Telemetry Progression</span>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shadow-sm"
                  style={{ backgroundColor: theme.primary }}
                />
                <span>WPM</span>
              </div>

              <div className="flex items-center gap-1.5 opacity-60">
                <span
                  className="w-2.5 h-0.5 rounded"
                  style={{ backgroundColor: theme.textMuted }}
                />
                <span>Raw WPM</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 shadow-sm" />
                <span>Errors</span>
              </div>
            </div>
          </div>

          {/* SVG Line Chart */}
          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-44 select-none"
            >
              {/* Horizontal Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                const y = padding.top + usableHeight * (1 - pct);
                const val = Math.round(maxWpm * pct);
                return (
                  <g key={i}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={chartWidth - padding.right}
                      y2={y}
                      stroke={theme.border}
                      strokeDasharray="4 4"
                      strokeWidth="1"
                      opacity="0.5"
                    />
                    <text
                      x={padding.left - 6}
                      y={y + 4}
                      fill={theme.textMuted}
                      fontSize="9"
                      textAnchor="end"
                      fontFamily="monospace"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Raw WPM Path */}
              {pathRaw && (
                <path
                  d={pathRaw}
                  fill="none"
                  stroke={theme.textMuted}
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                  opacity="0.6"
                />
              )}

              {/* Net WPM Path */}
              {pathWpm && (
                <path
                  d={pathWpm}
                  fill="none"
                  stroke={theme.primary}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Points & Error Markers */}
              {pointsWpm.map((pt, idx) => (
                <g key={idx}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredPoint === idx ? 5 : 3}
                    fill={theme.primary}
                    className="transition-all cursor-pointer"
                    onMouseEnter={() => setHoveredPoint(idx)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />

                  {pt.pt.errors > 0 && (
                    <circle
                      cx={pt.x}
                      cy={padding.top + usableHeight}
                      r="4"
                      fill="#f43f5e"
                      opacity="0.9"
                    />
                  )}
                </g>
              ))}

              {/* Tooltip */}
              {hoveredPoint !== null && pointsWpm[hoveredPoint] && (
                <g
                  transform={`translate(${pointsWpm[hoveredPoint].x}, ${
                    pointsWpm[hoveredPoint].y - 30
                  })`}
                >
                  <rect
                    x="-45"
                    y="-10"
                    width="90"
                    height="24"
                    rx="4"
                    fill={theme.cardBg}
                    stroke={theme.border}
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y="6"
                    textAnchor="middle"
                    fill={theme.text}
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {pointsWpm[hoveredPoint].pt.wpm} wpm (
                    {pointsWpm[hoveredPoint].pt.second}s)
                  </text>
                </g>
              )}
            </svg>
          </div>
        </div>
      )}

      {/* Character Breakdown & Problem Keys */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
        {/* Character Metrics */}
        <div
          className="p-5 rounded-2xl shadow-sm"
          style={{ backgroundColor: theme.bg, border: `1px solid ${theme.border}` }}
        >
          <div
            className="text-xs font-semibold mb-3 flex items-center justify-between"
            style={{ color: theme.textMuted }}
          >
            <span>CHARACTER BREAKDOWN</span>
            <Target className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-black/20 border border-slate-800">
              <div className="font-bold text-emerald-400 text-lg">
                {result.correctChars}
              </div>
              <div className="opacity-70 text-[10px]">Correct</div>
            </div>
            <div className="p-2.5 rounded-xl bg-black/20 border border-slate-800">
              <div className="font-bold text-rose-400 text-lg">
                {result.incorrectChars}
              </div>
              <div className="opacity-70 text-[10px]">Incorrect</div>
            </div>
            <div className="p-2.5 rounded-xl bg-black/20 border border-slate-800">
              <div className="font-bold text-amber-400 text-lg">
                {result.extraChars}
              </div>
              <div className="opacity-70 text-[10px]">Extra</div>
            </div>
            <div className="p-2.5 rounded-xl bg-black/20 border border-slate-800">
              <div className="font-bold text-slate-400 text-lg">
                {result.missedChars}
              </div>
              <div className="opacity-70 text-[10px]">Missed</div>
            </div>
          </div>
        </div>

        {/* Problem Keys */}
        <div
          className="p-5 rounded-2xl shadow-sm"
          style={{ backgroundColor: theme.bg, border: `1px solid ${theme.border}` }}
        >
          <div
            className="text-xs font-semibold mb-3 flex items-center justify-between"
            style={{ color: theme.textMuted }}
          >
            <span>PROBLEM KEYS (TYPOS)</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          </div>
          {result.problemKeys && result.problemKeys.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {result.problemKeys.map((pk, idx) => (
                <div
                  key={idx}
                  className="px-3 py-1.5 rounded-xl flex items-center gap-2 border shadow-xs"
                  style={{
                    backgroundColor: theme.cardBg,
                    borderColor: theme.border,
                  }}
                >
                  <kbd className="px-2 py-0.5 rounded-md bg-black/40 text-rose-400 font-bold uppercase text-xs border border-rose-500/30">
                    {pk.key === ' ' ? 'SPC' : pk.key}
                  </kbd>
                  <span className="text-[11px] opacity-80">
                    {pk.count} mistake{pk.count > 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
            ) : (
            <div className="text-xs opacity-80 py-3 flex items-center gap-2 text-emerald-400">
              <Check className="w-4 h-4" />
              <span>Flawless accuracy! Zero recurring typo keys detected.</span>
            </div>
          )}
        </div>
      </div>