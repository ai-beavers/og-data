import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { AnalyzingStage } from '@/features/data-package/components/AnalyzingStage';
import { PackageManifestCard } from '@/features/data-package/components/PackageManifestCard';
import { QualityReportCard } from '@/features/data-package/components/QualityReportCard';
import { RewardMoment } from '@/features/data-package/components/RewardMoment';
import { RobotVisionCard } from '@/features/data-package/components/RobotVisionCard';
import { useDataPackage } from '@/features/data-package/useDataPackage';
import { AppButton, AppText, Card, Screen, colors, spacing } from '@/shared/ui';

type Stage = 'analyzing' | 'revealed';

/**
 * M8 — Demo wow layer. After submit, a capture is "analyzed" on-device and
 * revealed as a buyer-ready training-data package, ending on a reward beat.
 */
export function DataPackageScreen() {
  const { submissionId } = useLocalSearchParams<{ submissionId: string }>();
  const { status, dataPackage } = useDataPackage(submissionId);
  const [stage, setStage] = useState<Stage>('analyzing');

  if (status === 'loading' || !dataPackage) {
    if (status === 'not_found') {
      return (
        <Screen>
          <Card>
            <AppText variant="heading">Package unavailable</AppText>
            <AppText muted>We could not find that capture to package.</AppText>
          </Card>
          <AppButton label="Back to opportunities" onPress={() => router.replace('/(tabs)')} />
        </Screen>
      );
    }
    return (
      <Screen>
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      </Screen>
    );
  }

  if (stage === 'analyzing') {
    return (
      <Screen>
        <AnalyzingStage
          subject={dataPackage.subject}
          steps={dataPackage.steps}
          onComplete={() => setStage('revealed')}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <RewardMoment
          rewardCents={dataPackage.rewardCents}
          keyFrameCount={dataPackage.keyFrameCount}
          trainingEpisodes={dataPackage.trainingEpisodes}
        />

        <AppText variant="heading">Through the robot&apos;s eyes</AppText>
        <AppText variant="caption" muted>
          Detected objects across {dataPackage.frames.length}{' '}
          {dataPackage.frames.length === 1 ? 'angle' : 'angles'}.
        </AppText>
        {dataPackage.frames.length > 0 ? (
          dataPackage.frames.map((frame, index) => (
            <RobotVisionCard key={frame.mediaId} frame={frame} index={index} />
          ))
        ) : (
          <Card>
            <AppText muted>No frames were captured for this submission.</AppText>
          </Card>
        )}

        <QualityReportCard quality={dataPackage.quality} />

        <PackageManifestCard dataPackage={dataPackage} />

        <View style={styles.actions}>
          <AppButton
            label="See my submission"
            onPress={() => router.replace('/(tabs)/submissions')}
          />
          <AppButton label="Capture another" onPress={() => router.replace('/(tabs)')} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: spacing.xl },
  scroll: { gap: spacing.md, paddingBottom: spacing.xl },
  actions: { gap: spacing.sm, marginTop: spacing.sm },
});
