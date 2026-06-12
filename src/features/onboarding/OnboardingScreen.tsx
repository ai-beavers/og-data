import { router } from 'expo-router';

import { AppButton, AppText, Card, Screen } from '@/shared/ui';

/**
 * M2 — Contributor Onboarding (Machine A).
 * Placeholder: explain the app, capture guidelines, and the simple framing
 * (find something nearby, capture it well, submit, earn).
 */
export function OnboardingScreen() {
  return (
    <Screen>
      <AppText variant="title">Welcome</AppText>
      <Card>
        <AppText>
          Capture everyday objects around you, submit them, and earn rewards.
        </AppText>
        <AppText variant="caption" muted>
          Owner: Machine A — full onboarding flow replaces this screen (M2).
        </AppText>
      </Card>
      <AppButton label="Get started" onPress={() => router.replace('/(tabs)')} />
    </Screen>
  );
}
