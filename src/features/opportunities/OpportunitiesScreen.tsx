import { router } from 'expo-router';
import { ActivityIndicator, FlatList, StyleSheet } from 'react-native';

import { OpportunityCard } from '@/features/opportunities/OpportunityCard';
import { useNearbyOpportunities } from '@/features/opportunities/useNearbyOpportunities';
import { AppText, Screen, colors, spacing } from '@/shared/ui';

/**
 * M3 — Suggested tasks (demoted from primary entry point by the M8 pivot).
 * Location-sorted list of seeded tasks with defined rewards; tapping one
 * enters the guided capture flow (M4). Free capture lives on the home tab.
 */
export function OpportunitiesScreen() {
  const { items, loading, locationAvailable } = useNearbyOpportunities();

  return (
    <Screen>
      <AppText variant="title">Suggested tasks</AppText>
      <AppText variant="caption" muted>
        Optional tasks with set rewards — you can always just capture from the
        Capture tab.
      </AppText>
      {!loading && !locationAvailable ? (
        <AppText variant="caption" muted>
          {'Location is off — showing all tasks. Enable location to see what\u2019s closest.'}
        </AppText>
      ) : null}
      {loading ? (
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={({ opportunity }) => opportunity.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <AppText muted>No capture tasks right now — check back soon.</AppText>
          }
          renderItem={({ item }) => (
            <OpportunityCard
              item={item}
              onPress={() => router.push(`/capture/${item.opportunity.id}`)}
            />
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: spacing.xl },
  list: { gap: spacing.md, paddingBottom: spacing.lg },
});
