import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/shared/ui/AppText';
import { colors, radius, spacing } from '@/shared/ui/tokens';

interface AppButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  /** "primary" is the filled accent button; "secondary" is an outline. */
  variant?: 'primary' | 'secondary';
}

export function AppButton({
  label,
  onPress,
  disabled = false,
  variant = 'primary',
}: AppButtonProps) {
  const secondary = variant === 'secondary';
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.secondary,
        pressed && (secondary ? styles.secondaryPressed : styles.pressed),
        disabled && styles.disabled,
      ]}
    >
      <AppText variant="heading" style={secondary ? styles.secondaryLabel : styles.label}>
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
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.accent,
  },
  pressed: { backgroundColor: colors.accentPressed },
  secondaryPressed: { backgroundColor: colors.surfaceRaised },
  disabled: { opacity: 0.5 },
  label: { color: colors.background },
  secondaryLabel: { color: colors.accent },
});
