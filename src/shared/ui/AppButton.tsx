import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/shared/ui/AppText';
import { colors, radius, spacing } from '@/shared/ui/tokens';

interface AppButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

export function AppButton({ label, onPress, disabled = false }: AppButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <AppText variant="heading" style={styles.label}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + spacing.xs,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  pressed: { backgroundColor: colors.accentPressed },
  disabled: { opacity: 0.5 },
  label: { color: colors.background },
});
