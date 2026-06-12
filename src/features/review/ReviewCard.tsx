import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import {
  formatMoney,
  formatSubmittedAt,
  REJECTION_REASON_COPY,
} from '@/features/submissions/submissionMeta';
import type {
  MoneyAmount,
  Opportunity,
  RejectionReason,
  ReviewDecision,
  Submission,
} from '@/shared/types';
import { AppButton, AppText, Card, colors, radius, spacing } from '@/shared/ui';

type DecisionMode = 'accept' | 'needs_retry' | 'reject';

const REJECTION_REASONS = Object.keys(REJECTION_REASON_COPY) as RejectionReason[];

interface ReviewCardProps {
  submission: Submission;
  /** Opportunity backing this submission, used for title and reward presets. */
  opportunity: Opportunity | null;
  onDecide: (decision: ReviewDecision) => void;
}

/** Fallback presets when the opportunity (and its reward range) is unknown. */
const DEFAULT_REWARD_PRESETS: MoneyAmount[] = [
  { cents: 50, currency: 'USD' },
  { cents: 100, currency: 'USD' },
  { cents: 150, currency: 'USD' },
];

function rewardPresets(opportunity: Opportunity | null): MoneyAmount[] {
  if (!opportunity) return DEFAULT_REWARD_PRESETS;
  const { min, max } = opportunity.rewardRange;
  const mid = Math.round((min.cents + max.cents) / 2);
  return [min, { cents: mid, currency: 'USD' }, max];
}

/**
 * One pending submission in the operator queue (M6): capture context plus an
 * inline decision flow — accept with a reward, or retry/reject with a
 * plain-language reason and optional note.
 */
export function ReviewCard({ submission, opportunity, onDecide }: ReviewCardProps) {
  const [mode, setMode] = useState<DecisionMode | null>(null);
  const [reason, setReason] = useState<RejectionReason | null>(null);
  const [note, setNote] = useState('');

  const title = opportunity?.title ?? submission.category.replaceAll('_', ' ');
  const reviewNote = note.trim() === '' ? undefined : note.trim();

  function selectMode(next: DecisionMode) {
    setMode((current) => (current === next ? null : next));
    setReason(null);
  }

  function confirmReason() {
    if (!reason || (mode !== 'needs_retry' && mode !== 'reject')) return;
    onDecide({ outcome: mode, reason, reviewNote });
  }

  return (
    <Card>
      <AppText variant="heading">{title}</AppText>
      <AppText variant="caption" muted>
        {formatSubmittedAt(submission.submittedAt)} · {submission.media.length} media ·{' '}
        {submission.contributorId}
        {submission.location
          ? ` · ${submission.location.latitude.toFixed(3)}, ${submission.location.longitude.toFixed(3)}`
          : ''}
      </AppText>

      <View style={styles.actionsRow}>
        <ModeChip label="Accept" color={colors.success} active={mode === 'accept'} onPress={() => selectMode('accept')} />
        <ModeChip label="Needs retry" color={colors.warning} active={mode === 'needs_retry'} onPress={() => selectMode('needs_retry')} />
        <ModeChip label="Reject" color={colors.danger} active={mode === 'reject'} onPress={() => selectMode('reject')} />
      </View>

      {mode !== null ? (
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Optional note to the contributor"
          placeholderTextColor={colors.textSecondary}
          style={styles.noteInput}
        />
      ) : null}

      {mode === 'accept' ? (
        <View style={styles.actionsRow}>
          {rewardPresets(opportunity).map((amount) => (
            <View key={amount.cents} style={styles.rewardButton}>
              <AppButton
                label={formatMoney(amount)}
                onPress={() => onDecide({ outcome: 'accept', reward: amount, reviewNote })}
              />
            </View>
          ))}
        </View>
      ) : null}

      {mode === 'needs_retry' || mode === 'reject' ? (
        <>
          <View style={styles.reasonsWrap}>
            {REJECTION_REASONS.map((r) => (
              <ModeChip
                key={r}
                label={REJECTION_REASON_COPY[r]}
                color={mode === 'reject' ? colors.danger : colors.warning}
                active={reason === r}
                onPress={() => setReason(r)}
              />
            ))}
          </View>
          <AppButton
            label={mode === 'reject' ? 'Confirm rejection' : 'Send back for retry'}
            onPress={confirmReason}
            disabled={reason === null}
          />
        </>
      ) : null}
    </Card>
  );
}

interface ModeChipProps {
  label: string;
  color: string;
  active: boolean;
  onPress: () => void;
}

function ModeChip({ label, color, active, onPress }: ModeChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.chip, { borderColor: color }, active && { backgroundColor: color }]}
    >
      <AppText variant="caption" style={{ color: active ? colors.background : color }}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  actionsRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  reasonsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  rewardButton: { flexGrow: 1 },
  chip: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm + spacing.xs,
  },
  noteInput: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceRaised,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
});
