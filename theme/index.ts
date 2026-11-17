import { TextStyle } from 'react-native';

export const colors = {
  // Deep matte charcoal-black canvas & elevated surfaces
  background: '#0E0E12',
  surface: '#16161D',
  surfaceElevated: '#1C1C25',
  surfaceHighlight: '#252531',
  glassSurface: 'rgba(28, 28, 36, 0.92)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
  border: '#2A2A36',
  borderSubtle: 'rgba(255, 255, 255, 0.06)',

  // Reference-inspired Acid-Lime + Lavender-Violet palette
  accent: '#C6E63B',
  accentLight: '#D9F266',
  accentDark: '#4A1D7A',
  accentMuted: 'rgba(198, 230, 59, 0.14)',
  accentGlow: 'rgba(198, 230, 59, 0.32)',
  lavender: '#CFA7F8',
  lavenderDark: '#4A1D7A',
  secondaryAccent: '#EC4899',

  // Typography
  textPrimary: '#F8FAFC',
  textSecondary: '#9898A6',
  textMuted: '#686878',
  textInverse: '#0E0E12',

  // Semantic
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  errorMuted: 'rgba(239, 68, 68, 0.16)',

  // Overlays & Skeletons
  overlayDark: 'rgba(14, 14, 18, 0.85)',
  overlayLight: 'rgba(255, 255, 255, 0.07)',
  skeletonBase: '#17171F',
  skeletonHighlight: '#242430',
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radii = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 22,
  xl: 28,
  full: 9999,
} as const;

export const typography: Record<
  'display' | 'h1' | 'h2' | 'h3' | 'subtitle' | 'body' | 'bodyMedium' | 'caption' | 'micro',
  TextStyle
> = {
  display: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.6,
    lineHeight: 34,
    color: colors.textPrimary,
  },
  h1: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
    lineHeight: 30,
    color: colors.textPrimary,
  },
  h2: {
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: -0.3,
    lineHeight: 25,
    color: colors.textPrimary,
  },
  h3: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
    lineHeight: 22,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.1,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  body: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: colors.textPrimary,
  },
  bodyMedium: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    color: colors.textPrimary,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    color: colors.textSecondary,
  },
  micro: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.7,
    lineHeight: 14,
    color: colors.textMuted,
  },
};

export const layout = {
  miniPlayerHeight: 62,
  tabBarHeight: 64,
  headerHeight: 56,
} as const;

export const theme = {
  colors,
  spacing,
  radii,
  typography,
  layout,
} as const;

export type AppTheme = typeof theme;
