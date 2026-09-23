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
                backgroundColor: theme.cardBg,
                borderColor: theme.border,
            }}
        >
            <div className="flex flex-col gap-1.5 items-center">
                {KEYBOARD_ROWS.map((row, rIdx) => (
                    <div key={rIdx} className="flex gap-1.5 justify-center w-full">
                        {row.map((k, kIdx) => {
                            const isActive =
                                activeKey === k || (k === 'space' && activeKey === ' ');
                            let widthClass = 'w-7 sm:w-8.5 h-7 sm:h-8.5';
                            if (
                                k === 'backspace' ||
                                k === 'tab' ||
                                k === 'caps' ||
                                k === 'enter'
                            ) {
                                widthClass = 'w-12 sm:w-14 h-7 sm:h-8.5 text-[9px] uppercase';
                            } else if (k === 'shift') {
                                widthClass = 'w-14 sm:w-16 h-7 sm:h-8.5 text-[9px] uppercase';
                            } else if (k === 'space') {
                                widthClass = 'w-48 sm:w-64 h-7 sm:h-8.5 text-[9px] uppercase';
                            }

                            return (
                                <div
                                    key={kIdx}
                                    className={`flex items-center justify-center rounded-lg border font-semibold shadow-xs transition-transform duration-75 ${widthClass}`}
                                    style={{
                                        backgroundColor: isActive ? theme.primary : theme.bg,
                                        borderColor: isActive ? theme.primary : theme.border,
                                        color: isActive ? '#ffffff' : theme.textMuted,
                                        transform: isActive ? 'scale(0.92)' : 'scale(1)',
                                        boxShadow: isActive ? `0 0 12px ${theme.primary}` : 'none',
                                    }}
                                >
                                    {k}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};