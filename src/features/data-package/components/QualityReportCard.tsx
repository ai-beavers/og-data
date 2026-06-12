import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import type { QualityReport } from '@/features/data-package/dataPackage';
import { useCountUp } from '@/features/data-package/useCountUp';
import { AppText, Card, colors, radius, spacing } from '@/shared/ui';

interface QualityReportCardProps {
  quality: QualityReport;
}

const GRADE_COLOR: Record<QualityReport['grade'], string> = {
  A: colors.success,
  B: colors.accent,
  C: colors.warning,
};

/** Quality summary: overall score counts up, each metric bar fills in. */
export function QualityReportCard({ quality }: QualityReportCardProps) {
  const percent = useCountUp(Math.round(quality.overall * 100), 900, true);

  return (
    <Card>
      <View style={styles.header}>
        <View>
          <AppText variant="heading">Capture quality</AppText>
          <AppText variant="caption" muted>
            Buyer-grade threshold: 70%
          </AppText>
        </View>
        <View style={[styles.gradeBadge, { borderColor: GRADE_COLOR[quality.grade] }]}>
          <AppText variant="title" style={[styles.gradeText, { color: GRADE_COLOR[quality.grade] }]}>
            {quality.grade}
          </AppText>
        </View>
      </View>

      <AppText variant="title" style={[styles.score, { color: GRADE_COLOR[quality.grade] }]}>
        {percent}%
      </AppText>

      {quality.metrics.map((metric) => (
        <View key={metric.id} style={styles.metricRow}>
          <View style={styles.metricLabel}>
            <AppText variant="caption">{metric.label}</AppText>
            <AppText variant="caption" muted>
              {(metric.score * 100).toFixed(0)}%
            </AppText>
          </View>
          <MetricBar score={metric.score} />
        </View>
      ))}
    </Card>
  );
}

function MetricBar({ score }: { score: number }) {
  const [anim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(anim, {
      toValue: score,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [anim, score]);

  const width = anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  return (
    <View style={styles.track}>
      <Animated.View style={[styles.fill, { width }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  gradeBadge: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeText: { fontWeight: '700' },
  score: { fontSize: 34 },
  metricRow: { gap: spacing.xs },
  metricLabel: { flexDirection: 'row', justifyContent: 'space-between' },
  track: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceRaised,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.accent },
});
