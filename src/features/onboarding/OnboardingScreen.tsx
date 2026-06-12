import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { markOnboardingSeen } from '@/features/onboarding/onboardingStatus';
import { onboardingSteps } from '@/features/onboarding/onboardingContent';
import { AppButton, AppText, Card, Screen, colors, radius, spacing } from '@/shared/ui';

/**
 * M2 — Contributor Onboarding (Machine A).
 * Three short steps: what the app is, the capture rules, and the core loop.
 * Completing it persists the seen flag so the entry route skips straight to tabs.
 */
export function OnboardingScreen() {
  const [stepIndex, setStepIndex] = useState(0);
  const step = onboardingSteps[stepIndex];
  const isLast = stepIndex === onboardingSteps.length - 1;

  const finish = async () => {
    await markOnboardingSeen();
    router.replace('/(tabs)');
  };

  return (
    <Screen>
      <View style={styles.body}>
        <AppText variant="title">{step.title}</AppText>
        <AppText muted>{step.intro}</AppText>
        <Card>
          {step.bullets.map((bullet) => (
            <AppText key={bullet}>{bullet}</AppText>
          ))}
        </Card>
        {step.footnote ? (
          <AppText variant="caption" muted>
            {step.footnote}
          </AppText>
        ) : null}
      </View>

      <View style={styles.dots}>
        {onboardingSteps.map((s, i) => (
          <View key={s.title} style={[styles.dot, i === stepIndex && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.actions}>
        {stepIndex > 0 ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => setStepIndex(stepIndex - 1)}
            style={styles.back}
          >
            <AppText muted>Back</AppText>
          </Pressable>
        ) : null}
        <View style={styles.next}>
          <AppButton
            label={isLast ? 'Get started' : 'Next'}
            onPress={isLast ? finish : () => setStepIndex(stepIndex + 1)}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, gap: spacing.md, justifyContent: 'center' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
  },
  dotActive: { backgroundColor: colors.accent },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  back: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  next: { flex: 1 },
});
