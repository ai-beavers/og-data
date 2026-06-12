import {
  acceptedNeededForLevel,
  computeBadges,
  computeChallengeProgress,
  computeContributorProgress,
  computeLevel,
  computeStreakDays,
} from '@/features/progression/progressionLogic';
import type { Challenge, Submission, SubmissionStatus } from '@/shared/types';

const NOW = new Date('2026-06-11T20:00:00Z');

function submission(
  submittedAt: string,
  status: SubmissionStatus = 'accepted',
  overrides: Partial<Submission> = {},
): Submission {
  return {
    id: `sub_${submittedAt}_${Math.random().toString(36).slice(2, 6)}`,
    opportunityId: 'opp_test',
    contributorId: 'contributor_demo',
    media: [],
    category: 'street_infrastructure',
    submittedAt,
    status,
    ...overrides,
  };
}

describe('computeStreakDays', () => {
  it('is 0 with no submissions', () => {
    expect(computeStreakDays([], NOW)).toBe(0);
  });

  it('counts consecutive days ending today', () => {
    const submissions = [
      submission('2026-06-11T08:00:00Z'),
      submission('2026-06-10T08:00:00Z'),
      submission('2026-06-09T08:00:00Z'),
    ];
    expect(computeStreakDays(submissions, NOW)).toBe(3);
  });

  it('keeps the streak alive when today has no submission yet', () => {
    const submissions = [
      submission('2026-06-10T08:00:00Z'),
      submission('2026-06-09T08:00:00Z'),
    ];
    expect(computeStreakDays(submissions, NOW)).toBe(2);
  });

  it('breaks on a missed day', () => {
    const submissions = [
      submission('2026-06-11T08:00:00Z'),
      submission('2026-06-09T08:00:00Z'), // gap on the 10th
    ];
    expect(computeStreakDays(submissions, NOW)).toBe(1);
  });

  it('is 0 when the last submission is older than yesterday', () => {
    expect(computeStreakDays([submission('2026-06-08T08:00:00Z')], NOW)).toBe(0);
  });
});

describe('levels', () => {
  it('thresholds grow by one extra capture per level', () => {
    expect(acceptedNeededForLevel(1)).toBe(0);
    expect(acceptedNeededForLevel(2)).toBe(3);
    expect(acceptedNeededForLevel(3)).toBe(7);
    expect(acceptedNeededForLevel(4)).toBe(12);
  });

  it('maps accepted counts onto levels', () => {
    expect(computeLevel(0)).toBe(1);
    expect(computeLevel(2)).toBe(1);
    expect(computeLevel(3)).toBe(2);
    expect(computeLevel(7)).toBe(3);
    expect(computeLevel(11)).toBe(3);
    expect(computeLevel(12)).toBe(4);
  });
});

describe('computeBadges', () => {
  it('awards first find on the first accepted capture', () => {
    const badges = computeBadges([submission('2026-06-11T08:00:00Z')], 1);
    expect(badges.map((b) => b.id)).toEqual(['first_find']);
  });

  it('awards specialist for 5 accepted in one category', () => {
    const submissions = Array.from({ length: 5 }, (_, i) =>
      submission(`2026-06-0${i + 1}T08:00:00Z`),
    );
    expect(computeBadges(submissions, 0).map((b) => b.id)).toContain('specialist');
  });

  it('ignores non-accepted submissions for count badges', () => {
    const submissions = [
      submission('2026-06-11T08:00:00Z', 'rejected'),
      submission('2026-06-11T09:00:00Z', 'pending_review'),
    ];
    expect(computeBadges(submissions, 0)).toEqual([]);
  });

  it('awards streak badges from streak days', () => {
    const ids = computeBadges([], 7).map((b) => b.id);
    expect(ids).toContain('on_a_roll');
    expect(ids).toContain('week_streak');
  });
});

describe('computeChallengeProgress', () => {
  const challenge: Challenge = {
    id: 'ch_test',
    title: 'Three this week',
    description: 'Submit 3 captures.',
    goalCount: 3,
    startsAt: '2026-06-08T00:00:00Z',
    endsAt: '2026-06-14T23:59:59Z',
    bonusLabel: '+$0.50 bonus',
  };

  it('counts in-window pending and accepted submissions', () => {
    const submissions = [
      submission('2026-06-09T08:00:00Z', 'accepted'),
      submission('2026-06-10T08:00:00Z', 'pending_review'),
      submission('2026-06-10T09:00:00Z', 'rejected'), // does not count
      submission('2026-06-01T08:00:00Z', 'accepted'), // out of window
    ];
    const progress = computeChallengeProgress(challenge, submissions);
    expect(progress.count).toBe(2);
    expect(progress.completed).toBe(false);
  });

  it('filters by category when the challenge has one', () => {
    const scoped = { ...challenge, category: 'vegetation' };
    const submissions = [
      submission('2026-06-09T08:00:00Z', 'accepted', { category: 'vegetation' }),
      submission('2026-06-10T08:00:00Z', 'accepted'), // street_infrastructure
    ];
    expect(computeChallengeProgress(scoped, submissions).count).toBe(1);
  });

  it('marks the challenge completed at the goal', () => {
    const submissions = [
      submission('2026-06-09T08:00:00Z'),
      submission('2026-06-10T08:00:00Z'),
      submission('2026-06-11T08:00:00Z'),
    ];
    expect(computeChallengeProgress(challenge, submissions).completed).toBe(true);
  });
});

describe('computeContributorProgress', () => {
  it('only counts the contributor own submissions', () => {
    const submissions = [
      submission('2026-06-11T08:00:00Z'),
      submission('2026-06-11T09:00:00Z', 'accepted', { contributorId: 'someone_else' }),
    ];
    const progress = computeContributorProgress('contributor_demo', submissions, NOW);
    expect(progress.acceptedCount).toBe(1);
    expect(progress.streakDays).toBe(1);
    expect(progress.level).toBe(1);
    expect(progress.nextLevelAcceptedCount).toBe(3);
    expect(progress.badges.map((b) => b.id)).toEqual(['first_find']);
  });
});
