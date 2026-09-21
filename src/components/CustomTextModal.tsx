import React, { useState } from 'react';
import { X, FileText, BookOpen, Check } from 'lucide-react';
import { PRESET_CUSTOM_TEXTS } from '../utils/words';
import { ThemeConfig } from '../types';

interface CustomTextModalProps {
  theme: ThemeConfig;
  isOpen: boolean;
  currentCustomText: string;
  onClose: () => void;
  onApplyCustomText: (text: string, title?: string) => void;
}

export const CustomTextModal: React.FC<CustomTextModalProps> = ({
  theme,
  isOpen,
  currentCustomText,
  onClose,
  onApplyCustomText,
}) => {
  const [textInput, setTextInput] = useState(currentCustomText || '');
  const [titleInput, setTitleInput] = useState('');

  if (!isOpen) return null;

  const wordCount = textInput.trim() ? textInput.trim().split(/\s+/).length : 0;
  const charCount = textInput.length;

  const handleApply = () => {
    if (!textInput.trim()) return;
    onApplyCustomText(textInput.trim(), titleInput.trim() || 'Custom Text');
    onClose();
  };

  const handleSelectPreset = (preset: (typeof PRESET_CUSTOM_TEXTS)[0]) => {
    setTextInput(preset.text);
    setTitleInput(preset.title);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/70 font-mono">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col overflow-hidden border backdrop-blur-xl"
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
              <FileText className="w-5 h-5" />
            </div>