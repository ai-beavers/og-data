import { StyleSheet, View } from 'react-native';

import type { LeaderboardEntry } from '@/shared/types';
import { AppText, Card, colors, spacing } from '@/shared/ui';

interface LeaderboardListProps {
  entries: LeaderboardEntry[];
}

/** Friendly ranking by accepted captures; the current contributor is lit. */
export function LeaderboardList({ entries }: LeaderboardListProps) {
  return (
    <Card style={styles.card}>
      {entries.map((entry) => (
        <View key={entry.contributorId} style={styles.row}>
          <AppText
            variant="body"
            style={[styles.rank, entry.isCurrentUser && styles.current]}
          >
            {entry.rank}
          </AppText>
          <AppText
            variant="body"
            style={[styles.name, entry.isCurrentUser && styles.current]}
          >
            {entry.displayName}
          </AppText>
          <AppText variant="caption" muted>
            {entry.acceptedCount === 1 ? '1 capture' : `${entry.acceptedCount} captures`}
          </AppText>
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.sm + spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rank: { width: spacing.lg, color: colors.textSecondary },
  name: { flex: 1 },
  current: { color: colors.accent, fontWeight: '600' },
});
