import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { BadgeGrid } from '@/features/progression/components/BadgeGrid';
import { LeaderboardList } from '@/features/progression/components/LeaderboardList';
import { acceptedNeededForLevel } from '@/features/progression/progressionLogic';
import { useProgression } from '@/features/progression/useProgression';
import type { ChallengeProgress, ContributorProgress } from '@/shared/types';
import { AppText, Card, colors, ProgressBar, Screen, spacing } from '@/shared/ui';
import { FIXTURE_CONTRIBUTOR_ID } from '@/testing/fixtures/submissions';

/**
 * P1 — Game-Like Motivation (contributor-facing).
 * Streak, level, badges, challenges, and leaderboard — all phrased as play,
 * never as data-collection work.
 */
export function ProgressScreen() {
  const { progress, challenges, leaderboard, loading } = useProgression(
    FIXTURE_CONTRIBUTOR_ID,
  );

  if (loading || !progress) {
    return (
      <Screen>
        <AppText variant="title">Your progress</AppText>
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <AppText variant="title">Your progress</AppText>

        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <AppText variant="title" style={styles.statValue}>
              {progress.streakDays}
            </AppText>
            <AppText variant="caption" muted>
              day streak
            </AppText>
            <AppText variant="caption" muted>
              {progress.streakDays > 0
                ? 'Capture today to keep it going.'
                : 'Capture something today to start one.'}
            </AppText>
          </Card>
          <LevelCard progress={progress} />
        </View>

        <AppText variant="heading">Challenges</AppText>
        {challenges.length === 0 ? (
          <AppText variant="caption" muted>
            No active challenges right now — check back soon.
          </AppText>
        ) : (
          challenges.map((c) => <ChallengeCard key={c.challenge.id} item={c} />)
        )}

        <AppText variant="heading">Badges</AppText>
        <BadgeGrid earned={progress.badges} />

        <AppText variant="heading">Leaderboard</AppText>
        <AppText variant="caption" muted>
          Top collectors by accepted captures.
        </AppText>
        <LeaderboardList entries={leaderboard} />
      </ScrollView>
    </Screen>
  );
}

function LevelCard({ progress }: { progress: ContributorProgress }) {
  const currentFloor = acceptedNeededForLevel(progress.level);
  const span = progress.nextLevelAcceptedCount - currentFloor;
  const into = progress.acceptedCount - currentFloor;
  const remaining = progress.nextLevelAcceptedCount - progress.acceptedCount;

  return (
    <Card style={styles.statCard}>
      <AppText variant="title" style={styles.statValue}>
        Lv {progress.level}
      </AppText>
      <ProgressBar value={span > 0 ? into / span : 1} />
      <AppText variant="caption" muted>
        {remaining === 1
          ? '1 accepted capture to the next level'
          : `${remaining} accepted captures to the next level`}
      </AppText>
    </Card>
  );
}

function ChallengeCard({ item }: { item: ChallengeProgress }) {
  const { challenge, count, completed } = item;
  return (
    <Card style={completed ? styles.challengeDone : undefined}>
      <View style={styles.challengeHeader}>
        <AppText variant="body" style={styles.challengeTitle}>
          {challenge.title}
        </AppText>
        <AppText variant="caption" style={styles.bonus}>
          {completed ? 'Done!' : challenge.bonusLabel}
        </AppText>
      </View>
      <AppText variant="caption" muted>
        {challenge.description}
      </AppText>
      <ProgressBar
        value={count / challenge.goalCount}
        color={completed ? colors.success : colors.accent}
      />
      <AppText variant="caption" muted>
        {Math.min(count, challenge.goalCount)} of {challenge.goalCount}
      </AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: spacing.xl },
  scroll: { gap: spacing.md, paddingBottom: spacing.xl },
  statsRow: { flexDirection: 'row', gap: spacing.md },
  statCard: { flex: 1 },
  statValue: { color: colors.accent },
  challengeHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  challengeTitle: { flex: 1, fontWeight: '600' },
  bonus: { color: colors.success, fontWeight: '600' },
  challengeDone: { borderColor: colors.success },
});
