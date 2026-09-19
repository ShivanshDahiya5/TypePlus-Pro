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