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