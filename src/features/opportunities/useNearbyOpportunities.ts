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

/** Geolocation may never settle (e.g. a dismissed browser prompt) — cap the wait. */
const LOCATION_TIMEOUT_MS = 5000;

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

/** Resolves null instead of hanging when `promise` outlives the timeout. */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
  ]);
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
 * Best-effort position: permission prompt and fix are both capped so a hung
 * browser prompt or missing GPS can never block the caller.
 */
async function getPositionSafe(): Promise<GeoPoint | null> {
  const permission = await withTimeout(
    Location.requestForegroundPermissionsAsync(),
    LOCATION_TIMEOUT_MS,
  ).catch(() => null);
  if (permission?.status !== Location.PermissionStatus.GRANTED) return null;
  return withTimeout(getPosition(), LOCATION_TIMEOUT_MS).catch(() => null);
}

/**
 * M3 — loads opportunities and orders them by distance when the contributor
 * grants location. The plain list renders immediately; distance sorting is a
 * progressive enhancement applied once (and if) geolocation resolves.
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
      if (cancelled) return;

      // Show the unsorted list right away — never wait on geolocation.
      setState({
        items: sortByDistance(opportunities, null),
        loading: false,
        locationAvailable: true,
      });

      const position = await getPositionSafe();
      if (cancelled) return;

      setState({
        items: sortByDistance(opportunities, position),
        loading: false,
        locationAvailable: position !== null,
      });
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
