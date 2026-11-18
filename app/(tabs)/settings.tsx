import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { Image } from 'expo-image';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ApexLogo } from '../../components/ApexLogo';
import { FadeOnFocus } from '../../components/FadeOnFocus';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useLibraryStore } from '../../store/libraryStore';
import { usePlayerStore } from '../../store/playerStore';
import { useUIStore } from '../../store/uiStore';
import { colors, radii, spacing, typography } from '../../theme';
import { AudioQuality } from '../../types/music';
import { triggerLightHaptic, triggerSelectionHaptic } from '../../utils/haptics';

const QUALITY_OPTIONS: Array<{
  key: AudioQuality;
  label: string;
  desc: string;
}> = [
  { key: 'low', label: 'Data Saver', desc: 'Lower bitrate (~64 kbps) for mobile data' },
  { key: 'medium', label: 'Balanced', desc: 'Standard streaming quality (~128 kbps)' },
  { key: 'high', label: 'Studio High', desc: 'Highest available audio fidelity' },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { colors: themeColors } = useAppTheme();
  const hasMiniPlayer = usePlayerStore((s) => Boolean(s.currentTrack));
  const audioQuality = useLibraryStore((s) => s.audioQuality);
  const setAudioQuality = useLibraryStore((s) => s.setAudioQuality);
  const clearRecentSearches = useLibraryStore((s) => s.clearRecentSearches);
  const clearHistory = useLibraryStore((s) => s.clearHistory);
  const historyCount = useLibraryStore((s) => s.history.length);
  const showToast = useUIStore((s) => s.showToast);

  const [clearingCache, setClearingCache] = useState(false);

  const appVersion = Constants.expoConfig?.version || '1.0.0';

  const handleClearCache = async () => {
    triggerLightHaptic();
    setClearingCache(true);
    try {
      await Image.clearDiskCache();
      await Image.clearMemoryCache();
      clearRecentSearches();
      showToast('Cache cleared');
    } catch {
      Alert.alert('Cache Error', 'Unable to clear some cached items.');
    } finally {
      setClearingCache(false);
    }
  };

  const handleClearHistory = () => {
    if (historyCount === 0) {
      showToast('Listening history is already empty');
      return;
    }
    Alert.alert(
      'Clear Listening History',
      'Remove all recently played tracks from your library?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            clearHistory();
            showToast('Listening history cleared');
          },
        },
      ]
    );
  };

  return (
    <FadeOnFocus>
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: themeColors.background }]}
        edges={['top']}
      >
        <View style={styles.header}>
          <Text style={[typography.h1, { color: themeColors.textPrimary }]}>Settings</Text>
        </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + (hasMiniPlayer ? 168 : 98) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Audio Quality */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.textMuted }]}>AUDIO QUALITY</Text>
          <View
            style={[
              styles.card,
              {
                backgroundColor: themeColors.surface,
                borderColor: themeColors.border,
              },
            ]}
          >
            {QUALITY_OPTIONS.map((opt, idx) => {
              const selected = audioQuality === opt.key;
              return (
                <Pressable
                  key={opt.key}
                  onPress={() => {
                    triggerSelectionHaptic();
                    setAudioQuality(opt.key);
                    showToast(`Audio quality set to ${opt.label}`);
                  }}
                  style={[
                    styles.row,
                    idx < QUALITY_OPTIONS.length - 1 && [
                      styles.rowBorder,
                      { borderBottomColor: themeColors.borderSubtle },
                    ],
                  ]}
                >
                  <View style={styles.rowTextWrap}>
                    <Text style={[typography.bodyMedium, { color: themeColors.textPrimary }]}>
                      {opt.label}
                    </Text>
                    <Text style={[typography.caption, { color: themeColors.textSecondary }]}>
                      {opt.desc}
                    </Text>
                  </View>
                  <Ionicons
                    name={selected ? 'radio-button-on' : 'radio-button-off'}
                    size={22}
                    color={selected ? themeColors.accent : themeColors.textMuted}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Storage & Privacy */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.textMuted }]}>
            STORAGE & PRIVACY
          </Text>
          <View
            style={[
              styles.card,
              {
                backgroundColor: themeColors.surface,
                borderColor: themeColors.border,
              },
            ]}
          >
            <Pressable
              onPress={() => void handleClearCache()}
              disabled={clearingCache}
              style={[
                styles.row,
                styles.rowBorder,
                { borderBottomColor: themeColors.borderSubtle },
              ]}
            >
              <View style={styles.rowTextWrap}>
                <Text style={[typography.bodyMedium, { color: themeColors.textPrimary }]}>
                  Clear Cache
                </Text>
                <Text style={[typography.caption, { color: themeColors.textSecondary }]}>
                  Free up space by clearing cached artwork and search suggestions
                </Text>
              </View>
              <Ionicons name="trash-outline" size={20} color={themeColors.accentLight} />
            </Pressable>

            <Pressable onPress={handleClearHistory} style={styles.row}>
              <View style={styles.rowTextWrap}>
                <Text style={[typography.bodyMedium, { color: themeColors.textPrimary }]}>
                  Clear Listening History
                </Text>
                <Text style={[typography.caption, { color: themeColors.textSecondary }]}>
                  {historyCount} {historyCount === 1 ? 'track' : 'tracks'} in recent history
                </Text>
              </View>
              <Ionicons name="time-outline" size={20} color={themeColors.textSecondary} />
            </Pressable>
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.textMuted }]}>ABOUT</Text>
          <View
            style={[
              styles.card,
              styles.aboutCard,
              {
                backgroundColor: themeColors.surface,
                borderColor: themeColors.border,
              },
            ]}
          >
            <ApexLogo size="md" showTagline />
            <Text style={[typography.body, styles.aboutText, { color: themeColors.textSecondary }]}>
              Stream your favorite songs, albums, and curated playlists in high fidelity with
              seamless queue management and instant playback.
            </Text>
            <View style={styles.aboutMetaRow}>
              <View
                style={[
                  styles.metaPill,
                  {
                    backgroundColor: themeColors.surfaceElevated,
                    borderColor: themeColors.border,
                  },
                ]}
              >
                <Text style={[styles.metaPillText, { color: themeColors.textSecondary }]}>
                  v{appVersion}
                </Text>
              </View>
              <View
                style={[
                  styles.metaPill,
                  {
                    backgroundColor: themeColors.surfaceElevated,
                    borderColor: themeColors.border,
                  },
                ]}
              >
                <Text style={[styles.metaPillText, { color: themeColors.textSecondary }]}>
                  Dark Mode
                </Text>
              </View>
              <View
                style={[
                  styles.metaPill,
                  {
                    backgroundColor: themeColors.surfaceElevated,
                    borderColor: themeColors.border,
                  },
                ]}
              >
                <Text style={[styles.metaPillText, { color: themeColors.textSecondary }]}>
                  Hi-Fi Audio
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      </SafeAreaView>
    </FadeOnFocus>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  content: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  section: {
    gap: spacing.xs,
  },
  sectionTitle: {
    ...typography.micro,
    paddingLeft: spacing.xxs,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    gap: spacing.sm,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  rowTextWrap: {
    flex: 1,
    gap: 2,
  },
  aboutCard: {
    padding: spacing.md,
    gap: spacing.sm + 2,
  },
  aboutText: {
    color: colors.textSecondary,
    lineHeight: 21,
  },
  aboutMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: 2,
  },
  metaPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  metaPillText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
});
