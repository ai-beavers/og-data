import { StyleSheet, View } from 'react-native';

import { CAPTURE_DEPTH_LABEL } from '@/features/campaigns/campaignLogic';
import { formatMoneyRange } from '@/features/submissions/submissionMeta';
import type { Campaign, CampaignProgress, CampaignStatus } from '@/shared/types';
import { AppText, Card, colors, ProgressBar, spacing } from '@/shared/ui';

const STATUS_META: Record<CampaignStatus, { label: string; color: string }> = {
  draft: { label: 'Draft', color: colors.textSecondary },
  active: { label: 'Active', color: colors.accent },
  completed: { label: 'Completed', color: colors.success },
};

interface CampaignCardProps {
  campaign: Campaign;
  /** Null while progress is still loading. */
  progress: CampaignProgress | null;
}

/** One campaign with requester-facing fulfilment progress (P2). */
export function CampaignCard({ campaign, progress }: CampaignCardProps) {
  const status = STATUS_META[campaign.status];
  const fraction = progress ? progress.acceptedCount / campaign.targetAcceptedCount : 0;

  return (
    <Card>
      <View style={styles.header}>
        <AppText variant="heading" style={styles.title}>
          {campaign.name}
        </AppText>
        <AppText variant="caption" style={{ color: status.color, fontWeight: '600' }}>
          {status.label}
        </AppText>
      </View>
      <AppText variant="caption" muted>
        {campaign.requester} · {campaign.category} · {CAPTURE_DEPTH_LABEL[campaign.captureDepth]} ·{' '}
        {formatMoneyRange(campaign.rewardRange.min, campaign.rewardRange.max)}
      </AppText>

      <ProgressBar value={fraction} color={status.color} />
      <View style={styles.counts}>
        <AppText variant="caption" muted>
          {progress
            ? `${progress.acceptedCount} of ${campaign.targetAcceptedCount} accepted`
            : '—'}
        </AppText>
        <AppText variant="caption" muted>
          {progress ? `${progress.submittedCount} submitted` : ''}
        </AppText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  title: { flex: 1 },
  counts: { flexDirection: 'row', justifyContent: 'space-between' },
});
