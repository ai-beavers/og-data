import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { ReviewCard } from '@/features/review/ReviewCard';
import { api } from '@/shared/api';
import type { Opportunity, ReviewDecision, Submission } from '@/shared/types';
import { AppText, Screen, spacing } from '@/shared/ui';

/**
 * M6 — Review & Quality Feedback (Machine B).
 * Operator-facing, minimal: approve / needs-retry / reject with
 * plain-language reasons. Not linked from contributor navigation.
 */
export function ReviewQueueScreen() {
  const [queue, setQueue] = useState<Submission[]>([]);
  const [opportunities, setOpportunities] = useState<Record<string, Opportunity>>({});
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([api.listReviewQueue(), api.listOpportunities()])
      .then(([pending, opps]) => {
        if (cancelled) return;
        setQueue(pending);
        setOpportunities(Object.fromEntries(opps.map((o) => [o.id, o])));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useFocusEffect(reload);

  async function decide(submissionId: string, decision: ReviewDecision) {
    await api.reviewSubmission(submissionId, decision);
    setQueue((current) => current.filter((s) => s.id !== submissionId));
  }

  return (
    <Screen>
      <AppText variant="title">Review queue</AppText>
      <AppText variant="caption" muted>
        {queue.length === 1 ? '1 submission' : `${queue.length} submissions`} pending review
      </AppText>
      <FlatList
        data={queue}
        keyExtractor={(s) => s.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ReviewCard
            submission={item}
            opportunity={
              item.opportunityId ? (opportunities[item.opportunityId] ?? null) : null
            }
            onDecide={(decision) => decide(item.id, decision)}
          />
        )}
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.empty}>
              <AppText variant="heading">Queue is clear</AppText>
              <AppText variant="body" muted>
                New submissions land here as contributors submit captures.
              </AppText>
            </View>
          )
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.md, paddingBottom: spacing.xl },
  empty: { alignItems: 'center', gap: spacing.sm, paddingTop: spacing.xl },
});
