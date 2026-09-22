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
