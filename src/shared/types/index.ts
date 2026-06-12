/**
 * Shared domain contracts — the frozen seam between the two parallel
 * workstreams (Machine A: capture side, Machine B: post-submit side).
 *
 * Changes here must be small, separate commits coordinated between machines.
 * See README_PRD.md → "Parallel Workstream Split".
 */

/** Lifecycle of a submission after the contributor hits submit. */
export type SubmissionStatus =
  | 'pending_review'
  | 'accepted'
  | 'needs_retry'
  | 'rejected';

/** Plain-language rejection reasons surfaced to contributors (M6). */
export type RejectionReason =
  | 'missing_angles'
  | 'blurry'
  | 'poor_lighting'
  | 'duplicate'
  | 'unsupported_subject';

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

/** MVP is display-only money; payout rails are Post-MVP. */
export interface MoneyAmount {
  /** Integer cents to avoid float drift. */
  cents: number;
  currency: 'USD';
}

/**
 * An operator-defined capture task shown to contributors (M3).
 * `location` is optional: general collection goals are not place-bound.
 */
export interface Opportunity {
  id: string;
  title: string;
  description: string;
  category: string;
  location?: GeoPoint;
  rewardRange: { min: MoneyAmount; max: MoneyAmount };
  /** Step-by-step, non-technical guidance shown during capture (M4). */
  capturePrompts: string[];
}

export interface CapturedMedia {
  id: string;
  /** Local file URI on device, or remote URI once uploaded. */
  uri: string;
  kind: 'photo' | 'video';
  capturedAt: string; // ISO 8601
}

/** What the capture flow hands to the API when the contributor submits (M5). */
export interface NewSubmissionInput {
  opportunityId: string;
  contributorId: string;
  media: CapturedMedia[];
  category: string;
  location?: GeoPoint;
}

export interface Submission {
  id: string;
  opportunityId: string;
  contributorId: string;
  media: CapturedMedia[];
  category: string;
  location?: GeoPoint;
  submittedAt: string; // ISO 8601
  status: SubmissionStatus;
  rejectionReason?: RejectionReason;
  /** Optional free-text note from the reviewer. */
  reviewNote?: string;
  /** Present once the submission is accepted (M7). */
  reward?: Reward;
}

export type RewardStatus = 'pending' | 'available' | 'paid';

export interface Reward {
  submissionId: string;
  amount: MoneyAmount;
  status: RewardStatus;
}

export interface EarningsSummary {
  totalEarned: MoneyAmount;
  pending: MoneyAmount;
  rewards: Reward[];
}

/** Operator decision applied to a pending submission (M6). */
export type ReviewDecision =
  | { outcome: 'accept'; reward: MoneyAmount; reviewNote?: string }
  | { outcome: 'needs_retry'; reason: RejectionReason; reviewNote?: string }
  | { outcome: 'reject'; reason: RejectionReason; reviewNote?: string };
