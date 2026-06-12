import { MockApiClient } from '@/shared/api/mockClient';
import { opportunityFixtures } from '@/testing/fixtures/opportunities';

export type { ApiClient } from '@/shared/api/client';
export { MockApiClient } from '@/shared/api/mockClient';

/**
 * App-wide API instance. Seeded with task fixtures only — demo submissions
 * confused real testing (a fixture fire hydrant "rejected: duplicate" looked
 * like the user's own capture being rejected). Submission fixtures remain in
 * use by unit tests. Swap the implementation here when a real backend exists.
 */
export const api = new MockApiClient({
  opportunities: opportunityFixtures,
});
