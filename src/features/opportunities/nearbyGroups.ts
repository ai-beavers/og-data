import type { NearbyOpportunity } from '@/features/opportunities/useNearbyOpportunities';

/** Within this distance an opportunity counts as "near you" (P1 discovery). */
export const NEAR_THRESHOLD_METERS = 3000;

export interface OpportunitySection {
  title: string;
  data: NearbyOpportunity[];
}

/**
 * Buckets a distance-sorted list into friendly discovery sections.
 * Empty sections are omitted; with no location everything lands in one
 * "Anywhere" bucket and the single header is not worth showing.
 */
export function groupByDistance(items: NearbyOpportunity[]): OpportunitySection[] {
  const near: NearbyOpportunity[] = [];
  const further: NearbyOpportunity[] = [];
  const anywhere: NearbyOpportunity[] = [];

  for (const item of items) {
    if (item.distanceMeters === undefined) anywhere.push(item);
    else if (item.distanceMeters <= NEAR_THRESHOLD_METERS) near.push(item);
    else further.push(item);
  }

  return [
    { title: 'Near you', data: near },
    { title: 'Further away', data: further },
    { title: 'Anywhere', data: anywhere },
  ].filter((section) => section.data.length > 0);
}
