import { useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { CameraStep } from '@/features/capture/CameraStep';
import { useFreeCaptureFlow, type FreeShot } from '@/features/capture/useFreeCaptureFlow';
import { AppButton, AppText, Card, Screen, colors, radius, spacing } from '@/shared/ui';

const CAPTURE_PROMPT = 'Capture anything around you — get close and fill the frame';

/**
 * M8 — Free Capture, the home screen. Camera-first: shoot one or more angles
 * of anything, review locally, submit. The app identifies what was captured
 * (AI vision + location metadata); the contributor never types.
 */
export function FreeCaptureScreen() {
  const flow = useFreeCaptureFlow();
  const [permission, requestPermission] = useCameraPermissions();

  const handleSubmit = async () => {
    await flow.submit();
    flow.reset();
    router.push('/(tabs)/submissions');
  };

  if (!permission) {
    return <Screen />;
  }

  if (!permission.granted) {
    return (
      <Screen>
        <Card>
          <AppText variant="heading">Ready when you are</AppText>
          <AppText muted>
            Point your camera at anything around you — objects, signs, storefronts —
            and earn for useful captures.
          </AppText>
        </Card>
        <AppButton label="Enable camera" onPress={() => requestPermission()} />
        {!permission.canAskAgain ? (
          <AppText variant="caption" muted>
            Camera access is blocked — enable it in system settings to capture.
          </AppText>
        ) : null}
      </Screen>
    );
  }

  if (flow.phase === 'camera') {
    return (
      <Screen>
        <CameraStep
          prompt={CAPTURE_PROMPT}
          shotCount={flow.shots.length}
          onCaptured={flow.addShot}
          onDone={flow.goToReview}
        />
      </Screen>
    );
  }

  const submitting = flow.phase === 'submitting';
  return (
    <Screen>
      <AppText variant="title">Check your capture</AppText>
      <AppText muted>
        We identify what you captured automatically — just make sure the shots are
        sharp and well lit.
      </AppText>
      <ScrollView contentContainerStyle={styles.grid}>
        {flow.shots.map((shot, index) => (
          <ShotThumb
            key={shot.media.id}
            shot={shot}
            disabled={submitting}
            onRemove={() => flow.removeShot(index)}
          />
        ))}
      </ScrollView>
      <AppButton
        label="Add another angle"
        variant="secondary"
        onPress={flow.backToCamera}
        disabled={submitting}
      />
      <AppButton
        label={submitting ? 'Identifying & submitting…' : 'Submit for review'}
        onPress={handleSubmit}
        disabled={submitting || flow.shots.length === 0}
      />
    </Screen>
  );
}

interface ShotThumbProps {
  shot: FreeShot;
  disabled: boolean;
  onRemove: () => void;
}

function ShotThumb({ shot, disabled, onRemove }: ShotThumbProps) {
  return (
    <View style={styles.thumbWrap}>
      <Image source={{ uri: shot.media.uri }} style={styles.thumb} contentFit="cover" />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Remove shot"
        onPress={onRemove}
        disabled={disabled}
        style={({ pressed }) => [styles.remove, pressed && styles.removePressed]}
      >
        <AppText variant="caption" style={styles.removeLabel}>
          Remove
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  thumbWrap: { gap: spacing.xs, alignItems: 'center' },
  thumb: {
    width: 104,
    height: 104,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceRaised,
  },
  remove: { paddingVertical: spacing.xs, paddingHorizontal: spacing.sm },
  removePressed: { opacity: 0.6 },
  removeLabel: { color: colors.danger, fontWeight: '600' },
});
