import { StyleSheet, View } from 'react-native';

import type { DataPackage, PackageFileKind } from '@/features/data-package/dataPackage';
import { AppText, Card, colors, radius, spacing } from '@/shared/ui';

interface PackageManifestCardProps {
  dataPackage: DataPackage;
}

const FILE_GLYPH: Record<PackageFileKind, string> = {
  video: '▶',
  image: '▣',
  json: '{ }',
  folder: '▤',
};

/**
 * The buyer-ready export bundle: what a robotics team would actually receive.
 * Kept honest — a structured media + metadata package, not a 3D claim.
 */
export function PackageManifestCard({ dataPackage }: PackageManifestCardProps) {
  return (
    <Card>
      <View style={styles.header}>
        <AppText variant="heading">Buyer-ready package</AppText>
        <View style={styles.readyTag}>
          <AppText variant="caption" style={styles.readyText}>
            Ready to export
          </AppText>
        </View>
      </View>
      <AppText variant="caption" muted>
        {`pkg_${dataPackage.submissionId}.zip · ${dataPackage.trainingEpisodes} training episode${
          dataPackage.trainingEpisodes === 1 ? '' : 's'
        }`}
      </AppText>

      <View style={styles.fileList}>
        {dataPackage.manifest.map((file) => (
          <View key={file.name} style={styles.fileRow}>
            <View style={styles.glyphBox}>
              <AppText variant="caption" style={styles.glyph}>
                {FILE_GLYPH[file.kind]}
              </AppText>
            </View>
            <View style={styles.fileBody}>
              <AppText style={styles.fileName}>{file.name}</AppText>
              <AppText variant="caption" muted>
                {file.detail}
              </AppText>
            </View>
          </View>
        ))}
      </View>

      <AppText variant="caption" muted style={styles.sectionLabel}>
        Detected object classes
      </AppText>
      <View style={styles.chips}>
        {dataPackage.detectedLabels.map((label) => (
          <View key={label} style={styles.chip}>
            <AppText variant="caption" style={styles.chipText}>
              {label}
            </AppText>
          </View>
        ))}
      </View>

      <AppText variant="caption" muted style={styles.sectionLabel}>
        metadata.json
      </AppText>
      <View style={styles.codeBlock}>
        <AppText variant="caption" style={styles.code}>
          {dataPackage.metadataPreview}
        </AppText>
      </View>

      <AppText variant="caption" muted style={styles.footnote}>
        Demo preview — final delivery format is agreed per buyer (raw media +
        metadata today; reconstructed assets later).
      </AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  readyTag: {
    backgroundColor: colors.success,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  readyText: { color: colors.background, fontWeight: '700' },
  fileList: { gap: spacing.sm, marginTop: spacing.xs },
  fileRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  glyphBox: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: { color: colors.accent, fontWeight: '700' },
  fileBody: { flex: 1 },
  fileName: { fontWeight: '600' },
  sectionLabel: { marginTop: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chipText: { color: colors.textPrimary },
  codeBlock: {
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.sm,
  },
  code: { color: colors.textSecondary, fontFamily: 'Courier', fontSize: 11, lineHeight: 16 },
  footnote: { marginTop: spacing.sm, fontStyle: 'italic' },
});
