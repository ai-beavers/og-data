import { MockApiClient } from '@/shared/api/mockClient';
import { campaignFixtures } from '@/testing/fixtures/campaigns';
import { challengeFixtures } from '@/testing/fixtures/challenges';
import { leaderboardFixtures } from '@/testing/fixtures/leaderboard';
import { opportunityFixtures } from '@/testing/fixtures/opportunities';
import { submissionFixtures } from '@/testing/fixtures/submissions';

export type { ApiClient } from '@/shared/api/client';
export { MockApiClient } from '@/shared/api/mockClient';

/**
 * App-wide API instance. Seeded with fixtures so every screen has data from
 * day one. Swap the implementation here when a real backend exists.
 */
export const api = new MockApiClient({
  opportunities: opportunityFixtures,
  submissions: submissionFixtures,
  campaigns: campaignFixtures,
  challenges: challengeFixtures,
  leaderboard: leaderboardFixtures,
});
