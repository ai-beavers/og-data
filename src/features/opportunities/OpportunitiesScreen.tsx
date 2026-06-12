import { router } from 'expo-router';
import { ActivityIndicator, SectionList, StyleSheet } from 'react-native';

import { groupByDistance } from '@/features/opportunities/nearbyGroups';
import { OpportunityCard } from '@/features/opportunities/OpportunityCard';
import { useNearbyOpportunities } from '@/features/opportunities/useNearbyOpportunities';
import { AppText, Screen, colors, spacing } from '@/shared/ui';

/**
 * M3 — Nearby Capture Opportunities (Machine A).
 * Location-sorted list of capture tasks grouped into discovery sections
 * (P1: near you / further away / anywhere); tapping one enters the guided
 * capture flow (M4).
 */
export function OpportunitiesScreen() {
  const { items, loading, locationAvailable } = useNearbyOpportunities();
  const sections = groupByDistance(items);
  // A lone "Anywhere" header (location off) adds noise, not orientation.
  const showHeaders = sections.length > 1;

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
        <SectionList
          sections={sections}
          keyExtractor={({ opportunity }) => opportunity.id}
          contentContainerStyle={styles.list}
          stickySectionHeadersEnabled={false}
          ListEmptyComponent={
            <AppText muted>No capture tasks right now — check back soon.</AppText>
          }
          renderSectionHeader={({ section }) =>
            showHeaders ? (
              <AppText variant="heading" style={styles.sectionHeader}>
                {section.title}
              </AppText>
            ) : null
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
  sectionHeader: { marginTop: spacing.xs },
});
