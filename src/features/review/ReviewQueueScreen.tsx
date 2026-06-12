import { PlaceholderScreen } from '@/shared/ui/PlaceholderScreen';

/**
 * M6 — Review & Quality Feedback (Machine B).
 * Operator-facing, minimal: approve / needs-retry / reject with
 * plain-language reasons. Not linked from contributor navigation.
 */
export function ReviewQueueScreen() {
  return (
    <PlaceholderScreen
      title="Review queue (operator)"
      deliverable="Internal queue to accept, retry, or reject pending submissions with plain-language reasons (M6)."
      owner="Machine B — post-submit side"
    />
  );
}
