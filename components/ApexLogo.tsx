import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { colors, radii, spacing } from '../theme';

const APEX_LOGO_SOURCE = require('../assets/logo.png');

interface ApexLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  iconOnly?: boolean;
}

export function ApexLogo({
  size = 'md',
  showTagline = false,
  iconOnly = false,
}: ApexLogoProps) {
  const boxSize = size === 'lg' ? 56 : size === 'sm' ? 36 : 42;
  const fontSize = size === 'lg' ? 25 : size === 'sm' ? 15 : 18;
  const radius = size === 'lg' ? radii.md : size === 'sm' ? radii.sm : 12;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.badge,
          {
            width: boxSize,
            height: boxSize,
            borderRadius: radius,
          },
        ]}
      >
        <Image
          source={APEX_LOGO_SOURCE}
          style={styles.logoImage}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
      </View>

      {!iconOnly ? (
        <View>
          <View style={styles.wordmarkRow}>
            <Text style={[styles.brandPrimary, { fontSize }]}>APEX</Text>
            <Text style={[styles.brandSecondary, { fontSize }]}>MUSIC</Text>
          </View>
          {showTagline ? <Text style={styles.tagline}>STREAM WITHOUT LIMITS</Text> : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  badge: {
    overflow: 'hidden',
    backgroundColor: '#0F0F19',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
  },
  brandPrimary: {
    fontWeight: '800',
    letterSpacing: 0.8,
    color: colors.textPrimary,
  },
  brandSecondary: {
    fontWeight: '400',
    letterSpacing: 0.8,
    color: colors.lavender,
  },
  tagline: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.textMuted,
    marginTop: 2,
  },
});
