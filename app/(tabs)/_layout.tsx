import React, { useEffect, useState } from 'react';
import { LayoutChangeEvent, Platform, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MiniPlayer } from '../../components/MiniPlayer';
import { useAppTheme } from '../../hooks/useAppTheme';
import { colors, layout, spacing } from '../../theme';
import { triggerSelectionHaptic } from '../../utils/haptics';

const TAB_ICONS: Record<
  string,
  { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }
> = {
  index: { active: 'home', inactive: 'home-outline' },
  search: { active: 'search', inactive: 'search-outline' },
  library: { active: 'bookmarks', inactive: 'bookmarks-outline' },
  settings: { active: 'settings', inactive: 'settings-outline' },
};

type TabBarProps = Parameters<NonNullable<React.ComponentProps<typeof Tabs>['tabBar']>>[0];

const PILL_WIDTH = 56;
const SPRING_CONFIG = { damping: 20, stiffness: 260, mass: 0.75 };

type TabLayout = { x: number; width: number };

function TabItem({
  isFocused,
  iconName,
  activeColor,
  inactiveColor,
  onPress,
  onLayout,
}: {
  isFocused: boolean;
  iconName: keyof typeof Ionicons.glyphMap;
  activeColor: string;
  inactiveColor: string;
  onPress: () => void;
  onLayout: (e: LayoutChangeEvent) => void;
}) {
  const pressed = useSharedValue(false);

  const iconAnimStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(pressed.value ? 0.86 : isFocused ? 1.08 : 1, SPRING_CONFIG),
      },
    ],
  }));

  return (
    <Pressable
      onPress={onPress}
      onLayout={onLayout}
      onPressIn={() => {
        pressed.set(true);
      }}
      onPressOut={() => {
        pressed.set(false);
      }}
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      style={styles.tabTouch}
    >
      <Animated.View style={[styles.iconCircle, iconAnimStyle]}>
        <Ionicons
          name={iconName}
          size={21}
          color={isFocused ? activeColor : inactiveColor}
        />
      </Animated.View>
    </Pressable>
  );
}

function FloatingTabBar({ state, emitter, navigateToTab, insets }: TabBarProps) {
  const bottomPos = Math.max(14, insets.bottom + 6);
  const { isDark, colors: themeColors, chromeBlurTint } = useAppTheme();
  const [tabLayouts, setTabLayouts] = useState<Record<number, TabLayout>>({});
  const indicatorX = useSharedValue(0);

  const activeLayout = tabLayouts[state.index];

  useEffect(() => {
    if (!activeLayout) return;
    const targetX = activeLayout.x + (activeLayout.width - PILL_WIDTH) / 2;
    indicatorX.value = withSpring(targetX, SPRING_CONFIG);
  }, [activeLayout, indicatorX]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    opacity: activeLayout ? 1 : 0,
  }));

  return (
    <View style={[styles.pillWrapper, { bottom: bottomPos }]}>
      <View style={[styles.pillBar, { borderColor: themeColors.glassBorder }]}>
        <BlurView
          intensity={75}
          tint={chromeBlurTint}
          blurMethod={Platform.OS === 'android' ? 'dimezisBlurViewSdk31Plus' : undefined}
          style={StyleSheet.absoluteFill}
        />
        <View
          style={[
            styles.pillGlassTint,
            { backgroundColor: isDark ? 'rgba(24, 24, 28, 0.58)' : 'rgba(255, 255, 255, 0.68)' },
          ]}
          pointerEvents="none"
        />

        <Animated.View
          style={[
            styles.slidingGlassPill,
            {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.08)',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.24)' : 'rgba(0, 0, 0, 0.10)',
            },
            indicatorStyle,
          ]}
          pointerEvents="none"
        />

        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const icons = TAB_ICONS[route.name] || {
            active: 'ellipse',
            inactive: 'ellipse-outline',
          };

          const onPress = () => {
            triggerSelectionHaptic();
            const event = emitter.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigateToTab(route.key);
            }
          };

          return (
            <TabItem
              key={route.key}
              isFocused={isFocused}
              iconName={isFocused ? icons.active : icons.inactive}
              activeColor={themeColors.textPrimary}
              inactiveColor={themeColors.textSecondary}
              onPress={onPress}
              onLayout={(e) => {
                const { x, width } = e.nativeEvent.layout;
                setTabLayouts((prev) => {
                  const existing = prev[index];
                  if (existing && existing.x === x && existing.width === width) {
                    return prev;
                  }
                  return { ...prev, [index]: { x, width } };
                });
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { colors: themeColors } = useAppTheme();
  const tabPillBottom = Math.max(14, insets.bottom + 6);
  const miniPlayerOffset = tabPillBottom + layout.tabBarHeight + 10;

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Tabs
        tabBar={(props) => <FloatingTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          lazy: false,
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Home' }} />
        <Tabs.Screen name="search" options={{ title: 'Search' }} />
        <Tabs.Screen name="library" options={{ title: 'Library' }} />
        <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
      </Tabs>

      <MiniPlayer bottomOffset={miniPlayerOffset} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  pillWrapper: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    zIndex: 50,
  },
  pillBar: {
    height: layout.tabBarHeight,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glassHighlight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.xs,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 16,
  },
  pillGlassTint: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(24, 24, 28, 0.58)',
  },
  slidingGlassPill: {
    position: 'absolute',
    top: (layout.tabBarHeight - 44) / 2,
    left: 0,
    width: PILL_WIDTH,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.24)',
  },
  tabTouch: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  iconCircle: {
    width: PILL_WIDTH,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
