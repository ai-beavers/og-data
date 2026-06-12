/**
 * M2 — Onboarding content. Written for non-technical contributors:
 * what the app is, what gets captured, the rules, and how earning works.
 */

export interface OnboardingStep {
  title: string;
  intro: string;
  bullets: string[];
  footnote?: string;
}

export const onboardingSteps: OnboardingStep[] = [
  {
    title: 'Turn idle moments into earnings',
    intro:
      'Companies building robots and AI need photos of real-world objects. You capture them with your phone — and get paid for every accepted capture.',
    bullets: [
      'Pick a capture task near you, like a fire hydrant or a park bench.',
      'Every task shows its reward range up front.',
      'Each capture takes a couple of minutes — perfect while you wait.',
    ],
  },
  {
    title: 'Capture rules',
    intro: 'A few simple rules keep captures useful and everyone safe.',
    bullets: [
      'Do: capture from multiple angles, in good light, filling the frame.',
      'Do: stay in public places or places you are allowed to be.',
      'Don\u2019t: include people\u2019s faces, license plates, or screens.',
      'Don\u2019t: capture inside private property without permission.',
    ],
    footnote: 'Captures that break these rules are rejected and earn nothing.',
  },
  {
    title: 'How it works',
    intro: 'The whole loop is five small steps.',
    bullets: [
      '1. Find a task nearby.',
      '2. Capture it well — the app guides every shot.',
      '3. Submit when it looks good.',
      '4. A reviewer checks it and sends feedback.',
      '5. Accepted captures add to your earnings.',
    ],
    footnote: 'If a capture needs another try, you\u2019ll see exactly why.',
  },
];
