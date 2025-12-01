import { Chapter } from './types';

export const COURSE_CURRICULUM: Chapter[] = [
  {
    id: 'c1',
    title: 'Market Structure Basics',
    description: 'Understanding Higher Highs, Higher Lows, and Trend identification.',
    duration: '15 min',
    isLocked: false,
    prerequisiteIds: [],
    videoUrl: 'https://www.youtube.com/embed/dummy-video-1', // Replace with real ID
    slidesUrl: '#'
  },
  {
    id: 'c2',
    title: 'Support & Resistance',
    description: 'Identifying key levels, zones, and psychological price points.',
    duration: '20 min',
    isLocked: false,
    prerequisiteIds: ['c1'],
    videoUrl: 'https://www.youtube.com/embed/dummy-video-2',
    slidesUrl: '#'
  },
  {
    id: 'c3',
    title: 'Candlestick Patterns',
    description: 'Mastering pinbars, engulfing candles, and rejection wicks.',
    duration: '25 min',
    isLocked: false,
    prerequisiteIds: ['c2'],
    videoUrl: '', // Example of no video
    slidesUrl: '#'
  },
  {
    id: 'c4',
    title: 'Risk Management 101',
    description: 'The holy grail of trading. Calculating lot size and R:R ratio.',
    duration: '30 min',
    isLocked: false,
    prerequisiteIds: ['c3'],
    videoUrl: 'https://www.youtube.com/embed/dummy-video-3'
  },
  {
    id: 'c5',
    title: 'Supply & Demand',
    description: 'Advanced institutional concepts and order blocks.',
    duration: '45 min',
    isLocked: false,
    prerequisiteIds: ['c4']
  },
  {
    id: 'c6',
    title: 'Trading Psychology',
    description: 'Managing emotions, FOMO, and revenge trading.',
    duration: '20 min',
    isLocked: false,
    prerequisiteIds: ['c5']
  }
];