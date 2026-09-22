import React, { useState } from 'react';
import {
  Keyboard,
  BarChart3,
  Volume2,
  VolumeX,
  Palette,
  Settings,
  FileText,
  Sparkles,
  Check,
  Zap,
} from 'lucide-react';
import { ThemeConfig, ThemeId, UserPreferences } from '../types';
import { THEMES } from '../utils/themes';

interface HeaderProps {
  theme: ThemeConfig;
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: Partial<UserPreferences>) => void;
  onOpenHistory: () => void;
  onOpenCustomText: () => void;
  onResetTest: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  preferences,
  onUpdatePreferences,
  onOpenHistory,
  onOpenCustomText,
  onResetTest,
}) => {
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const toggleSound = () => {
    const nextSound = preferences.sound === 'off' ? 'mechanical' : 'off';
    onUpdatePreferences({ sound: nextSound });
  };

  return (
    <header className="w-full max-w-5xl mx-auto px-4 py-4 flex items-center justify-between transition-colors border-b" style={{ borderColor: theme.border }}>
      {/* Brand title */}
      <div className="flex items-center gap-3">
        <button
          id="btn-brand-home"
          onClick={onResetTest}
          className="flex items-center gap-3 group cursor-pointer text-left focus:outline-none"
          title="Restart Test"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-105 shadow-lg"
            style={{ backgroundColor: theme.primary, color: '#ffffff' }}
          >
            <Keyboard className="w-5 h-5 stroke-[2.2]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight font-sans" style={{ color: theme.text }}>
                TypePulse
              </span>
              <span
                className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full tracking-wider font-mono border"
                style={{
                  backgroundColor: theme.primaryLight,
                  color: theme.primary,
                  borderColor: `${theme.primary}40`,
                }}
              >
                PRO
              </span>
            </div>
            <p className="text-xs font-mono hidden sm:block opacity-65" style={{ color: theme.textMuted }}>
              zero-latency speed & telemetry
            </p>
          </div>
        </button>
      </div>

      {/* Action controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Custom Text Button */}
        <button
          id="btn-custom-text"
          onClick={onOpenCustomText}
          className="px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-all hover:opacity-100 opacity-80 cursor-pointer"
          style={{
            backgroundColor: theme.cardBg,
            color: theme.text,
            border: `1px solid ${theme.border}`,
          }}
          title="Custom Text & Quotes"
        >
          <FileText className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Custom</span>
        </button>

        {/* History / Stats Button */}
        <button
          id="btn-history-stats"
          onClick={onOpenHistory}
          className="px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-all hover:opacity-100 opacity-80 
          cursor-pointer"
          style={{
            backgroundColor: theme.cardBg,
            color: theme.text,
            border: `1px solid ${theme.border}`,
          }}
          title="View Performance History & Charts"
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Stats</span>
        </button>

        {/* Quick Sound Toggle */}
        <button
          id="btn-sound-toggle"
          onClick={toggleSound}
          className="p-2 rounded-lg text-xs font-mono transition-all hover:opacity-100 opacity-80 cursor-pointer"
          style={{
            backgroundColor: theme.cardBg,
            color: preferences.sound !== 'off' ? theme.primary : theme.textMuted,
            border: `1px solid ${theme.border}`,
          }}
          title={preferences.sound !== 'off' ? `Sound: ${preferences.sound}` : 'Sound Muted'}
        >
          {preferences.sound !== 'off' ? (
            <Volume2 className="w-4 h-4" />
          ) : (
            <VolumeX className="w-4 h-4" />
          )}
        </button>

        {/* Theme Picker Dropdown */}
        <div className="relative">
          <button
            id="btn-theme-picker"
            onClick={() => {
              setIsThemeOpen(!isThemeOpen);
              setIsSettingsOpen(false);
            }}
            className="p-2 rounded-lg text-xs font-mono transition-all hover:opacity-100 opacity-80 cursor-pointer"
            style={{
              backgroundColor: theme.cardBg,
              color: theme.text,
              border: `1px solid ${theme.border}`,
            }}
            title="Change Visual Theme"
          >
            <Palette className="w-4 h-4" />
          </button>

          {isThemeOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsThemeOpen(false)}
              />
                <div
                className="absolute right-0 mt-2 w-56 p-2 rounded-xl shadow-2xl z-50 border backdrop-blur-md"
                style={{
                  backgroundColor: theme.cardBg,
                  borderColor: theme.border,
                  color: theme.text,
                }}
              >
                <div className="px-2 py-1.5 text-[11px] font-mono uppercase font-semibold tracking-wider flex items-center justify-between opacity-70" style={{ color: theme.textMuted }}>
                  <span>Theme Colorway</span>
                  <Sparkles className="w-3 h-3 text-amber-400" />
                </div>
                <div className="mt-1 space-y-1">
                  {(Object.keys(THEMES) as ThemeId[]).map((themeKey) => {
                    const th = THEMES[themeKey];
                    const isSelected = preferences.theme === themeKey;
                    return (
                      <button
                        key={themeKey}
                        onClick={() => {
                          onUpdatePreferences({ theme: themeKey });
                          setIsThemeOpen(false);
                        }}
                      className="w-full px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center justify-between transition-colors hover:opacity-100 cursor-pointer"
                        style={{
                          backgroundColor: isSelected ? theme.primaryLight : 'transparent',
                          color: isSelected ? theme.primary : theme.text,
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full border border-black/20"
                            style={{ backgroundColor: th.primary }}
                          />
                          <span>{th.name}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Quick Settings Dropdown */}
        <div className="relative">
          <button
            id="btn-quick-settings"
            onClick={() => {
              setIsSettingsOpen(!isSettingsOpen);
              setIsThemeOpen(false);
            }}
            className="p-2 rounded-lg text-xs font-mono transition-all hover:opacity-100 opacity-80 cursor-pointer"
            style={{
              backgroundColor: theme.cardBg,
              color: theme.text,
              border: `1px solid ${theme.border}`,
            }}
            title="Typing Preferences & Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {isSettingsOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsSettingsOpen(false)}
              />
              <div
                className="absolute right-0 mt-2 w-72 p-4 rounded-xl shadow-2xl z-50 border backdrop-blur-md text-xs font-mono"
                style={{
                  backgroundColor: theme.cardBg,
                  borderColor: theme.border,
                  color: theme.text,
                }}
              >
                <div className="font-semibold text-sm mb-3 flex items-center justify-between border-b pb-2" style={{ borderColor: theme.border }}>
                  <span>Typing Preferences</span>
                  <Zap className="w-3.5 h-3.5" style={{ color: theme.primary }} />
                </div>

                {/* Sound effect selector */}
                <div className="space-y-1.5 mb-3.5">
                  <div className="flex justify-between items-center text-[11px] opacity-80">
                    <span>Keypress Audio</span>
                    <span className="capitalize">{preferences.sound}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {(['off', 'mechanical', 'click', 'beep', 'typewriter'] as const).map((snd) => (
                      <button
                        key={snd}
                        onClick={() => onUpdatePreferences({ sound: snd })}
                        className="py-1 px-1.5 rounded text-[11px] font-mono capitalize transition-colors text-center cursor-pointer truncate"
                        style={{
                          backgroundColor: preferences.sound === snd ? theme.primaryLight : 'transparent',
                          color: preferences.sound === snd ? theme.primary : theme.textMuted,
                          border: `1px solid ${preferences.sound === snd ? theme.primary : theme.border}`,
                        }}
                      >
                        {snd}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Caret Style */}
                <div className="space-y-1.5 mb-3.5">
                  <div className="flex justify-between items-center text-[11px] opacity-80">
                    <span>Caret Style</span>
                    <span className="capitalize">{preferences.caretStyle}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {(['line', 'block', 'underline', 'off'] as const).map((style) => (
                      <button
                        key={style}
                        onClick={() => onUpdatePreferences({ caretStyle: style })}
                        className="py-1 px-1.5 rounded text-[11px] font-mono capitalize transition-colors text-center cursor-pointer"
                        style={{
                          backgroundColor: preferences.caretStyle === style ? theme.primaryLight : 'transparent',
                          color: preferences.caretStyle === style ? theme.primary : theme.textMuted,
                          border: `1px solid ${preferences.caretStyle === style ? theme.primary : theme.border}`,
                        }}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Size */}
                <div className="space-y-1.5 mb-3.5">
                  <div className="flex justify-between items-center text-[11px] opacity-80">
                    <span>Font Size</span>
                    <span className="capitalize">{preferences.fontSize}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {(['small', 'medium', 'large'] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => onUpdatePreferences({ fontSize: size })}
                        className="py-1 px-1.5 rounded text-[11px] font-mono capitalize transition-colors text-center cursor-pointer"
                        style={{
                          backgroundColor: preferences.fontSize === size ? theme.primaryLight : 'transparent',
                          color: preferences.fontSize === size ? theme.primary : theme.textMuted,
                          border: `1px solid ${preferences.fontSize === size ? theme.primary : theme.border}`,
                        }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>