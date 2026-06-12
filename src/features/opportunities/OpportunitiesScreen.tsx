import { router } from 'expo-router';
import { ActivityIndicator, FlatList, StyleSheet } from 'react-native';

import { OpportunityCard } from '@/features/opportunities/OpportunityCard';
import { useNearbyOpportunities } from '@/features/opportunities/useNearbyOpportunities';
import { AppText, Screen, colors, spacing } from '@/shared/ui';

/**
 * M3 — Nearby Capture Opportunities (Machine A).
 * Location-sorted list of seeded tasks; tapping one enters the guided
 * capture flow (M4).
 */
export function OpportunitiesScreen() {
  const { items, loading, locationAvailable } = useNearbyOpportunities();

  return (
    <Screen>
      <AppText variant="title">Nearby opportunities</AppText>
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
