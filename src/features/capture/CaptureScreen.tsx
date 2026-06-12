import { useCameraPermissions } from 'expo-camera';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { CameraStep } from '@/features/capture/CameraStep';
import { CaptureBriefing } from '@/features/capture/CaptureBriefing';
import { CaptureReview } from '@/features/capture/CaptureReview';
import { useCaptureFlow, type CapturePhase } from '@/features/capture/useCaptureFlow';
import { AppButton, AppText, Card, Screen, colors, spacing } from '@/shared/ui';

/**
 * M4 — Guided Capture Flow (Machine A).
 * Briefing → one camera step per prompt → local review with retakes →
 * submit through the shared contract, then land on submission history.
 */
export function CaptureScreen() {
  const { opportunityId } = useLocalSearchParams<{ opportunityId: string }>();
  const flow = useCaptureFlow(opportunityId);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  const handleStart = async () => {
    if (cameraPermission?.granted) {
      flow.start();
      return;
    }
    const response = await requestCameraPermission();
    if (response.granted) {
      flow.start();
    }
  };

  const handleSubmit = async () => {
    await flow.submit();
    router.replace('/(tabs)/submissions');
  };

  const phase: CapturePhase = flow.phase;
  switch (phase) {
    case 'loading':
      return (
        <Screen>
          <ActivityIndicator color={colors.accent} style={styles.loader} />
        </Screen>
      );
    case 'not_found':
      return (
        <Screen>
          <Card>
            <AppText variant="heading">Task unavailable</AppText>
            <AppText muted>This capture task no longer exists.</AppText>
          </Card>
          <AppButton label="Back to opportunities" onPress={() => router.back()} />
        </Screen>
      );
    case 'briefing':
      return (
        <Screen>
          <CaptureBriefing opportunity={flow.opportunity!} onStart={handleStart} />
          {cameraPermission && !cameraPermission.granted && !cameraPermission.canAskAgain ? (
            <AppText variant="caption" muted>
              Camera access is blocked — enable it in system settings to capture.
            </AppText>
          ) : null}
        </Screen>
      );
    case 'camera':
      return (
        <Screen>
          <CameraStep
            prompt={flow.opportunity!.capturePrompts[flow.stepIndex]}
            stepNumber={flow.stepIndex + 1}
            totalSteps={flow.opportunity!.capturePrompts.length}
            onCaptured={flow.recordShot}
          />
        </Screen>
      );
    case 'review':
    case 'submitting':
      return (
        <Screen>
          <CaptureReview
            prompts={flow.opportunity!.capturePrompts}
            shots={flow.shots}
            submitting={phase === 'submitting'}
            onRetake={flow.retake}
            onSubmit={handleSubmit}
          />
        </Screen>
      );
    default: {
      const exhaustive: never = phase;
      throw new Error(`Unhandled capture phase: ${exhaustive}`);
    }
  }
}

const styles = StyleSheet.create({
  loader: { marginTop: spacing.xl },
});
