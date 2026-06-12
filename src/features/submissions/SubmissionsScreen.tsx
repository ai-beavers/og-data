import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { SubmissionCard } from '@/features/submissions/SubmissionCard';
import { useSubmissions } from '@/features/submissions/useSubmissions';
import { api } from '@/shared/api';
import { AppText, Screen, spacing } from '@/shared/ui';

/**
 * M5 — Submission (Machine B).
 * Submission history with states: pending review, accepted, needs retry,
 * rejected. Built against fixture submissions.
 */
export function SubmissionsScreen() {
  const { submissions, loading } = useSubmissions();
  const [titles, setTitles] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    api.listOpportunities().then((opportunities) => {
      if (cancelled) return;
      setTitles(Object.fromEntries(opportunities.map((o) => [o.id, o.title])));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Screen>
      <AppText variant="title">My submissions</AppText>
      <FlatList
        data={submissions}
        keyExtractor={(s) => s.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <SubmissionCard
            submission={item}
            title={titles[item.opportunityId] ?? item.category.replaceAll('_', ' ')}
          />
        )}
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.empty}>
              <AppText variant="heading">Nothing here yet</AppText>
              <AppText variant="body" muted style={styles.emptyBody}>
                Capture a nearby opportunity and your submissions will show up here with
                their review status.
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
  emptyBody: { textAlign: 'center' },
});
