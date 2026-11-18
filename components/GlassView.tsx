import React from 'react';
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { BlurTint, BlurView } from 'expo-blur';
import { useAppTheme } from '../hooks/useAppTheme';

interface GlassViewProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  tint?: BlurTint;
}

/**
 * Apple-style frosted glass surface with native blur and a hairline specular border.
 */
export function GlassView({
  children,
  style,
  intensity = 60,
  tint,
}: GlassViewProps) {
  const { isDark, colors: themeColors, blurTint } = useAppTheme();

  return (
    <View style={[styles.container, { borderColor: themeColors.glassBorder }, style]}>
      <BlurView
        intensity={intensity}
        tint={tint ?? blurTint}
        blurMethod={Platform.OS === 'android' ? 'dimezisBlurViewSdk31Plus' : undefined}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          styles.tintOverlay,
          { backgroundColor: isDark ? 'rgba(24, 24, 28, 0.42)' : 'rgba(255, 255, 255, 0.56)' },
        ]}
        pointerEvents="none"
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderWidth: 1,
  },
  tintOverlay: {
    ...StyleSheet.absoluteFill,
  },
});
