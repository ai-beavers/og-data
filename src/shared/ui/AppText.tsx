import { StyleSheet, Text, type TextProps } from 'react-native';

import { colors, typography, type TypographyVariant } from '@/shared/ui/tokens';

interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  muted?: boolean;
}

export function AppText({ variant = 'body', muted = false, style, ...rest }: AppTextProps) {
  return (
    <Text
      style={[typography[variant], muted ? styles.muted : styles.primary, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  primary: { color: colors.textPrimary },
  muted: { color: colors.textSecondary },
});
