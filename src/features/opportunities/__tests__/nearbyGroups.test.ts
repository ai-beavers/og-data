import { groupByDistance } from '@/features/opportunities/nearbyGroups';
import type { NearbyOpportunity } from '@/features/opportunities/useNearbyOpportunities';
import { opportunityFixtures } from '@/testing/fixtures/opportunities';

function item(distanceMeters?: number): NearbyOpportunity {
  return { opportunity: opportunityFixtures[0], distanceMeters };
}

describe('groupByDistance', () => {
  it('buckets items into near, further, and anywhere', () => {
    const sections = groupByDistance([item(500), item(8000), item(undefined)]);
    expect(sections.map((s) => s.title)).toEqual(['Near you', 'Further away', 'Anywhere']);
    expect(sections.map((s) => s.data.length)).toEqual([1, 1, 1]);
  });

  it('omits empty sections', () => {
    const sections = groupByDistance([item(100), item(2999)]);
    expect(sections.map((s) => s.title)).toEqual(['Near you']);
  });

  it('puts everything in Anywhere when location is unavailable', () => {
    const sections = groupByDistance([item(undefined), item(undefined)]);
    expect(sections).toHaveLength(1);
    expect(sections[0].title).toBe('Anywhere');
  });
});
