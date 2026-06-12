import { Image } from 'expo-image';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import type { CapturedMedia } from '@/shared/types';
import { AppButton, AppText, Card, colors, radius, spacing } from '@/shared/ui';

interface CaptureReviewProps {
  prompts: string[];
  shots: (CapturedMedia | null)[];
  submitting: boolean;
  onRetake: (index: number) => void;
  onSubmit: () => void;
}

/** M4 local review: check every shot against its prompt before submitting. */
export function CaptureReview({
  prompts,
  shots,
  submitting,
  onRetake,
  onSubmit,
}: CaptureReviewProps) {
  return (
    <View style={styles.container}>
      <AppText variant="title">Check your shots</AppText>
      <AppText muted>Blurry or badly lit shots get sent back — retake them now.</AppText>
      <ScrollView contentContainerStyle={styles.list}>
        {prompts.map((prompt, index) => {
          const shot = shots[index];
          return (
            <Card key={prompt} style={styles.row}>
              {shot ? (
                <Image source={{ uri: shot.uri }} style={styles.thumbnail} contentFit="cover" />
              ) : (
                <View style={[styles.thumbnail, styles.missing]} />
              )}
              <View style={styles.rowBody}>
                <AppText variant="caption" muted>
                  Shot {index + 1}
                </AppText>
                <AppText numberOfLines={3}>{prompt}</AppText>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => onRetake(index)}
                  disabled={submitting}
                >
                  <AppText variant="caption" style={styles.retake}>
                    Retake
                  </AppText>
                </Pressable>
              </View>
            </Card>
          );
        })}
      </ScrollView>
      <AppButton
        label={submitting ? 'Submitting…' : 'Submit for review'}
        onPress={onSubmit}
        disabled={submitting}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: spacing.md },
  list: { gap: spacing.md, paddingBottom: spacing.lg },
  row: { flexDirection: 'row', gap: spacing.md },
  rowBody: { flex: 1, gap: spacing.xs, alignItems: 'flex-start' },
  thumbnail: {
    width: 88,
    height: 88,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceRaised,
  },
  missing: { borderWidth: 1, borderColor: colors.border },
  retake: { color: colors.accent, fontWeight: '600' },
});
