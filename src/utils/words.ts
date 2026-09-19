import { QuoteLength, TestSettings } from '../types';

export const COMMON_WORDS_200 = [
  'the', 'be', 'of', 'and', 'a', 'to', 'in', 'he', 'have', 'it', 'that', 'for', 'they', 'I', 'with', 'as', 'not', 'on', 'she',
  'at', 'by', 'this', 'we', 'you', 'do', 'but', 'his', 'from', 'they', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one',
  'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make',
  'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them',
  'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two',
  'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us',
  'water', 'long', 'very', 'great', 'world', 'here', 'life', 'still', 'must', 'place', 'such', 'again', 'few', 'case', 'week',
  'system', 'each', 'right', 'program', 'hear', 'during', 'small', 'number', 'always', 'move', 'night', 'live', 'point', 'believe',
  'hold', 'today', 'bring', 'happen', 'next', 'without', 'before', 'large', 'million', 'must', 'home', 'under', 'read', 'never',
  'start', 'city', 'simple', 'build', 'focus', 'fast', 'speed', 'clear', 'light', 'learn', 'stream', 'pulse', 'power', 'code',
  'brain', 'mind', 'type', 'rapid', 'quick', 'sharp', 'drive', 'flow', 'sense', 'skill', 'pixel', 'shift', 'reach', 'smart'
];

export const FAMOUS_QUOTES: { length: QuoteLength; text: string; author: string }[] = [
  {
    length: 'short',
    text: 'Simplicity is the soul of efficiency.',
    author: 'Austin Freeman',
  },
  {
    length: 'short',
    text: 'First, solve the problem. Then, write the code.',
    author: 'John Johnson',
  },
  {
    length: 'short',
    text: 'Talk is cheap. Show me the code.',
    author: 'Linus Torvalds',
  },
  {
    length: 'short',
    text: 'Premature optimization is the root of all evil.',
    author: 'Donald Knuth',
  },
  {
    length: 'short',
    text: 'Stay hungry, stay foolish.',
    author: 'Steve Jobs',
  },
  {
    length: 'medium',
    text: 'Any fool can write code that a computer can understand. Good programmers write code that humans can understand.',
    author: 'Martin Fowler',
  },
  {
    length: 'medium',
    text: 'The best error message is the one that never shows up because the mistake was impossible to make.',
    author: 'Thomas Fuchs',
  },
  {
    length: 'medium',
    text: 'Continuous effort, not strength or intelligence, is the key to unlocking our potential.',
    author: 'Winston Churchill',
  },
  {
    length: 'medium',
    text: 'It is not that I am so smart, it is just that I stay with problems longer.',
    author: 'Albert Einstein',
  },
  {
    length: 'medium',
    text: 'Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away.',
    author: 'Antoine de Saint-Exupéry',
  },
  {
    length: 'long',
    text: 'The function of good software is to make the complex appear to be simple. We should cultivate a habit of clarity, writing functions that do one thing cleanly and concisely.',
    author: 'Grady Booch',
  },
  {
    length: 'long',
    text: 'The impediment to action advances action. What stands in the way becomes the way. Master your thoughts, focus on the immediate task, and turn obstacles into opportunities.',
    author: 'Marcus Aurelius',
  },
  {
    length: 'long',
    text: 'Most good programmers do programming not because they expect to get paid or get the adulation by the public, but because it is fun to program and create something remarkable out of nothing.',
    author: 'Linus Torvalds',
  },
];

export const PRESET_CUSTOM_TEXTS = [
  {
    title: 'JavaScript Async/Await Pattern',
    category: 'Code',
    text: 'async function fetchTelemetry(url) {\n  try {\n    const response = await fetch(url);\n    if (!response.ok) throw new Error("Network error");\n    const data = await response.json();\n    return data;\n  } catch (err) {\n    console.error("Telemetry failed:", err);\n  }\n}',
  },
  {
    title: 'Python Binary Search Algorithm',
    category: 'Code',
    text: 'def binary_search(arr, target):\n    low, high = 0, len(arr) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1',
  },
