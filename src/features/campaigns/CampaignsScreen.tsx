import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { CampaignCard } from '@/features/campaigns/CampaignCard';
import { CampaignForm } from '@/features/campaigns/CampaignForm';
import { api } from '@/shared/api';
import type { Campaign, CampaignProgress, NewCampaignInput } from '@/shared/types';
import { AppButton, AppText, Screen, spacing } from '@/shared/ui';

/**
 * P2 — Data Request Campaigns (operator/buyer-facing).
 * Define needed data and watch fulfilment progress. Active campaigns
 * automatically surface to contributors as ordinary opportunities.
 * Not linked from contributor navigation, same as the review queue.
 */
export function CampaignsScreen() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [progressById, setProgressById] = useState<Record<string, CampaignProgress>>({});
  const [showForm, setShowForm] = useState(false);

  const reload = useCallback(() => {
    let cancelled = false;
    api.listCampaigns().then(async (list) => {
      const progress = await Promise.all(list.map((c) => api.getCampaignProgress(c.id)));
      if (cancelled) return;
      setCampaigns(list);
      setProgressById(Object.fromEntries(progress.map((p) => [p.campaignId, p])));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useFocusEffect(reload);

  async function create(input: NewCampaignInput) {
    await api.createCampaign(input);
    setShowForm(false);
    reload();
  }

  return (
    <Screen>
      <View style={styles.header}>
        <AppText variant="title" style={styles.headerTitle}>
          Campaigns
        </AppText>
        <AppButton
          label={showForm ? 'Close' : 'New campaign'}
          onPress={() => setShowForm((v) => !v)}
        />
      </View>
      <AppText variant="caption" muted>
        Buyer data requests. Active campaigns appear to contributors as capture tasks.
      </AppText>

      <FlatList
        data={campaigns}
        keyExtractor={(c) => c.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={showForm ? <CampaignForm onCreate={create} /> : null}
        renderItem={({ item }) => (
          <CampaignCard campaign={item} progress={progressById[item.id] ?? null} />
        )}
        ListEmptyComponent={
          showForm ? null : (
            <AppText muted>No campaigns yet. Create one to request data.</AppText>
          )
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerTitle: { flex: 1 },
  list: { gap: spacing.md, paddingBottom: spacing.xl },
});
