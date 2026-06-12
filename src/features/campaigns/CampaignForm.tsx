import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { CAPTURE_DEPTH_LABEL } from '@/features/campaigns/campaignLogic';
import type { CaptureDepth, NewCampaignInput } from '@/shared/types';
import { AppButton, AppText, Card, colors, radius, spacing } from '@/shared/ui';

const CAPTURE_DEPTHS = Object.keys(CAPTURE_DEPTH_LABEL) as CaptureDepth[];

interface CampaignFormProps {
  onCreate: (input: NewCampaignInput) => void;
}

/** "outdoors, daylight" → ['outdoors', 'daylight'] */
function splitList(text: string): string[] {
  return text
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

/** "1.50" → 150 cents; null when not a positive dollar amount. */
function parseDollars(text: string): number | null {
  const value = Number(text);
  if (!Number.isFinite(value) || value <= 0) return null;
  return Math.round(value * 100);
}

/**
 * P2 — minimal operator form for defining a data request campaign.
 * Free-text lists keep it fast; the campaign logic turns everything into
 * contributor-friendly guidance.
 */
export function CampaignForm({ onCreate }: CampaignFormProps) {
  const [name, setName] = useState('');
  const [requester, setRequester] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [environments, setEnvironments] = useState('');
  const [quality, setQuality] = useState('');
  const [depth, setDepth] = useState<CaptureDepth>('standard');
  const [rewardMin, setRewardMin] = useState('0.50');
  const [rewardMax, setRewardMax] = useState('2.00');
  const [target, setTarget] = useState('20');

  const minCents = parseDollars(rewardMin);
  const maxCents = parseDollars(rewardMax);
  const targetCount = Number.parseInt(target, 10);
  const valid =
    name.trim() !== '' &&
    requester.trim() !== '' &&
    category.trim() !== '' &&
    description.trim() !== '' &&
    minCents !== null &&
    maxCents !== null &&
    minCents <= maxCents &&
    Number.isInteger(targetCount) &&
    targetCount > 0;

  function submit() {
    if (!valid || minCents === null || maxCents === null) return;
    onCreate({
      name: name.trim(),
      requester: requester.trim(),
      category: category.trim().toLowerCase().replaceAll(' ', '_'),
      description: description.trim(),
      environments: splitList(environments),
      captureDepth: depth,
      qualityExpectations: splitList(quality),
      rewardRange: {
        min: { cents: minCents, currency: 'USD' },
        max: { cents: maxCents, currency: 'USD' },
      },
      targetAcceptedCount: targetCount,
    });
  }

  return (
    <Card>
      <AppText variant="heading">New campaign</AppText>
      <Field value={name} onChangeText={setName} placeholder="Task name, e.g. Capture storefront doors" />
      <Field value={requester} onChangeText={setRequester} placeholder="Requester (buyer name)" />
      <Field value={category} onChangeText={setCategory} placeholder="Category, e.g. storefronts" />
      <Field value={description} onChangeText={setDescription} placeholder="What to capture, in plain language" />
      <Field value={environments} onChangeText={setEnvironments} placeholder="Environments, comma-separated (optional)" />
      <Field value={quality} onChangeText={setQuality} placeholder="Quality expectations, comma-separated (optional)" />

      <AppText variant="caption" muted>
        Capture depth
      </AppText>
      <View style={styles.row}>
        {CAPTURE_DEPTHS.map((d) => (
          <Pressable
            key={d}
            accessibilityRole="button"
            onPress={() => setDepth(d)}
            style={[styles.chip, depth === d && styles.chipActive]}
          >
            <AppText
              variant="caption"
              style={{ color: depth === d ? colors.background : colors.accent }}
            >
              {CAPTURE_DEPTH_LABEL[d]}
            </AppText>
          </Pressable>
        ))}
      </View>

      <View style={styles.row}>
        <View style={styles.flexField}>
          <AppText variant="caption" muted>
            Reward min ($)
          </AppText>
          <Field value={rewardMin} onChangeText={setRewardMin} keyboardType="decimal-pad" />
        </View>
        <View style={styles.flexField}>
          <AppText variant="caption" muted>
            Reward max ($)
          </AppText>
          <Field value={rewardMax} onChangeText={setRewardMax} keyboardType="decimal-pad" />
        </View>
        <View style={styles.flexField}>
          <AppText variant="caption" muted>
            Target accepted
          </AppText>
          <Field value={target} onChangeText={setTarget} keyboardType="number-pad" />
        </View>
      </View>

      <AppButton label="Launch campaign" onPress={submit} disabled={!valid} />
      <AppText variant="caption" muted>
        Active campaigns appear to contributors as ordinary capture tasks.
      </AppText>
    </Card>
  );
}

function Field(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={colors.textSecondary}
      style={styles.input}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  flexField: { flex: 1, gap: spacing.xs, minWidth: 90 },
  chip: {
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm + spacing.xs,
  },
  chipActive: { backgroundColor: colors.accent },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceRaised,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
});
