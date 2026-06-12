import { MockApiClient } from '@/shared/api/mockClient';
import { campaignFixtures } from '@/testing/fixtures/campaigns';
import { challengeFixtures } from '@/testing/fixtures/challenges';
import { leaderboardFixtures } from '@/testing/fixtures/leaderboard';
import { opportunityFixtures } from '@/testing/fixtures/opportunities';

export type { ApiClient } from '@/shared/api/client';
export { MockApiClient } from '@/shared/api/mockClient';

/**
 * App-wide API instance. Seeded with task/game/campaign fixtures only — demo
 * submissions confused real testing (a fixture fire hydrant "rejected: duplicate"
 * looked like the user's own capture being rejected). Submission fixtures remain
 * in use by unit tests. Swap the implementation here when a real backend exists.
 */
export const api = new MockApiClient({
  opportunities: opportunityFixtures,
  campaigns: campaignFixtures,
  challenges: challengeFixtures,
  leaderboard: leaderboardFixtures,
});
