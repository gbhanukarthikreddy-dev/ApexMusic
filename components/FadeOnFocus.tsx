import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useAppTheme } from '../hooks/useAppTheme';

interface FadeOnFocusProps {
  children: React.ReactNode;
}

/**
 * Smoothly fades tab screen content on focus without altering layout or SafeAreaView bounds.
 */
export function FadeOnFocus({ children }: FadeOnFocusProps) {
  const [focused, setFocused] = useState(true);
  const { colors: themeColors } = useAppTheme();

  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, [])
  );

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(focused ? 1 : 0.72, { duration: 180 }),
  }));

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Animated.View style={[styles.inner, animatedStyle]}>{children}</Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
  },
});
