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
  /** Absent for free captures (M8); present when fulfilling a suggested task. */
  opportunityId?: string;
  contributorId: string;
  media: CapturedMedia[];
  category: string;
  /** AI-identified subject of a free capture, e.g. "red fire hydrant" (M8). */
  aiLabel?: string;
  location?: GeoPoint;
}

export interface Submission {
  id: string;
  /** Absent for free captures (M8); present when fulfilling a suggested task. */
  opportunityId?: string;
  contributorId: string;
  media: CapturedMedia[];
  category: string;
  /** AI-identified subject of a free capture, e.g. "red fire hydrant" (M8). */
  aiLabel?: string;
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

// ---------------------------------------------------------------------------
// Post-MVP P2 — Data Request Campaigns
// ---------------------------------------------------------------------------

export type CampaignStatus = 'draft' | 'active' | 'completed';

/** How much capture effort a campaign asks of contributors per submission. */
export type CaptureDepth = 'quick' | 'standard' | 'thorough';

/**
 * A buyer/operator data request. Active campaigns are automatically derived
 * into contributor-facing `Opportunity` records — contributors never see
 * campaigns directly, so buyer complexity stays out of the contributor UI.
 */
export interface Campaign {
  id: string;
  /** Contributor-facing task name, e.g. "Capture storefront doors". */
  name: string;
  /** Buyer/operator who requested the data; never shown to contributors. */
  requester: string;
  description: string;
  category: string;
  /** Optional place focus; omitted = capturable anywhere. */
  location?: GeoPoint;
  /** Plain-language environment hints, e.g. "outdoors", "daylight". */
  environments: string[];
  captureDepth: CaptureDepth;
  /** Quality bar in plain language; folded into contributor guidance. */
  qualityExpectations: string[];
  rewardRange: { min: MoneyAmount; max: MoneyAmount };
  /** Accepted submissions needed to fulfil the campaign. */
  targetAcceptedCount: number;
  status: CampaignStatus;
  createdAt: string; // ISO 8601
}

/** What the operator form submits; status/id/createdAt are assigned server-side. */
export type NewCampaignInput = Omit<Campaign, 'id' | 'status' | 'createdAt'>;

/** Requester-facing fulfilment progress (P2). */
export interface CampaignProgress {
  campaignId: string;
  submittedCount: number;
  acceptedCount: number;
  /** Accepted submissions still needed toward the target; never negative. */
  remainingCount: number;
}

// ---------------------------------------------------------------------------
// Post-MVP P1 — Game-Like Motivation
// ---------------------------------------------------------------------------

export interface Badge {
  id: string;
  name: string;
  /** Plain-language description of how it was earned. */
  description: string;
}

/** Contributor game state — derived entirely from submission history. */
export interface ContributorProgress {
  contributorId: string;
  /** Consecutive days (ending today or yesterday) with ≥1 submission. */
  streakDays: number;
  level: number;
  acceptedCount: number;
  /** Total accepted submissions required to reach the next level. */
  nextLevelAcceptedCount: number;
  badges: Badge[];
}

/**
 * A time-boxed capture goal. Bonus is display-only until real payout rails
 * land (P5).
 */
export interface Challenge {
  id: string;
  title: string;
  description: string;
  /** Submissions must match this category to count; omitted = any. */
  category?: string;
  goalCount: number;
  startsAt: string; // ISO 8601
  endsAt: string; // ISO 8601
  /** Display-only bonus, e.g. "+$1.00 bonus". */
  bonusLabel: string;
}

export interface ChallengeProgress {
  challenge: Challenge;
  /** Qualifying submissions inside the challenge window. */
  count: number;
  completed: boolean;
}

export interface LeaderboardEntry {
  contributorId: string;
  /** Friendly handle; never a real identity. */
  displayName: string;
  acceptedCount: number;
  rank: number;
  isCurrentUser: boolean;
}
