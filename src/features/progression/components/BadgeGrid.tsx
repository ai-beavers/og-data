import { StyleSheet, View } from 'react-native';

import { ALL_BADGES } from '@/features/progression/progressionLogic';
import type { Badge } from '@/shared/types';
import { AppText, Card, colors, spacing } from '@/shared/ui';

interface BadgeGridProps {
  earned: Badge[];
}

/** All badges in a grid — earned ones lit, the rest shown as goals to chase. */
export function BadgeGrid({ earned }: BadgeGridProps) {
  const earnedIds = new Set(earned.map((b) => b.id));
  return (
    <View style={styles.grid}>
      {ALL_BADGES.map((badge) => {
        const isEarned = earnedIds.has(badge.id);
        return (
          <Card key={badge.id} style={isEarned ? styles.badge : styles.badgeLocked}>
            <AppText variant="body" style={isEarned ? styles.earnedName : undefined}>
              {badge.name}
            </AppText>
            <AppText variant="caption" muted>
              {badge.description}
            </AppText>
          </Card>
        );
      })}
    </View>
  );
}

const BADGE_WIDTH = '48%';

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  badge: { width: BADGE_WIDTH, borderColor: colors.accent },
  badgeLocked: { width: BADGE_WIDTH, opacity: 0.55 },
  earnedName: { color: colors.accent, fontWeight: '600' },
});
