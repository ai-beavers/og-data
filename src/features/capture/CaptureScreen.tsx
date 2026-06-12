import { useLocalSearchParams } from 'expo-router';

import { PlaceholderScreen } from '@/shared/ui/PlaceholderScreen';

/**
 * M4 — Guided Capture Flow (Machine A).
 * Route receives the opportunity id; the real flow walks the contributor
 * through capture prompts with the camera, then a local review step.
 */
export function CaptureScreen() {
  const { opportunityId } = useLocalSearchParams<{ opportunityId: string }>();
  return (
    <PlaceholderScreen
      title="Guided capture"
      deliverable={`Camera flow with step-by-step prompts for opportunity "${opportunityId}", then local review before submit (M4).`}
      owner="Machine A — capture side"
    />
  );
}
