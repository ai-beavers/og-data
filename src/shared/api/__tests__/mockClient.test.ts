import { MockApiClient } from '@/shared/api/mockClient';
import type { NewSubmissionInput } from '@/shared/types';
import { opportunityFixtures } from '@/testing/fixtures/opportunities';
import {
  FIXTURE_CONTRIBUTOR_ID,
  submissionFixtures,
} from '@/testing/fixtures/submissions';

/**
 * Exercises the full contract both machines build against:
 * list opportunities → submit → review → earnings.
 */
describe('MockApiClient', () => {
  const newSubmission: NewSubmissionInput = {
    opportunityId: 'opp_fire_hydrant',
    contributorId: FIXTURE_CONTRIBUTOR_ID,
    media: [
      { id: 'm_new', uri: 'fixture://new.jpg', kind: 'photo', capturedAt: '2026-06-11T10:00:00Z' },
    ],
    category: 'street_infrastructure',
  };

  function seededClient() {
    return new MockApiClient({
      opportunities: opportunityFixtures,
      submissions: submissionFixtures.map((s) => ({ ...s })),
    });
  }

  it('lists seeded opportunities', async () => {
    const api = seededClient();
    const opportunities = await api.listOpportunities();
    expect(opportunities.length).toBeGreaterThan(0);
    expect(opportunities[0]).toHaveProperty('capturePrompts');
  });

  it('creates submissions in pending_review and surfaces them in the queue', async () => {
    const api = seededClient();
    const submission = await api.createSubmission(newSubmission);
    expect(submission.status).toBe('pending_review');

    const queue = await api.listReviewQueue();
    expect(queue.map((s) => s.id)).toContain(submission.id);
  });

  it('accepting a submission assigns a pending reward counted in earnings', async () => {
    const api = seededClient();
    const submission = await api.createSubmission(newSubmission);

    const reviewed = await api.reviewSubmission(submission.id, {
      outcome: 'accept',
      reward: { cents: 120, currency: 'USD' },
    });
    expect(reviewed.status).toBe('accepted');
    expect(reviewed.reward?.status).toBe('pending');

    const earnings = await api.getEarnings(FIXTURE_CONTRIBUTOR_ID);
    const fixtureAccepted = 90; // sub_fixture_accepted seed reward
    expect(earnings.totalEarned.cents).toBe(fixtureAccepted + 120);
    expect(earnings.pending.cents).toBe(fixtureAccepted + 120);
  });

  it('needs_retry and reject carry plain-language reasons', async () => {
    const api = seededClient();
    const submission = await api.createSubmission(newSubmission);

    const retried = await api.reviewSubmission(submission.id, {
      outcome: 'needs_retry',
      reason: 'missing_angles',
      reviewNote: 'Please add a shot of the back.',
    });
    expect(retried.status).toBe('needs_retry');
    expect(retried.rejectionReason).toBe('missing_angles');

    const rejected = await api.reviewSubmission(submission.id, {
      outcome: 'reject',
      reason: 'duplicate',
    });
    expect(rejected.status).toBe('rejected');
    expect(rejected.rejectionReason).toBe('duplicate');
  });
});
