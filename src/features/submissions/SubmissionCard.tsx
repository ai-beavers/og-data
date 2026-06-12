import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { StatusBadge } from '@/features/submissions/components/StatusBadge';
import {
  formatMoney,
  formatSubmittedAt,
  REJECTION_REASON_COPY,
  SUBMISSION_STATUS_META,
} from '@/features/submissions/submissionMeta';
import type { Submission } from '@/shared/types';
import { AppButton, AppText, Card, colors, spacing } from '@/shared/ui';

interface SubmissionCardProps {
  submission: Submission;
  /** Resolved opportunity title; falls back to category when unknown. */
  title: string;
}

/**
 * One row of submission history (M5): what was captured, where it is in the
 * review lifecycle, plain-language feedback, and a retry entry point.
 */
export function SubmissionCard({ submission, title }: SubmissionCardProps) {
  const router = useRouter();
  const meta = SUBMISSION_STATUS_META[submission.status];
  const mediaLabel =
    submission.media.length === 1 ? '1 capture' : `${submission.media.length} captures`;

  return (
    <Card>
      <View style={styles.headerRow}>
        <AppText variant="heading" style={styles.title} numberOfLines={1}>
          {title}
        </AppText>
        <StatusBadge status={submission.status} />
      </View>

      <AppText variant="caption" muted>
        {formatSubmittedAt(submission.submittedAt)} · {mediaLabel}
      </AppText>

      <AppText variant="caption" muted>
        {meta.hint}
      </AppText>

      {submission.rejectionReason ? (
        <AppText variant="body" style={{ color: meta.color }}>
          {REJECTION_REASON_COPY[submission.rejectionReason]}
        </AppText>
      ) : null}

      {submission.reviewNote ? (
        <AppText variant="caption" muted>
          Reviewer: “{submission.reviewNote}”
        </AppText>
      ) : null}

      {submission.reward ? (
        <AppText variant="body" style={styles.reward}>
          Reward: {formatMoney(submission.reward.amount)}
        </AppText>
      ) : null}

      {submission.status === 'needs_retry' ? (
        <AppButton
          label="Retry capture"
          onPress={() => router.push(`/capture/${submission.opportunityId}`)}
        />
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: { flexShrink: 1 },
  reward: { color: colors.success },
});
