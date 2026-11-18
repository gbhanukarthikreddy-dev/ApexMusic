import { TextStyle } from 'react-native';

export const darkColors = {
  // Apple-inspired deep obsidian canvas & frosted glass surfaces
  background: '#070709',
  surface: 'rgba(255, 255, 255, 0.05)',
  surfaceElevated: 'rgba(255, 255, 255, 0.08)',
  surfaceHighlight: 'rgba(255, 255, 255, 0.14)',
  glassSurface: 'rgba(24, 24, 28, 0.68)',
  glassBorder: 'rgba(255, 255, 255, 0.16)',
  glassHighlight: 'rgba(255, 255, 255, 0.24)',
  border: 'rgba(255, 255, 255, 0.12)',
  borderSubtle: 'rgba(255, 255, 255, 0.08)',

  // Apple Music crimson-coral + crisp monochrome glass accents
  accent: '#FA2D48',
  accentLight: '#FF5C72',
  accentMuted: 'rgba(250, 45, 72, 0.18)',
  accentGlow: 'rgba(250, 45, 72, 0.30)',

  // Typography (Apple Dark Mode label hierarchy)
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(235, 235, 245, 0.68)',
  textMuted: 'rgba(235, 235, 245, 0.42)',
  textInverse: '#000000',

  // Semantic
  success: '#30D158',
  warning: '#FF9F0A',
  error: '#FF453A',
  errorMuted: 'rgba(255, 69, 58, 0.18)',

  // Overlays & Skeletons
  overlayDark: 'rgba(7, 7, 9, 0.78)',
  overlayLight: 'rgba(255, 255, 255, 0.08)',
  skeletonBase: '#141418',
  skeletonHighlight: '#202026',
};

export type ThemeColors = typeof darkColors;

export const colors = darkColors;

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
