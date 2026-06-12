import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { formatMoney, REWARD_STATUS_LABEL } from '@/features/submissions/submissionMeta';
import { api } from '@/shared/api';
import type { EarningsSummary, Reward } from '@/shared/types';
import { AppText, Card, colors, Screen, spacing } from '@/shared/ui';
import { FIXTURE_CONTRIBUTOR_ID } from '@/testing/fixtures/submissions';

/**
 * M7 — Rewards & Earnings (Machine B).
 * Accumulated total, per-submission rewards, pending rewards, payout status
 * display (payout rails are Post-MVP).
 */
export function EarningsScreen() {
  const [earnings, setEarnings] = useState<EarningsSummary | null>(null);

  const reload = useCallback(() => {
    let cancelled = false;
    api.getEarnings(FIXTURE_CONTRIBUTOR_ID).then((summary) => {
      if (!cancelled) setEarnings(summary);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useFocusEffect(reload);

  return (
    <Screen>
      <AppText variant="title">Earnings</AppText>

      <Card>
        <AppText variant="caption" muted>
          Total earned
        </AppText>
        <AppText variant="title" style={styles.total}>
          {earnings ? formatMoney(earnings.totalEarned) : '—'}
        </AppText>
        <AppText variant="caption" muted>
          {earnings ? `${formatMoney(earnings.pending)} pending` : ' '}
        </AppText>
      </Card>

      <Card>
        <AppText variant="caption" muted>
          Payouts are coming soon. Your rewards keep accumulating until then.
        </AppText>
      </Card>

      <AppText variant="heading">Reward history</AppText>
      <FlatList
        data={earnings?.rewards ?? []}
        keyExtractor={(r) => r.submissionId}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <RewardRow reward={item} />}
        ListEmptyComponent={
          earnings ? (
            <View style={styles.empty}>
              <AppText variant="body" muted style={styles.emptyBody}>
                No rewards yet. Accepted submissions earn rewards that show up here.
              </AppText>
            </View>
          ) : null
        }
      />
    </Screen>
  );
}

function RewardRow({ reward }: { reward: Reward }) {
  return (
    <Card style={styles.rewardRow}>
      <View style={styles.rewardInfo}>
        <AppText variant="body">Submission {reward.submissionId}</AppText>
        <AppText variant="caption" muted>
          {REWARD_STATUS_LABEL[reward.status]}
        </AppText>
      </View>
      <AppText variant="heading" style={styles.rewardAmount}>
        {formatMoney(reward.amount)}
      </AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  total: { color: colors.success },
  list: { gap: spacing.sm, paddingBottom: spacing.xl },
  empty: { alignItems: 'center', paddingTop: spacing.lg },
  emptyBody: { textAlign: 'center' },
  rewardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rewardInfo: { gap: spacing.xs },
  rewardAmount: { color: colors.success },
});
