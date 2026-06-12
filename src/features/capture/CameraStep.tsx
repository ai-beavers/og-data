import { CameraView } from 'expo-camera';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, colors, radius, spacing } from '@/shared/ui';

interface CameraStepProps {
  prompt: string;
  /** Guided flow only — when both are set the "Shot x of y" counter shows. */
  stepNumber?: number;
  totalSteps?: number;
  /** Free capture: shots taken so far, shown next to the done action. */
  shotCount?: number;
  onCaptured: (uri: string, base64?: string) => void;
  /** Free capture: finish shooting and move to review. */
  onDone?: () => void;
}

/**
 * One camera shot with the current guidance overlaid, written for
 * non-technical contributors. Used by both the guided flow (M4, one step per
 * prompt) and free capture (M8, shoot as many angles as you like).
 */
export function CameraStep({
  prompt,
  stepNumber,
  totalSteps,
  shotCount,
  onCaptured,
  onDone,
}: CameraStepProps) {
  const cameraRef = useRef<CameraView>(null);
  const [ready, setReady] = useState(false);
  const [taking, setTaking] = useState(false);

  const takePicture = async () => {
    if (!ready || taking) return;
    setTaking(true);
    try {
      const picture = await cameraRef.current?.takePictureAsync({
        quality: 0.8,
        base64: true,
      });
      if (picture) {
        onCaptured(picture.uri, picture.base64 ?? undefined);
      }
    } finally {
      setTaking(false);
    }
  };

  const showDone = onDone !== undefined && (shotCount ?? 0) > 0;

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        onCameraReady={() => setReady(true)}
      />
      <View style={styles.promptOverlay}>
        {stepNumber !== undefined && totalSteps !== undefined ? (
          <AppText variant="caption" style={styles.stepLabel}>
            Shot {stepNumber} of {totalSteps}
          </AppText>
        ) : null}
        <AppText variant="heading">{prompt}</AppText>
      </View>
      <View style={styles.controls}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Take photo"
          onPress={takePicture}
          disabled={!ready || taking}
          style={({ pressed }) => [
            styles.shutter,
            (pressed || taking) && styles.shutterPressed,
            !ready && styles.shutterDisabled,
          ]}
        />
        {showDone ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Finish capturing"
            onPress={onDone}
            style={({ pressed }) => [styles.doneButton, pressed && styles.donePressed]}
          >
            <AppText variant="caption" style={styles.doneLabel}>
              Done ({shotCount})
            </AppText>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1, borderRadius: radius.lg, overflow: 'hidden' },
  promptOverlay: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: `${colors.background}E6`,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  stepLabel: { color: colors.accent, fontWeight: '600' },
  controls: {
    position: 'absolute',
    bottom: spacing.lg,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutter: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    backgroundColor: colors.textPrimary,
    borderWidth: 4,
    borderColor: colors.border,
  },
  shutterPressed: { backgroundColor: colors.textSecondary },
  shutterDisabled: { opacity: 0.4 },
  doneButton: {
    position: 'absolute',
    right: spacing.lg,
    backgroundColor: `${colors.background}E6`,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.accent,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  donePressed: { opacity: 0.7 },
  doneLabel: { color: colors.accent, fontWeight: '600' },
});
