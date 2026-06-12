import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { useCountUp } from '@/features/data-package/useCountUp';
import { AppText, colors, radius, spacing } from '@/shared/ui';

interface RewardMomentProps {
  rewardCents: number;
  keyFrameCount: number;
  trainingEpisodes: number;
}

/**
 * The payoff beat: "training data generated" with a pop-in, a pulsing glow,
 * and the reward counting up — so submitting feels like a win, not an upload.
 */
export function RewardMoment({
  rewardCents,
  keyFrameCount,
  trainingEpisodes,
}: RewardMomentProps) {
  const [pop] = useState(() => new Animated.Value(0));
  const [pulse] = useState(() => new Animated.Value(0));
  const cents = useCountUp(rewardCents, 1100, true);

  useEffect(() => {
    Animated.spring(pop, {
      toValue: 1,
      friction: 5,
      tension: 90,
      useNativeDriver: true,
    }).start();

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pop, pulse]);

  const scale = pop.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] });
  const glowScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.25] });
  const glowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] });

  return (
    <Animated.View style={[styles.container, { opacity: pop, transform: [{ scale }] }]}>
      <View style={styles.badgeWrap}>
        <Animated.View
          style={[styles.glow, { opacity: glowOpacity, transform: [{ scale: glowScale }] }]}
        />
        <View style={styles.badge}>
          <AppText style={styles.badgeGlyph}>✓</AppText>
        </View>
      </View>

      <AppText variant="title" style={styles.title}>
        Training data generated
      </AppText>
      <AppText muted style={styles.subtitle}>
        Your capture became a buyer-ready package.
      </AppText>

      <View style={styles.rewardRow}>
        <AppText variant="caption" muted>
          You earned
        </AppText>
        <AppText variant="title" style={styles.reward}>
          ${(cents / 100).toFixed(2)}
        </AppText>
      </View>

      <View style={styles.statsRow}>
        <Stat value={`${keyFrameCount}`} label="key frames" />
        <Stat value={`${trainingEpisodes}`} label={trainingEpisodes === 1 ? 'episode' : 'episodes'} />
      </View>
    </Animated.View>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <AppText variant="heading" style={styles.statValue}>
        {value}
      </AppText>
      <AppText variant="caption" muted>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  badgeWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs },
  glow: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
  badge: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeGlyph: { color: colors.background, fontSize: 30, fontWeight: '700' },
  title: { textAlign: 'center' },
  subtitle: { textAlign: 'center' },
  rewardRow: { alignItems: 'center', marginTop: spacing.sm },
  reward: { color: colors.accent, fontSize: 36 },
  statsRow: { flexDirection: 'row', gap: spacing.xl, marginTop: spacing.sm },
  stat: { alignItems: 'center' },
  statValue: { color: colors.textPrimary },
});
