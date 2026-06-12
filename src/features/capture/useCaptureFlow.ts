import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

import { api } from '@/shared/api';
import type { CapturedMedia, GeoPoint, Opportunity, Submission } from '@/shared/types';
import { FIXTURE_CONTRIBUTOR_ID } from '@/testing/fixtures/submissions';

export type CapturePhase =
  | 'loading'
  | 'not_found'
  | 'briefing'
  | 'camera'
  | 'review'
  | 'submitting';

/** Index of the first prompt without a shot, or -1 when every prompt is covered. */
export function firstUnfilledIndex(shots: (CapturedMedia | null)[]): number {
  return shots.findIndex((shot) => shot === null);
}

interface CaptureFlow {
  phase: CapturePhase;
  opportunity: Opportunity | null;
  /** One slot per capture prompt, filled as the contributor works through them. */
  shots: (CapturedMedia | null)[];
  stepIndex: number;
  start: () => void;
  recordShot: (uri: string) => void;
  retake: (index: number) => void;
  submit: () => Promise<Submission>;
}

async function getSubmitLocation(fallback?: GeoPoint): Promise<GeoPoint | undefined> {
  const lastKnown = await Location.getLastKnownPositionAsync().catch(() => null);
  if (lastKnown) {
    return {
      latitude: lastKnown.coords.latitude,
      longitude: lastKnown.coords.longitude,
    };
  }
  return fallback;
}

/**
 * M4 — state for the guided capture flow: briefing → one camera step per
 * prompt → local review (with retakes) → submission via the shared contract.
 */
export function useCaptureFlow(opportunityId: string): CaptureFlow {
  const [phase, setPhase] = useState<CapturePhase>('loading');
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [shots, setShots] = useState<(CapturedMedia | null)[]>([]);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    api.getOpportunity(opportunityId).then((found) => {
      if (cancelled) return;
      setOpportunity(found);
      setShots(found ? found.capturePrompts.map(() => null) : []);
      setPhase(found ? 'briefing' : 'not_found');
    });
    return () => {
      cancelled = true;
    };
  }, [opportunityId]);

  const start = useCallback(() => {
    setStepIndex(0);
    setPhase('camera');
  }, []);

  const recordShot = useCallback(
    (uri: string) => {
      const media: CapturedMedia = {
        id: `media_${Date.now()}_${stepIndex}`,
        uri,
        kind: 'photo',
        capturedAt: new Date().toISOString(),
      };
      const next = [...shots];
      next[stepIndex] = media;
      setShots(next);

      const unfilled = firstUnfilledIndex(next);
      if (unfilled === -1) {
        setPhase('review');
      } else {
        setStepIndex(unfilled);
      }
    },
    [shots, stepIndex],
  );

  const retake = useCallback((index: number) => {
    setStepIndex(index);
    setPhase('camera');
  }, []);

  const submit = useCallback(async () => {
    if (!opportunity) {
      throw new Error('Cannot submit before the opportunity is loaded');
    }
    setPhase('submitting');
    const media = shots.filter((shot): shot is CapturedMedia => shot !== null);
    return api.createSubmission({
      opportunityId: opportunity.id,
      contributorId: FIXTURE_CONTRIBUTOR_ID,
      media,
      category: opportunity.category,
      location: await getSubmitLocation(opportunity.location),
    });
  }, [opportunity, shots]);

  return { phase, opportunity, shots, stepIndex, start, recordShot, retake, submit };
}
