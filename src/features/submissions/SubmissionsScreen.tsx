import { PlaceholderScreen } from '@/shared/ui/PlaceholderScreen';

/**
 * M5 — Submission (Machine B).
 * Submission history with states: pending review, accepted, needs retry,
 * rejected. Built against fixture submissions.
 */
export function SubmissionsScreen() {
  return (
    <PlaceholderScreen
      title="My submissions"
      deliverable="Submission history with status, context, and retry entry points (M5)."
      owner="Machine B — post-submit side"
    />
  );
}
