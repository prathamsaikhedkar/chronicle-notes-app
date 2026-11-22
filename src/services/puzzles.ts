export interface PuzzleChallenge {
  id: string;
  question: string;
  hint: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export const PUZZLE_BANK: PuzzleChallenge[] = [
  {
    id: 'p1',
    question: 'Solve the sequence: 2, 6, 12, 20, 30, ?',
    hint: 'Look at the difference added between consecutive numbers (+4, +6, +8, +10...)',
    options: ['40', '42', '44', '36'],
    correctAnswer: '42',
    explanation: '30 + 12 = 42'
  },
  {
    id: 'p2',
    question: 'I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?',
    hint: 'You hear me in mountains or empty canyon caves.',
    options: ['A Shadow', 'An Echo', 'A Cloud', 'A Whisper'],
    correctAnswer: 'An Echo',
    explanation: 'An echo responds when sound waves bounce off barriers.'
  },
  {
    id: 'p3',
    question: 'What mathematical constant is approximately equal to 2.71828?',
    hint: 'Base of natural logarithms, named after Leonhard Euler.',
    options: ['Pi (π)', 'Euler’s number (e)', 'Golden Ratio (φ)', 'Square root of 2'],
    correctAnswer: 'Euler’s number (e)',
    explanation: 'e ≈ 2.71828 is Euler’s constant.'
  },
  {
    id: 'p4',
    question: 'If a clock shows 3:15, what is the angle between the hour hand and the minute hand?',
    hint: 'The minute hand is at 90°, but the hour hand has moved 1/4 of an hour past 3.',
    options: ['0°', '7.5°', '15°', '22.5°'],
    correctAnswer: '7.5°',
    explanation: 'Hour hand moves 30° per hour (0.5° per minute). At 15 min, it moves 7.5° past the 3.'
  },
  {
    id: 'p5',
    question: 'Binary Check: What is the decimal value of binary 10110?',
    hint: '16 + 0 + 4 + 2 + 0',
    options: ['20', '22', '24', '18'],
    correctAnswer: '22',
    explanation: '16 + 4 + 2 = 22'
  }
];

export function getRandomPuzzle(): PuzzleChallenge {
  const index = Math.floor(Math.random() * PUZZLE_BANK.length);
  return PUZZLE_BANK[index];
}

// Fixed standard verification token used by emergency puzzle derivation
export const EMERGENCY_RESCUE_TOKEN = 'SHADOW_RECOVERY_PUZZLE_TOKEN_2026';
