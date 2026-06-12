import { campaignOpportunityId } from '@/features/campaigns/campaignLogic';
import { MockApiClient } from '@/shared/api/mockClient';
import type { NewCampaignInput, NewSubmissionInput } from '@/shared/types';
import { campaignFixtures } from '@/testing/fixtures/campaigns';
import { challengeFixtures } from '@/testing/fixtures/challenges';
import { leaderboardFixtures } from '@/testing/fixtures/leaderboard';
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
      campaigns: campaignFixtures.map((c) => ({ ...c })),
      challenges: challengeFixtures,
      leaderboard: leaderboardFixtures,
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

  // --- Post-MVP P2: campaigns --------------------------------------------

  const newCampaign: NewCampaignInput = {
    name: 'Capture bike racks',
    requester: 'CityScan',
    description: 'Public bike racks, empty or in use.',
    category: 'street_infrastructure',
    environments: ['outdoors'],
    captureDepth: 'quick',
    qualityExpectations: ['the full rack is in frame'],
    rewardRange: { min: { cents: 40, currency: 'USD' }, max: { cents: 100, currency: 'USD' } },
    targetAcceptedCount: 1,
  };

  it('surfaces active campaigns as contributor opportunities', async () => {
    const api = seededClient();
    const opportunities = await api.listOpportunities();
    const ids = opportunities.map((o) => o.id);
    for (const campaign of campaignFixtures) {
      expect(ids).toContain(campaignOpportunityId(campaign.id));
    }
    // Derived opportunities resolve by id, so the capture flow just works.
    const derived = await api.getOpportunity(campaignOpportunityId(campaignFixtures[0].id));
    expect(derived?.title).toBe(campaignFixtures[0].name);
  });

  it('creates campaigns as active and tracks fulfilment progress', async () => {
    const api = seededClient();
    const campaign = await api.createCampaign(newCampaign);
    expect(campaign.status).toBe('active');

    const submission = await api.createSubmission({
      ...newSubmission,
      opportunityId: campaignOpportunityId(campaign.id),
    });
    let progress = await api.getCampaignProgress(campaign.id);
    expect(progress).toMatchObject({ submittedCount: 1, acceptedCount: 0, remainingCount: 1 });

    await api.reviewSubmission(submission.id, {
      outcome: 'accept',
      reward: { cents: 80, currency: 'USD' },
    });
    progress = await api.getCampaignProgress(campaign.id);
    expect(progress).toMatchObject({ acceptedCount: 1, remainingCount: 0 });

    // Target reached → campaign completes and leaves the contributor list.
    const campaigns = await api.listCampaigns();
    expect(campaigns.find((c) => c.id === campaign.id)?.status).toBe('completed');
    const opportunityIds = (await api.listOpportunities()).map((o) => o.id);
    expect(opportunityIds).not.toContain(campaignOpportunityId(campaign.id));
  });

  // --- Post-MVP P1: game layer -------------------------------------------

  it('computes contributor progress from submission history', async () => {
    const api = seededClient();
    const progress = await api.getContributorProgress(FIXTURE_CONTRIBUTOR_ID);
    expect(progress.acceptedCount).toBe(1); // sub_fixture_accepted seed
    expect(progress.level).toBe(1);
    expect(progress.nextLevelAcceptedCount).toBe(3);
    expect(progress.badges.map((b) => b.id)).toContain('first_find');
  });

  it('ranks the contributor among fixture peers on the leaderboard', async () => {
    const api = seededClient();
    const leaderboard = await api.getLeaderboard(FIXTURE_CONTRIBUTOR_ID);
    expect(leaderboard.map((e) => e.rank)).toEqual(
      leaderboard.map((_, index) => index + 1),
    );
    const me = leaderboard.find((e) => e.isCurrentUser);
    expect(me).toBeDefined();
    expect(me?.acceptedCount).toBe(1);
  });
});
