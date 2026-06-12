import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

import { distanceMeters } from '@/features/opportunities/distance';
import { api } from '@/shared/api';
import type { GeoPoint, Opportunity } from '@/shared/types';

export interface NearbyOpportunity {
  opportunity: Opportunity;
  /** Meters from the contributor; undefined when either side has no location. */
  distanceMeters?: number;
}

interface NearbyOpportunitiesState {
  items: NearbyOpportunity[];
  loading: boolean;
  /** False when location permission was denied — the list still works, unsorted. */
  locationAvailable: boolean;
}

/** Place-bound opportunities sorted nearest-first; "anywhere" tasks follow. */
export function sortByDistance(
  opportunities: Opportunity[],
  position: GeoPoint | null,
): NearbyOpportunity[] {
  const items = opportunities.map<NearbyOpportunity>((opportunity) => ({
    opportunity,
    distanceMeters:
      position && opportunity.location
        ? distanceMeters(position, opportunity.location)
        : undefined,
  }));
  return items.sort((a, b) => {
    if (a.distanceMeters === undefined && b.distanceMeters === undefined) return 0;
    if (a.distanceMeters === undefined) return 1;
    if (b.distanceMeters === undefined) return -1;
    return a.distanceMeters - b.distanceMeters;
  });
}

async function getPosition(): Promise<GeoPoint | null> {
  const lastKnown = await Location.getLastKnownPositionAsync();
  const location =
    lastKnown ??
    (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
  return location
    ? { latitude: location.coords.latitude, longitude: location.coords.longitude }
    : null;
}

/**
 * M3 — loads opportunities and orders them by distance when the contributor
 * grants location. Denied permission degrades gracefully to the plain list.
 */
export function useNearbyOpportunities(): NearbyOpportunitiesState {
  const [state, setState] = useState<NearbyOpportunitiesState>({
    items: [],
    loading: true,
    locationAvailable: true,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const opportunities = await api.listOpportunities();

      let position: GeoPoint | null = null;
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === Location.PermissionStatus.GRANTED) {
        position = await getPosition().catch(() => null);
      }

      if (!cancelled) {
        setState({
          items: sortByDistance(opportunities, position),
          loading: false,
          locationAvailable: position !== null,
        });
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
