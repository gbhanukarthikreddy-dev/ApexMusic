import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '../theme';

interface EqualizerBarsProps {
  active: boolean;
  color?: string;
  size?: 'sm' | 'md';
}

function Bar({
  active,
  color,
  delay,
  minH,
  maxH,
  width,
}: {
  active: boolean;
  color: string;
  delay: number;
  minH: number;
  maxH: number;
  width: number;
}) {
  const height = useSharedValue(minH);

  useEffect(() => {
    if (active) {
      height.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(maxH, { duration: 280 }),
            withTiming(minH + 2, { duration: 240 }),
            withTiming(maxH * 0.78, { duration: 220 }),
            withTiming(minH, { duration: 260 })
          ),
          -1,
          false
        )
      );
    } else {
      cancelAnimation(height);
      height.value = withTiming(minH, { duration: 180 });
    }
  }, [active, delay, height, maxH, minH]);

  const animStyle = useAnimatedStyle(() => ({
    height: height.value,
  }));

  return (
    <Animated.View
      style={[
        styles.bar,
        {
          width,
          backgroundColor: color,
        },
        animStyle,
      ]}
    />
  );
}

export const EqualizerBars = React.memo(function EqualizerBars({
  active,
  color = colors.accentLight,
  size = 'sm',
}: EqualizerBarsProps) {
  const maxH = size === 'md' ? 18 : 14;
  const minH = size === 'md' ? 5 : 4;
  const width = size === 'md' ? 3.5 : 3;

  return (
    <View style={[styles.row, { height: maxH }]}>
      <Bar active={active} color={color} delay={0} minH={minH} maxH={maxH} width={width} />
      <Bar active={active} color={color} delay={110} minH={minH} maxH={maxH} width={width} />
      <Bar active={active} color={color} delay={210} minH={minH} maxH={maxH * 0.85} width={width} />
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2.5,
  },
  bar: {
    borderRadius: 2,
  },
});
