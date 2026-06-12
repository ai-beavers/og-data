import type { Challenge } from '@/shared/types';

/** Seeded time-boxed capture goals (P1). Bonus is display-only until P5. */
export const challengeFixtures: Challenge[] = [
  {
    id: 'ch_three_this_week',
    title: 'Three this week',
    description: 'Capture and submit 3 tasks this week — any category counts.',
    goalCount: 3,
    startsAt: '2026-06-08T00:00:00Z',
    endsAt: '2026-06-14T23:59:59Z',
    bonusLabel: '+$0.50 bonus',
  },
  {
    id: 'ch_street_month',
    title: 'Street sweeper',
    description: 'Submit 5 street infrastructure captures this month.',
    category: 'street_infrastructure',
    goalCount: 5,
    startsAt: '2026-06-01T00:00:00Z',
    endsAt: '2026-06-30T23:59:59Z',
    bonusLabel: '+$1.00 bonus',
  },
];
