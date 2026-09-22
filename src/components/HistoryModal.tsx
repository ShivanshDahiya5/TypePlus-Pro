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
