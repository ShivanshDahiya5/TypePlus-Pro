import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import {
  CaretStyle,
  FontSize,
  SecondSnapshot,
  SoundType,
  TestResult,
  TestSettings,
  ThemeConfig,
  WordState,
} from '../types';
import { playKeySound, playCompletionSound } from '../utils/audio';
import { MousePointer, Keyboard, RotateCcw, Sparkles } from 'lucide-react';