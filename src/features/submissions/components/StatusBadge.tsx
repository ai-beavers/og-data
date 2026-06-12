import { StyleSheet, View } from 'react-native';

import { SUBMISSION_STATUS_META } from '@/features/submissions/submissionMeta';
import type { SubmissionStatus } from '@/shared/types';
import { AppText, radius, spacing } from '@/shared/ui';

/** Compact colored pill showing a submission's lifecycle state. */
export function StatusBadge({ status }: { status: SubmissionStatus }) {
  const meta = SUBMISSION_STATUS_META[status];
  return (
    <View style={[styles.badge, { borderColor: meta.color }]}>
      <View style={[styles.dot, { backgroundColor: meta.color }]} />
      <AppText variant="caption" style={{ color: meta.color }}>
        {meta.label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingVertical: spacing.xs / 2,
    paddingHorizontal: spacing.sm,
    alignSelf: 'flex-start',
  },
  dot: { width: 6, height: 6, borderRadius: radius.pill },
});
