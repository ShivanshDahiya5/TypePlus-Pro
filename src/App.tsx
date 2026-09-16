/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import {
    OverallStats,
    TestResult,
    TestSettings,
    UserPreferences,
} from './types';
import { THEMES } from './utils/themes';
import { generateTestText } from './utils/words';
import {
    clearAllHistory,
    loadHistory,
    loadOverallStats,
    loadPreferences,
    savePreferences,
    saveTestResult,
} from './utils/storage';
import { Header } from './components/Header';
import { ConfigBar } from './components/ConfigBar';
import { LiveStats } from './components/LiveStats';
import { TypingEngine } from './components/TypingEngine';
import { ResultsView } from './components/ResultsView';
import { HistoryModal } from './components/HistoryModal';
import { CustomTextModal } from './components/CustomTextModal';
import { KeyboardVisualizer } from './components/KeyboardVisualizer';

export default function App() {
    // Preferences & Themes
    const [preferences, setPreferences] = useState<UserPreferences>(() => loadPreferences());
    const theme = THEMES[preferences.theme] || THEMES.midnight;

    // History & Lifetime Stats
    const [history, setHistory] = useState<TestResult[]>(() => loadHistory());
    const [overallStats, setOverallStats] = useState<OverallStats>(() => loadOverallStats());

    // Modals
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isCustomTextOpen, setIsCustomTextOpen] = useState(false);

    // Test Settings
    const [settings, setSettings] = useState<TestSettings>({
        mode: 'time',
        timeOption: 30,
        wordOption: 25,
        quoteLength: 'medium',
        punctuation: false,
        numbers: false,
        customText: '',
        customTitle: '',
    });

    const [wordsList, setWordsList] = useState<string[]>([]);
    const [quoteAuthor, setQuoteAuthor] = useState<string | undefined>(undefined);
    const [testSessionKey, setTestSessionKey] = useState<number>(1);

    // Live HUD States
    const [liveStats, setLiveStats] = useState<{
        wpm: number;
        rawWpm: number;
        accuracy: number;
        errorsCount: number;
        timeRemaining?: number;
        currentWordIndex: number;
        totalWords: number;
        isTestActive: boolean;
    }>({
        wpm: 0,
        rawWpm: 0,
        accuracy: 100,
        errorsCount: 0,
        timeRemaining: 30,
        currentWordIndex: 0,
        totalWords: 0,
        isTestActive: false,
    });

    // Result state
    const [currentResult, setCurrentResult] = useState<TestResult | null>(null);

    // Regenerate test text
    const initializeTest = useCallback(
        (customSettings?: Partial<TestSettings>) => {
            const activeSettings = { ...settings, ...customSettings };
            const { words, quoteAuthor: author } = generateTestText(activeSettings);
            setWordsList(words);
            setQuoteAuthor(author);
            setCurrentResult(null);
            setLiveStats({
                wpm: 0,
                rawWpm: 0,
                accuracy: 100,
                errorsCount: 0,
                timeRemaining: activeSettings.mode === 'time' ? activeSettings.timeOption : undefined,
                currentWordIndex: 0,
                totalWords: words.length,
                isTestActive: false,
            });
            setTestSessionKey((k) => k + 1);
        },
        [settings]
    );

    // Initial load
    useEffect(() => {
        initializeTest();
    }, []);

    // Update preferences handler
    const handleUpdatePreferences = (newPrefs: Partial<UserPreferences>) => {
        setPreferences((prev) => {
            const updated = { ...prev, ...newPrefs };
            savePreferences(updated);
            return updated;
        });
    };

    // Update test settings handler
    const handleUpdateSettings = (newSettings: Partial<TestSettings>) => {
        setSettings((prev) => {
            const updated = { ...prev, ...newSettings };
            initializeTest(updated);
            return updated;
        });
    };

    // Test completion handler
    const handleFinishTest = (result: TestResult) => {
        const { updatedHistory, isPersonalBest } = saveTestResult(result);
        setHistory(updatedHistory);
        setOverallStats(loadOverallStats());
        setCurrentResult({ ...result, isPersonalBest });
    };

    // Clear history handler
    const handleClearHistory = () => {
        clearAllHistory();
        setHistory([]);
        setOverallStats(loadOverallStats());
    };

    // Apply custom text
    const handleApplyCustomText = (text: string, title?: string) => {
        const newSettings: Partial<TestSettings> = {
            mode: 'custom',
            customText: text,
            customTitle: title || 'Custom Text',
        };
        setSettings((prev) => ({ ...prev, ...newSettings }));
        initializeTest(newSettings);
    };

    // Repeat same test
    const handleRepeatTest = () => {
        setCurrentResult(null);
        setLiveStats({
            wpm: 0,
            rawWpm: 0,
            accuracy: 100,
            errorsCount: 0,
            timeRemaining: settings.mode === 'time' ? settings.timeOption : undefined,
            currentWordIndex: 0,
            totalWords: wordsList.length,
            isTestActive: false,
        });
        setTestSessionKey((k) => k + 1);
    };

    return (
        <div
            className="min-h-screen w-full flex flex-col justify-between transition-colors duration-150"
            style={{
                backgroundColor: theme.bg,
                color: theme.text,
            }}
        >
            {/* Header Bar */}
            <Header
                theme={theme}
                preferences={preferences}
                onUpdatePreferences={handleUpdatePreferences}
                onOpenHistory={() => setIsHistoryOpen(true)}
                onOpenCustomText={() => setIsCustomTextOpen(true)}
                onResetTest={() => initializeTest()}
            />

            {/* Main Content Area */}
            <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-4 flex flex-col justify-center">
                {!currentResult ? (
                    <div className="w-full">
                        {/* Mode & Configuration Selector */}
                        <ConfigBar
                            theme={theme}
                            settings={settings}
                            isTestActive={liveStats.isTestActive}
                            onUpdateSettings={handleUpdateSettings}
                            onResetTest={() => initializeTest()}
                            onOpenCustomText={() => setIsCustomTextOpen(true)}
                        />

                        {/* Real-time Live Stats HUD */}
                        {preferences.showLiveStats && (
                            <LiveStats
                                theme={theme}
                                wpm={liveStats.wpm}
                                rawWpm={liveStats.rawWpm}
                                accuracy={liveStats.accuracy}
                                errorsCount={liveStats.errorsCount}
                                timeRemaining={liveStats.timeRemaining}
                                totalTime={settings.mode === 'time' ? settings.timeOption : undefined}
                                currentWordIndex={liveStats.currentWordIndex}
                                totalWords={wordsList.length}
                                mode={settings.mode}
                                isTestActive={liveStats.isTestActive}
                            />
                        )}

                        {/* Core Interactive Typing Engine */}
                        <TypingEngine
                            key={testSessionKey}
                            theme={theme}
                            settings={settings}
                            wordsList={wordsList}
                            quoteAuthor={quoteAuthor}
                            soundType={preferences.sound}
                            soundVolume={preferences.soundVolume}
                            caretStyle={preferences.caretStyle}
                            fontSize={preferences.fontSize}
                            blindMode={preferences.blindMode}
                            smoothCaret={preferences.smoothCaret}
                            onFinishTest={handleFinishTest}
                            onLiveUpdate={setLiveStats}
                            onRestart={() => initializeTest()}
                        />

                        {/* Optional Keyboard Visualizer */}
                        {preferences.showKeyboard && <KeyboardVisualizer theme={theme} />}
                    </div>
                ) : (
                    /* Results and Telemetry Analytics Screen */
                    <ResultsView
                        theme={theme}
                        result={currentResult}
                        onNextTest={() => initializeTest()}
                        onRepeatTest={handleRepeatTest}
                        onOpenHistory={() => setIsHistoryOpen(true)}
                    />
                )}
            </main>

            {/* Footer */}
            <footer className="w-full max-w-5xl mx-auto px-4 py-4 text-center text-xs font-mono opacity-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span>TypePulse Engine</span>
                    <span>•</span>
                    <span>Zero-Latency Audio</span>
                </div>
                <div className="flex items-center gap-3">
                    <span>Tab + Enter to restart</span>
                </div>
            </footer>

            {/* Modals */}
            <HistoryModal
                theme={theme}
                isOpen={isHistoryOpen}
                history={history}
                overallStats={overallStats}
                onClose={() => setIsHistoryOpen(false)}
                onClearHistory={handleClearHistory}
            />

            <CustomTextModal
                theme={theme}
                isOpen={isCustomTextOpen}
                currentCustomText={settings.customText}
                onClose={() => setIsCustomTextOpen(false)}
                onApplyCustomText={handleApplyCustomText}
            />
        </div>
    );
}
