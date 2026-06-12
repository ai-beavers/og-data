import type { Opportunity } from '@/shared/types';

const usd = (cents: number) => ({ cents, currency: 'USD' as const });

/** Seeded operator-defined opportunities (M3 — no buyer self-serve yet). */
export const opportunityFixtures: Opportunity[] = [
  {
    id: 'opp_fire_hydrant',
    title: 'Capture a fire hydrant',
    description: 'Find a fire hydrant on your street and capture it from all sides.',
    category: 'street_infrastructure',
    location: { latitude: 37.7749, longitude: -122.4194 },
    rewardRange: { min: usd(50), max: usd(150) },
    capturePrompts: [
      'Stand about 2 meters away and take a photo from the front.',
      'Walk around it — take a photo from each side and the back.',
      'Get one close-up of any text or markings.',
    ],
  },
  {
    id: 'opp_park_bench',
    title: 'Capture a park bench',
    description: 'Any public bench works. Catch the whole bench and its surroundings.',
    category: 'street_furniture',
    location: { latitude: 37.7694, longitude: -122.4862 },
    rewardRange: { min: usd(40), max: usd(120) },
    capturePrompts: [
      'Take a wide shot showing the whole bench.',
      'Capture both ends and the seat surface.',
      'Optional: a short video walking around the bench.',
    ],
  },
  {
    id: 'opp_shopping_cart',
    title: 'Capture a shopping cart',
    description: 'A standard shopping cart, anywhere you find one. No people in frame.',
    category: 'everyday_objects',
    rewardRange: { min: usd(60), max: usd(200) },
    capturePrompts: [
      'Photograph the cart from the front, both sides, and the back.',
      'Get a close-up of the handle and the basket interior.',
      'Make sure no people are visible in any shot.',
    ],
  },
];
