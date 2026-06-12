import type { Submission } from '@/shared/types';

export const FIXTURE_CONTRIBUTOR_ID = 'contributor_demo';

const usd = (cents: number) => ({ cents, currency: 'USD' as const });

/**
 * Fixture submissions in every lifecycle state so Machine B can build the
 * submission history, review queue, and earnings screens without waiting on
 * the capture flow.
 */
export const submissionFixtures: Submission[] = [
  {
    id: 'sub_fixture_pending',
    opportunityId: 'opp_fire_hydrant',
    contributorId: FIXTURE_CONTRIBUTOR_ID,
    media: [
      { id: 'm1', uri: 'fixture://hydrant-front.jpg', kind: 'photo', capturedAt: '2026-06-10T17:02:00Z' },
      { id: 'm2', uri: 'fixture://hydrant-side.jpg', kind: 'photo', capturedAt: '2026-06-10T17:03:00Z' },
    ],
    category: 'street_infrastructure',
    location: { latitude: 37.7749, longitude: -122.4194 },
    submittedAt: '2026-06-10T17:05:00Z',
    status: 'pending_review',
  },
  {
    id: 'sub_fixture_accepted',
    opportunityId: 'opp_park_bench',
    contributorId: FIXTURE_CONTRIBUTOR_ID,
    media: [
      { id: 'm3', uri: 'fixture://bench-wide.jpg', kind: 'photo', capturedAt: '2026-06-09T14:10:00Z' },
    ],
    category: 'street_furniture',
    submittedAt: '2026-06-09T14:12:00Z',
    status: 'accepted',
    reward: { submissionId: 'sub_fixture_accepted', amount: usd(90), status: 'pending' },
  },
  {
    id: 'sub_fixture_needs_retry',
    opportunityId: 'opp_shopping_cart',
    contributorId: FIXTURE_CONTRIBUTOR_ID,
    media: [
      { id: 'm4', uri: 'fixture://cart-blurry.jpg', kind: 'photo', capturedAt: '2026-06-08T09:30:00Z' },
    ],
    category: 'everyday_objects',
    submittedAt: '2026-06-08T09:31:00Z',
    status: 'needs_retry',
    rejectionReason: 'blurry',
    reviewNote: 'The close-up shots are out of focus — try again in better light.',
  },
  {
    id: 'sub_fixture_rejected',
    opportunityId: 'opp_fire_hydrant',
    contributorId: FIXTURE_CONTRIBUTOR_ID,
    media: [
      { id: 'm5', uri: 'fixture://hydrant-dup.jpg', kind: 'photo', capturedAt: '2026-06-07T11:00:00Z' },
    ],
    category: 'street_infrastructure',
    submittedAt: '2026-06-07T11:02:00Z',
    status: 'rejected',
    rejectionReason: 'duplicate',
  },
];
