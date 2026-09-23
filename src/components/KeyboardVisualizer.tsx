import React, { useEffect, useState } from 'react';
import { ThemeConfig } from '../types';

interface KeyboardVisualizerProps {
  theme: ThemeConfig;
}

const KEYBOARD_ROWS = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'backspace'],
  ['tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
  ['caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'enter'],
  ['shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'shift'],
  ['space'],
];

export const KeyboardVisualizer: React.FC<KeyboardVisualizerProps> = ({ theme }) => {
  const [activeKey, setActiveKey] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let key = e.key.toLowerCase();
      if (key === ' ') key = 'space';
      if (key === 'escape') key = 'esc';
      setActiveKey(key);
    };

    const handleKeyUp = () => {
      setActiveKey(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div
      className="w-full max-w-2xl mx-auto mt-5 p-4 rounded-2xl border select-none font-mono text-[11px] shadow-lg backdrop-blur-md"
      style={{