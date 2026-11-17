import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { type ErrorBoundaryProps, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ToastBanner } from '../components/ToastBanner';
import { TrackActionSheet } from '../components/TrackActionSheet';
import { useAudioController } from '../hooks/useAudioController';
import { useUIStore } from '../store/uiStore';
import { colors, radii, spacing } from '../theme';

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Something went wrong</Text>
      <Text style={styles.errorMessage}>{error.message}</Text>
      <Pressable onPress={retry} style={styles.retryButton}>
        <Text style={styles.retryText}>Retry</Text>
      </Pressable>
    </View>
  );
}

export default function RootLayout() {
  useAudioController();
  const sheetTrack = useUIStore((s) => s.sheetTrack);
  const sheetMode = useUIStore((s) => s.sheetMode);
  const closeTrackSheet = useUIStore((s) => s.closeTrackSheet);

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="player"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="queue"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
            gestureEnabled: true,
          }}
        />
        <Stack.Screen name="artist/[id]" />
        <Stack.Screen name="album/[id]" />
        <Stack.Screen name="playlist/[id]" />
      </Stack>

      <TrackActionSheet
        track={sheetTrack}
        visible={Boolean(sheetTrack)}
        initialMode={sheetMode}
        onClose={closeTrackSheet}
      />

      <ToastBanner />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  errorTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  errorMessage: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing.sm,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
  },
  retryText: {
    color: colors.textInverse,
    fontWeight: '700',
  },
});
