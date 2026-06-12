import { StyleSheet, View } from 'react-native';

import { colors, radius } from '@/shared/ui/tokens';

interface ProgressBarProps {
  /** Fill fraction, clamped to 0–1. */
  value: number;
  color?: string;
}

/** Thin horizontal progress bar used by the game layer and campaign views. */
export function ProgressBar({ value, color = colors.accent }: ProgressBarProps) {
  const clamped = Math.min(1, Math.max(0, value));
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${clamped * 100}%`, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceRaised,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radius.pill },
});
