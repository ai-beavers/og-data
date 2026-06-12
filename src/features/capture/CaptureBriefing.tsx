import { StyleSheet, View } from 'react-native';

import type { Opportunity } from '@/shared/types';
import { AppButton, AppText, Card, spacing } from '@/shared/ui';

interface CaptureBriefingProps {
  opportunity: Opportunity;
  onStart: () => void;
}

/** Pre-camera briefing: what to capture and the shots the flow will guide. */
export function CaptureBriefing({ opportunity, onStart }: CaptureBriefingProps) {
  return (
    <View style={styles.container}>
      <View style={styles.body}>
        <AppText variant="title">{opportunity.title}</AppText>
        <AppText muted>{opportunity.description}</AppText>
        <Card>
          <AppText variant="heading">{`You\u2019ll be guided through ${opportunity.capturePrompts.length} shots`}</AppText>
          {opportunity.capturePrompts.map((prompt, i) => (
            <AppText key={prompt} muted>
              {i + 1}. {prompt}
            </AppText>
          ))}
        </Card>
        <AppText variant="caption" muted>
          Keep people, faces, and license plates out of frame.
        </AppText>
      </View>
      <AppButton label="Start capturing" onPress={onStart} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: spacing.md },
  body: { flex: 1, gap: spacing.md },
});
