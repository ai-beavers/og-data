import type { Campaign } from '@/shared/types';

const usd = (cents: number) => ({ cents, currency: 'USD' as const });

/** Seeded buyer data requests (P2). Active ones surface as opportunities. */
export const campaignFixtures: Campaign[] = [
  {
    id: 'camp_storefront_doors',
    name: 'Capture storefront doors',
    requester: 'Acme Robotics',
    description: 'Street-level shop entrances with the door fully visible.',
    category: 'storefronts',
    location: { latitude: 37.7793, longitude: -122.4193 },
    environments: ['outdoors', 'daylight'],
    captureDepth: 'standard',
    qualityExpectations: ['the whole door frame is in frame', 'no people in the shot'],
    rewardRange: { min: usd(80), max: usd(220) },
    targetAcceptedCount: 20,
    status: 'active',
    createdAt: '2026-06-09T16:00:00Z',
  },
  {
    id: 'camp_potted_plants',
    name: 'Capture potted plants',
    requester: 'SimScape Labs',
    description: 'Potted plants of any size — sidewalk planters count too.',
    category: 'vegetation',
    environments: ['anywhere with good light'],
    captureDepth: 'thorough',
    qualityExpectations: ['leaves are in focus', 'the pot is fully visible'],
    rewardRange: { min: usd(60), max: usd(180) },
    targetAcceptedCount: 30,
    status: 'active',
    createdAt: '2026-06-10T09:30:00Z',
  },
];
