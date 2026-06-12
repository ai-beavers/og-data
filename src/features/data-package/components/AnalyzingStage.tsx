import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import type { AnalysisStep } from '@/features/data-package/dataPackage';
import { AppText, Card, colors, radius, spacing } from '@/shared/ui';

interface AnalyzingStageProps {
  subject: string;
  steps: AnalysisStep[];
  onComplete: () => void;
}

const STEP_INTERVAL_MS = 520;
const HOLD_AFTER_LAST_MS = 420;

/**
 * The "robot is looking at your capture" moment: a looping scan over a target
 * reticle while detection steps tick off, then hands control back to reveal
 * the finished package.
 */
export function AnalyzingStage({ subject, steps, onComplete }: AnalyzingStageProps) {
  const [doneCount, setDoneCount] = useState(0);
  const [scan] = useState(() => new Animated.Value(0));
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(scan, {
        toValue: 1,
        duration: 1100,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    );
    loop.start();

    const total = steps.length * STEP_INTERVAL_MS;
    Animated.timing(progress, {
      toValue: 1,
      duration: total,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();

    const timers = steps.map((_, index) =>
      setTimeout(() => setDoneCount(index + 1), STEP_INTERVAL_MS * (index + 1)),
    );
    const finish = setTimeout(onComplete, total + HOLD_AFTER_LAST_MS);

    return () => {
      loop.stop();
      timers.forEach(clearTimeout);
      clearTimeout(finish);
    };
  }, [steps, scan, progress, onComplete]);

  const scanTranslate = scan.interpolate({
    inputRange: [0, 1],
    outputRange: [6, 150],
  });
  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['4%', '100%'],
  });

  return (
    <View style={styles.container}>
      <AppText variant="title">Generating training data…</AppText>
      <AppText muted>Turning your capture of a {subject.toLowerCase()} into a robot-ready package.</AppText>

      <View style={styles.reticle}>
        <Animated.View
          style={[styles.scanLine, { transform: [{ translateY: scanTranslate }] }]}
        />
        <View style={[styles.corner, styles.tl]} />
        <View style={[styles.corner, styles.tr]} />
        <View style={[styles.corner, styles.bl]} />
        <View style={[styles.corner, styles.br]} />
        <AppText variant="caption" style={styles.reticleLabel}>
          {subject}
        </AppText>
      </View>

      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width: progressWidth }]} />
      </View>

      <Card>
        {steps.map((step, index) => {
          const done = index < doneCount;
          const active = index === doneCount;
          return (
            <View key={step.id} style={styles.stepRow}>
              <View style={[styles.tick, done && styles.tickDone, active && styles.tickActive]}>
                {done ? <AppText style={styles.tickMark}>✓</AppText> : null}
              </View>
              <AppText muted={!done} style={done ? styles.stepDone : undefined}>
                {step.label}
              </AppText>
            </View>
          );
        })}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: spacing.md },
  reticle: {
    height: 180,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanLine: {
    position: 'absolute',
    top: 0,
    left: '8%',
    right: '8%',
    height: 2,
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOpacity: 0.8,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  corner: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderColor: colors.accent,
  },
  tl: { top: spacing.md, left: spacing.md, borderTopWidth: 2, borderLeftWidth: 2 },
  tr: { top: spacing.md, right: spacing.md, borderTopWidth: 2, borderRightWidth: 2 },
  bl: { bottom: spacing.md, left: spacing.md, borderBottomWidth: 2, borderLeftWidth: 2 },
  br: { bottom: spacing.md, right: spacing.md, borderBottomWidth: 2, borderRightWidth: 2 },
  reticleLabel: {
    color: colors.accent,
    fontWeight: '700',
    letterSpacing: 1,
  },
  track: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceRaised,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.accent },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  tick: {
    width: 20,
    height: 20,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tickActive: { borderColor: colors.accent },
  tickDone: { backgroundColor: colors.accent, borderColor: colors.accent },
  tickMark: { color: colors.background, fontSize: 12, fontWeight: '700' },
  stepDone: { color: colors.textPrimary },
});
