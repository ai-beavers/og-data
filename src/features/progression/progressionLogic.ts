import type {
  Badge,
  Challenge,
  ChallengeProgress,
  ContributorProgress,
  Submission,
} from '@/shared/types';

/**
 * P1 — pure game-layer logic. Everything is derived from submission history,
 * so there is no extra state to persist or keep in sync.
 */

const DAY_MS = 86_400_000;

/** UTC calendar day for an ISO timestamp, e.g. "2026-06-11". */
function utcDay(iso: string): string {
  return iso.slice(0, 10);
}

/**
 * Consecutive days with at least one submission, counting back from today.
 * A streak survives until a full calendar day is missed: if the contributor
 * last submitted yesterday the streak is still alive.
 */
export function computeStreakDays(submissions: Submission[], now: Date): number {
  const days = new Set(submissions.map((s) => utcDay(s.submittedAt)));
  if (days.size === 0) return 0;

  let cursor = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  // Grace day: streak counts from yesterday if nothing was submitted today.
  if (!days.has(utcDay(new Date(cursor).toISOString()))) {
    cursor -= DAY_MS;
  }

  let streak = 0;
  while (days.has(utcDay(new Date(cursor).toISOString()))) {
    streak += 1;
    cursor -= DAY_MS;
  }
  return streak;
}

/**
 * Total accepted submissions required to *reach* a level.
 * Each level costs one more accepted capture than the last: L2 needs 3,
 * L3 needs +4 (7 total), L4 needs +5 (12 total), and so on — unbounded.
 */
export function acceptedNeededForLevel(level: number): number {
  return level <= 1 ? 0 : ((level - 1) * (level + 4)) / 2;
}

export function computeLevel(acceptedCount: number): number {
  let level = 1;
  while (acceptedNeededForLevel(level + 1) <= acceptedCount) {
    level += 1;
  }
  return level;
}

interface BadgeRule extends Badge {
  earned: (ctx: { accepted: Submission[]; streakDays: number }) => boolean;
}

function maxPerCategory(accepted: Submission[]): number {
  const counts = new Map<string, number>();
  for (const s of accepted) {
    counts.set(s.category, (counts.get(s.category) ?? 0) + 1);
  }
  return Math.max(0, ...counts.values());
}

/** Badge rules in display order. Copy stays game-like and non-technical. */
const BADGE_RULES: BadgeRule[] = [
  {
    id: 'first_find',
    name: 'First find',
    description: 'Your first capture was accepted.',
    earned: ({ accepted }) => accepted.length >= 1,
  },
  {
    id: 'collector',
    name: 'Collector',
    description: '10 accepted captures.',
    earned: ({ accepted }) => accepted.length >= 10,
  },
  {
    id: 'specialist',
    name: 'Specialist',
    description: '5 accepted captures in one category.',
    earned: ({ accepted }) => maxPerCategory(accepted) >= 5,
  },
  {
    id: 'on_a_roll',
    name: 'On a roll',
    description: 'Captured 3 days in a row.',
    earned: ({ streakDays }) => streakDays >= 3,
  },
  {
    id: 'week_streak',
    name: 'Week streak',
    description: 'Captured 7 days in a row.',
    earned: ({ streakDays }) => streakDays >= 7,
  },
];

/** All badges in display order, for showing locked ones alongside earned. */
export const ALL_BADGES: Badge[] = BADGE_RULES.map(({ id, name, description }) => ({
  id,
  name,
  description,
}));

export function computeBadges(submissions: Submission[], streakDays: number): Badge[] {
  const accepted = submissions.filter((s) => s.status === 'accepted');
  return BADGE_RULES.filter((rule) => rule.earned({ accepted, streakDays })).map(
    ({ id, name, description }) => ({ id, name, description }),
  );
}

export function computeContributorProgress(
  contributorId: string,
  submissions: Submission[],
  now: Date,
): ContributorProgress {
  const own = submissions.filter((s) => s.contributorId === contributorId);
  const acceptedCount = own.filter((s) => s.status === 'accepted').length;
  const streakDays = computeStreakDays(own, now);
  const level = computeLevel(acceptedCount);
  return {
    contributorId,
    streakDays,
    level,
    acceptedCount,
    nextLevelAcceptedCount: acceptedNeededForLevel(level + 1),
    badges: computeBadges(own, streakDays),
  };
}

/** A submission counts toward challenges unless it was rejected or needs retry. */
function countsTowardChallenge(s: Submission): boolean {
  return s.status === 'accepted' || s.status === 'pending_review';
}

export function isChallengeActive(challenge: Challenge, now: Date): boolean {
  const t = now.getTime();
  return t >= Date.parse(challenge.startsAt) && t <= Date.parse(challenge.endsAt);
}

export function computeChallengeProgress(
  challenge: Challenge,
  submissions: Submission[],
): ChallengeProgress {
  const count = submissions.filter(
    (s) =>
      countsTowardChallenge(s) &&
      (!challenge.category || s.category === challenge.category) &&
      s.submittedAt >= challenge.startsAt &&
      s.submittedAt <= challenge.endsAt,
  ).length;
  return { challenge, count, completed: count >= challenge.goalCount };
}
