import { CameraView } from 'expo-camera';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, colors, radius, spacing } from '@/shared/ui';

interface CameraStepProps {
  prompt: string;
  stepNumber: number;
  totalSteps: number;
  onCaptured: (uri: string) => void;
}

/**
 * One guided shot: live camera preview with the current prompt overlaid,
 * written for non-technical contributors.
 */
export function CameraStep({ prompt, stepNumber, totalSteps, onCaptured }: CameraStepProps) {
  const cameraRef = useRef<CameraView>(null);
  const [ready, setReady] = useState(false);
  const [taking, setTaking] = useState(false);

  const takePicture = async () => {
    if (!ready || taking) return;
    setTaking(true);
    try {
      const picture = await cameraRef.current?.takePictureAsync({ quality: 0.8 });
      if (picture) {
        onCaptured(picture.uri);
      }
    } finally {
      setTaking(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        onCameraReady={() => setReady(true)}
      />
      <View style={styles.promptOverlay}>
        <AppText variant="caption" style={styles.stepLabel}>
          Shot {stepNumber} of {totalSteps}
        </AppText>
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
});
