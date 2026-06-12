import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import type { BoundingBox, FrameAnalysis } from '@/features/data-package/dataPackage';
import { AppText, colors, radius, spacing } from '@/shared/ui';

interface RobotVisionCardProps {
  frame: FrameAnalysis;
  index: number;
}

/** Convert a 0–1 fraction to a percentage string for absolute positioning. */
function pct(value: number): `${number}%` {
  return `${Math.round(value * 100)}%`;
}

/**
 * A captured frame seen "through the robot's eyes": the source image with
 * animated detection boxes, a looping scan line, and per-frame angle label.
 */
export function RobotVisionCard({ frame, index }: RobotVisionCardProps) {
  const [scan] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scan, {
          toValue: 1,
          duration: 1600,
          delay: index * 220,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scan, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [scan, index]);

  return (
    <View style={styles.frame}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: frame.uri }} style={StyleSheet.absoluteFill} contentFit="cover" />
        <View style={styles.imageTint} />
        {frame.boxes.map((box, boxIndex) => (
          <DetectionBox key={box.label + boxIndex} box={box} delay={index * 200 + boxIndex * 160} />
        ))}
        <Animated.View
          style={[
            styles.scanLine,
            {
              transform: [
                {
                  translateY: scan.interpolate({ inputRange: [0, 1], outputRange: [0, 150] }),
                },
              ],
              opacity: scan.interpolate({ inputRange: [0, 0.1, 0.9, 1], outputRange: [0, 1, 1, 0] }),
            },
          ]}
        />
        <View style={styles.angleTag}>
          <AppText variant="caption" style={styles.angleText}>
            {frame.angleLabel}
          </AppText>
        </View>
      </View>
    </View>
  );
}

function DetectionBox({ box, delay }: { box: BoundingBox; delay: number }) {
  const [anim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.spring(anim, {
      toValue: 1,
      delay,
      useNativeDriver: true,
      friction: 6,
      tension: 80,
    }).start();
  }, [anim, delay]);

  return (
    <Animated.View
      style={[
        styles.box,
        {
          left: pct(box.x),
          top: pct(box.y),
          width: pct(box.width),
          height: pct(box.height),
          opacity: anim,
          transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }],
        },
      ]}
    >
      <View style={styles.boxLabel}>
        <AppText variant="caption" style={styles.boxLabelText}>
          {box.label} {(box.confidence * 100).toFixed(0)}%
        </AppText>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  frame: { gap: spacing.xs },
  imageWrap: {
    height: 200,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
  },
  imageTint: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(14,17,22,0.25)',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 2,
    backgroundColor: colors.accent,
    opacity: 0.9,
  },
  box: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: colors.accent,
    borderRadius: radius.sm,
  },
  boxLabel: {
    position: 'absolute',
    top: -18,
    left: -2,
    backgroundColor: colors.accent,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
  },
  boxLabelText: { color: colors.background, fontWeight: '700', fontSize: 11 },
  angleTag: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    backgroundColor: 'rgba(14,17,22,0.7)',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  angleText: { color: colors.textPrimary, fontWeight: '600' },
});
