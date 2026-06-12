import { useEffect, useState } from 'react';
import { FlatList } from 'react-native';

import { api } from '@/shared/api';
import type { Opportunity } from '@/shared/types';
import { AppText, Card, Screen } from '@/shared/ui';

function formatRange(opportunity: Opportunity): string {
  const { min, max } = opportunity.rewardRange;
  return `$${(min.cents / 100).toFixed(2)} – $${(max.cents / 100).toFixed(2)}`;
}

/**
 * M3 — Nearby Capture Opportunities (Machine A).
 * Minimal working list over the seeded mock API. Serves as the reference
 * pattern for consuming `api` from feature screens; Machine A extends this
 * with location-driven ordering and the capture entry point.
 */
export function OpportunitiesScreen() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);

  useEffect(() => {
    api.listOpportunities().then(setOpportunities);
  }, []);

  return (
    <Screen>
      <AppText variant="title">Nearby opportunities</AppText>
      <FlatList
        data={opportunities}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 12 }}
        renderItem={({ item }) => (
          <Card>
            <AppText variant="heading">{item.title}</AppText>
            <AppText muted>{item.description}</AppText>
            <AppText variant="caption">Reward: {formatRange(item)}</AppText>
          </Card>
        )}
      />
    </Screen>
  );
}
