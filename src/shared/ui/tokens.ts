/**
 * Design tokens — the single source for colors, spacing, type, and radius.
 * Components consume tokens; screens never hardcode raw values.
 */
export const colors = {
  background: '#0E1116',
  surface: '#1A1F27',
  surfaceRaised: '#232A35',
  border: '#2E3744',
  textPrimary: '#F2F5F9',
  textSecondary: '#9AA7B6',
  accent: '#3FB68B',
  accentPressed: '#2F9A74',
  warning: '#E0A93E',
  danger: '#E05D5D',
  success: '#3FB68B',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  pill: 999,
} as const;

export const typography = {
  title: { fontSize: 24, fontWeight: '700' },
  heading: { fontSize: 18, fontWeight: '600' },
  body: { fontSize: 15, fontWeight: '400' },
  caption: { fontSize: 13, fontWeight: '400' },
} as const;

export type TypographyVariant = keyof typeof typography;
