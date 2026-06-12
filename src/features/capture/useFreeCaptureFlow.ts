import * as Location from 'expo-location';
import { useCallback, useState } from 'react';

import { classifyCapture, type CaptureClassification } from '@/shared/ai/classifyCapture';
import { api } from '@/shared/api';
import type { CapturedMedia, GeoPoint, NewSubmissionInput, Submission } from '@/shared/types';
import { FIXTURE_CONTRIBUTOR_ID } from '@/testing/fixtures/submissions';

export type FreeCapturePhase = 'camera' | 'review' | 'submitting';

export interface FreeShot {
  media: CapturedMedia;
  /** Kept locally for AI classification; never part of the submission payload. */
  base64?: string;
}

interface FreeCaptureFlow {
  phase: FreeCapturePhase;
  shots: FreeShot[];
  addShot: (uri: string, base64?: string) => void;
  removeShot: (index: number) => void;
  goToReview: () => void;
  backToCamera: () => void;
  /** Classifies the capture (best-effort) and submits. Never blocks on AI. */
  submit: () => Promise<Submission>;
  reset: () => void;
}

/**
 * Maps local shots + AI classification to the shared submission contract.
 * Free captures intentionally carry no opportunityId.
 */
export function toSubmissionInput(
  shots: FreeShot[],
  classification: CaptureClassification,
  location: GeoPoint | undefined,
  contributorId: string,
): NewSubmissionInput {
  return {
    contributorId,
    media: shots.map((shot) => shot.media),
    category: classification.category,
    aiLabel: classification.aiLabel,
    location,
  };
}

/** Last-known position only — never opens a prompt or waits on a GPS fix. */
async function getQuickLocation(): Promise<GeoPoint | undefined> {
  const lastKnown = await Location.getLastKnownPositionAsync().catch(() => null);
  if (!lastKnown) return undefined;
  return {
    latitude: lastKnown.coords.latitude,
    longitude: lastKnown.coords.longitude,
  };
}

/**
 * M8 — free capture: shoot any number of angles of anything, review locally,
 * then submit. Category and subject label come from AI classification of the
 * first shot plus location metadata; the contributor types nothing.
 */
export function useFreeCaptureFlow(): FreeCaptureFlow {
  const [phase, setPhase] = useState<FreeCapturePhase>('camera');
  const [shots, setShots] = useState<FreeShot[]>([]);

  const addShot = useCallback((uri: string, base64?: string) => {
    const media: CapturedMedia = {
      id: `media_${Date.now()}_${Math.floor(Math.random() * 1e6)}`,
      uri,
      kind: 'photo',
      capturedAt: new Date().toISOString(),
    };
    setShots((current) => [...current, { media, base64 }]);
  }, []);

  const removeShot = useCallback((index: number) => {
    setShots((current) => {
      const next = current.filter((_, i) => i !== index);
      if (next.length === 0) setPhase('camera');
      return next;
    });
  }, []);

  const goToReview = useCallback(() => {
    setShots((current) => {
      if (current.length > 0) setPhase('review');
      return current;
    });
  }, []);

  const backToCamera = useCallback(() => setPhase('camera'), []);

  const reset = useCallback(() => {
    setShots([]);
    setPhase('camera');
  }, []);

  const submit = useCallback(async () => {
    if (shots.length === 0) {
      throw new Error('Cannot submit a capture without shots');
    }
    setPhase('submitting');
    try {
      const location = await getQuickLocation();
      const classification = await classifyCapture(
        shots.flatMap((shot) => (shot.base64 ? [shot.base64] : [])),
        location,
      );
      return await api.createSubmission(
        toSubmissionInput(shots, classification, location, FIXTURE_CONTRIBUTOR_ID),
      );
    } catch (error) {
      setPhase('review');
      throw error;
    }
  }, [shots]);

  return { phase, shots, addShot, removeShot, goToReview, backToCamera, submit, reset };
}
