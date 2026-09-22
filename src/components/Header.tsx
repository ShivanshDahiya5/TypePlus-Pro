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