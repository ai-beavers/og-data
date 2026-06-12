import { sortByDistance } from '@/features/opportunities/useNearbyOpportunities';
import type { Opportunity } from '@/shared/types';

jest.mock('expo-location');

const usd = (cents: number) => ({ cents, currency: 'USD' as const });

function makeOpportunity(id: string, location?: { latitude: number; longitude: number }): Opportunity {
  return {
    id,
    title: id,
    description: '',
    category: 'test',
    location,
    rewardRange: { min: usd(10), max: usd(20) },
    capturePrompts: ['one shot'],
  };
}

const HERE = { latitude: 37.7749, longitude: -122.4194 };

describe('sortByDistance', () => {
  it('orders place-bound tasks nearest first and anywhere-tasks last', () => {
    const far = makeOpportunity('far', { latitude: 37.9, longitude: -122.6 });
    const near = makeOpportunity('near', { latitude: 37.776, longitude: -122.42 });
    const anywhere = makeOpportunity('anywhere');

    const sorted = sortByDistance([anywhere, far, near], HERE);

    expect(sorted.map((i) => i.opportunity.id)).toEqual(['near', 'far', 'anywhere']);
    expect(sorted[0].distanceMeters).toBeLessThan(sorted[1].distanceMeters!);
    expect(sorted[2].distanceMeters).toBeUndefined();
  });

  it('leaves order alone and reports no distances without a position', () => {
    const a = makeOpportunity('a', HERE);
    const b = makeOpportunity('b');

    const sorted = sortByDistance([a, b], null);

    expect(sorted.map((i) => i.opportunity.id)).toEqual(['a', 'b']);
    expect(sorted.every((i) => i.distanceMeters === undefined)).toBe(true);
  });
});
