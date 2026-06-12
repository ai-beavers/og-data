import type { LeaderboardEntry } from '@/shared/types';

/** Fixture peers before rank/current-user resolution by the API. */
export type LeaderboardSeedEntry = Omit<LeaderboardEntry, 'rank' | 'isCurrentUser'>;

/** Seeded peer contributors so the leaderboard feels alive in the demo (P1). */
export const leaderboardFixtures: LeaderboardSeedEntry[] = [
  { contributorId: 'contributor_maya', displayName: 'Maya K.', acceptedCount: 14 },
  { contributorId: 'contributor_jin', displayName: 'Jin P.', acceptedCount: 11 },
  { contributorId: 'contributor_sol', displayName: 'Sol R.', acceptedCount: 7 },
  { contributorId: 'contributor_ada', displayName: 'Ada T.', acceptedCount: 4 },
  { contributorId: 'contributor_leo', displayName: 'Leo M.', acceptedCount: 2 },
];
