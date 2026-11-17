import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MiniPlayer } from '../../components/MiniPlayer';
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

function FloatingTabBar({ state, emitter, navigateToTab, insets }: TabBarProps) {
  const bottomPos = Math.max(14, insets.bottom + 6);

  return (
    <View style={[styles.pillWrapper, { bottom: bottomPos }]}>
      <View style={styles.pillBar}>
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
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              style={styles.tabTouch}
            >
              <View style={styles.iconCircle}>
                {isFocused ? <View style={styles.activeCircleBg} /> : null}
                <Ionicons
                  name={isFocused ? icons.active : icons.inactive}
                  size={21}
                  color={isFocused ? colors.textInverse : colors.textSecondary}
                />
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const tabPillBottom = Math.max(14, insets.bottom + 6);
  const miniPlayerOffset = tabPillBottom + layout.tabBarHeight + 10;

  return (
    <View style={styles.container}>
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
    backgroundColor: colors.glassSurface,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.xs,
    shadowColor: '#000',
    shadowOpacity: 0.55,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 16,
  },
  tabTouch: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeCircleBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.accent,
  },
});
