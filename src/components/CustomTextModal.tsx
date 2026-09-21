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
            <div>
              <h2 className="text-lg font-bold">Custom Practice Text</h2>
              <p className="text-xs opacity-70" style={{ color: theme.textMuted }}>
                Paste your own code, essays, or select curated presets
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* Presets List */}
          <div>
            <div
              className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5 opacity-80"
              style={{ color: theme.textMuted }}
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>Curated Presets</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PRESET_CUSTOM_TEXTS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPreset(preset)}
                  className="p-3 rounded-2xl border text-left transition-all hover:scale-[1.01] hover:border-indigo-500/50 cursor-pointer group shadow-sm"
                  style={{
                    backgroundColor: theme.bg,
                    borderColor: theme.border,
                  }}
                >
                    <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="group-hover:text-indigo-400 transition-colors">
                      {preset.title}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-black/30 border border-slate-800 text-slate-400">
                      {preset.category}
                    </span>
                  </div>
                  <p className="text-[11px] opacity-60 mt-1 line-clamp-2 leading-tight">
                    {preset.text}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Text Area */}
          <div>
            <div
              className="flex items-center justify-between text-xs mb-2 font-semibold"
              style={{ color: theme.textMuted }}
            >
              <span>PASTE OR WRITE TEXT</span>
              <span className="text-[11px] opacity-70">
                {wordCount} words / {charCount} characters
              </span>
            </div>