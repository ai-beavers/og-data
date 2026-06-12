import { colors } from '@/shared/ui';
import type {
  MoneyAmount,
  RejectionReason,
  RewardStatus,
  SubmissionStatus,
} from '@/shared/types';

/**
 * Display metadata for the post-submit lifecycle (Machine B).
 * Single source for status labels/colors and plain-language reason copy used
 * by the submissions history, review queue, and earnings screens.
 */

interface StatusMeta {
  label: string;
  color: string;
  /** One-line contributor-facing explanation of what the status means. */
  hint: string;
}

export const SUBMISSION_STATUS_META: Record<SubmissionStatus, StatusMeta> = {
  pending_review: {
    label: 'In review',
    color: colors.textSecondary,
    hint: 'We are checking your capture. This usually takes less than a day.',
  },
  accepted: {
    label: 'Accepted',
    color: colors.success,
    hint: 'Nice work — your reward has been added to your earnings.',
  },
  needs_retry: {
    label: 'Needs retry',
    color: colors.warning,
    hint: 'Almost there. Fix the issue below and capture it again.',
  },
  rejected: {
    label: 'Not accepted',
    color: colors.danger,
    hint: 'This one did not qualify. The reason is below.',
  },
};

/** Plain-language rejection reasons (M6) shown to contributors and operators. */
export const REJECTION_REASON_COPY: Record<RejectionReason, string> = {
  missing_angles: 'Missing angles — not all sides were captured',
  blurry: 'Blurry — the photos are out of focus',
  poor_lighting: 'Poor lighting — the subject is hard to see',
  duplicate: 'Duplicate — this subject was already submitted',
  unsupported_subject: 'Unsupported subject — this is not something we collect',
};

export const REWARD_STATUS_LABEL: Record<RewardStatus, string> = {
  pending: 'Pending',
  available: 'Available',
  paid: 'Paid',
};

/** Formats integer cents as a dollar string, e.g. 90 → "$0.90". */
export function formatMoney(amount: MoneyAmount): string {
  return `$${(amount.cents / 100).toFixed(2)}`;
}

export function formatMoneyRange(min: MoneyAmount, max: MoneyAmount): string {
  return `${formatMoney(min)} – ${formatMoney(max)}`;
}

/** Short, friendly date for list rows, e.g. "Jun 10, 5:05 PM". */
export function formatSubmittedAt(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
