import { Pressable, StyleSheet, View } from 'react-native';

import { formatDistance } from '@/features/opportunities/distance';
import type { NearbyOpportunity } from '@/features/opportunities/useNearbyOpportunities';
import type { MoneyAmount } from '@/shared/types';
import { AppText, Card, colors, spacing } from '@/shared/ui';

function formatUsd({ cents }: MoneyAmount): string {
  return `$${(cents / 100).toFixed(2)}`;
}

interface OpportunityCardProps {
  item: NearbyOpportunity;
  onPress: () => void;
}

/** One capture task: what to capture, the reward range, and how far it is. */
export function OpportunityCard({ item, onPress }: OpportunityCardProps) {
  const { opportunity, distanceMeters } = item;
  const { min, max } = opportunity.rewardRange;

  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      {({ pressed }) => (
        <Card style={pressed ? styles.pressed : undefined}>
          <View style={styles.header}>
            <AppText variant="heading" style={styles.title}>
              {opportunity.title}
            </AppText>
            <AppText variant="caption" style={styles.reward}>
              {formatUsd(min)} – {formatUsd(max)}
            </AppText>
          </View>
          <AppText muted>{opportunity.description}</AppText>
          <View style={styles.meta}>
            <AppText variant="caption" muted>
              {distanceMeters === undefined ? 'Anywhere' : formatDistance(distanceMeters)}
            </AppText>
            <AppText variant="caption" muted>
              {opportunity.capturePrompts.length} guided shots
            </AppText>
          </View>
        </Card>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: { backgroundColor: colors.surfaceRaised },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  title: { flex: 1 },
  reward: { color: colors.accent, fontWeight: '600' },
  meta: { flexDirection: 'row', justifyContent: 'space-between' },
});
