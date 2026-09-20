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

export const ConfigBar: React.FC<ConfigBarProps> = ({
  theme,
  settings,
  isTestActive,
  onUpdateSettings,
  onResetTest,
  onOpenCustomText,
}) => {
  return (
    <div
      className={`w-full max-w-4xl mx-auto mb-6 px-4 py-2.5 rounded-2xl backdrop-blur-sm transition-all duration-200 flex flex-wrap items-center justify-between gap-3 text-xs font-mono select-none shadow-sm ${
        isTestActive ? 'opacity-30 hover:opacity-100 pointer-events-auto' : 'opacity-100'
      }`}
      style={{
        backgroundColor: theme.cardBg,
        border: `1px solid ${theme.border}`,
        color: theme.textMuted,
      }}
    >
        {/* Left group: Modes */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Mode items */}
        <div className="flex items-center bg-black/20 p-1 rounded-xl gap-1 border" style={{ borderColor: theme.border }}>
          <button
            id="mode-time"
            onClick={() => onUpdateSettings({ mode: 'time' })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-150 cursor-pointer"
            style={{
              backgroundColor: settings.mode === 'time' ? theme.primary : 'transparent',
              color: settings.mode === 'time' ? '#ffffff' : theme.textMuted,
              fontWeight: settings.mode === 'time' ? 600 : 400,
              boxShadow: settings.mode === 'time' ? `0 2px 8px ${theme.primary}40` : 'none',
            }}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Time</span>
          </button>

          <button
            id="mode-words"
            onClick={() => onUpdateSettings({ mode: 'words' })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-150 cursor-pointer"
            style={{
              backgroundColor: settings.mode === 'words' ? theme.primary : 'transparent',
              color: settings.mode === 'words' ? '#ffffff' : theme.textMuted,
              fontWeight: settings.mode === 'words' ? 600 : 400,
              boxShadow: settings.mode === 'words' ? `0 2px 8px ${theme.primary}40` : 'none',
            }}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Words</span>
          </button>

          <button
            id="mode-quote"
            onClick={() => onUpdateSettings({ mode: 'quote' })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-150 cursor-pointer"
            style={{
              backgroundColor: settings.mode === 'quote' ? theme.primary : 'transparent',
              color: settings.mode === 'quote' ? '#ffffff' : theme.textMuted,
              fontWeight: settings.mode === 'quote' ? 600 : 400,
              boxShadow: settings.mode === 'quote' ? `0 2px 8px ${theme.primary}40` : 'none',
            }}
          >
            <QuoteIcon className="w-3.5 h-3.5" />
            <span>Quote</span>
          </button>

          <button
            id="mode-custom"
            onClick={() => {
              if (settings.mode !== 'custom') {
                onUpdateSettings({ mode: 'custom' });
              }
              if (!settings.customText) {
                onOpenCustomText();
              }
            }}
             className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-150 cursor-pointer"
            style={{
              backgroundColor: settings.mode === 'custom' ? theme.primary : 'transparent',
              color: settings.mode === 'custom' ? '#ffffff' : theme.textMuted,
              fontWeight: settings.mode === 'custom' ? 600 : 400,
              boxShadow: settings.mode === 'custom' ? `0 2px 8px ${theme.primary}40` : 'none',
            }}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Custom</span>
          </button>
        </div>

        {/* Vertical divider */}
        <div className="h-5 w-[1px] mx-1 opacity-50" style={{ backgroundColor: theme.border }} />

        {/* Sub options per mode */}
        {settings.mode === 'time' && (
          <div className="flex items-center gap-1">
            {([15, 30, 60, 120] as TimeOption[]).map((time) => (
              <button
                key={time}
                onClick={() => onUpdateSettings({ timeOption: time })}
                className="px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                style={{
                  color: settings.timeOption === time ? theme.primary : theme.textMuted,
                  fontWeight: settings.timeOption === time ? 700 : 400,
                  backgroundColor: settings.timeOption === time ? theme.primaryLight : 'transparent',
                }}
              >
                {time}s
              </button>
            ))}
          </div>
        )}