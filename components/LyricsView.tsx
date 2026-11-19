import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchTrackLyrics, LyricsResult } from '../services/lyricsService';
import { usePlayerStore } from '../store/playerStore';
import { colors, radii, spacing, typography } from '../theme';
import { Track } from '../types/music';
import { triggerLightHaptic } from '../utils/haptics';

interface LyricsViewProps {
  track: Track;
  height: number;
}

const LINE_HEIGHT_ESTIMATE = 46;

export function LyricsView({ track, height }: LyricsViewProps) {
  const position = usePlayerStore((s) => s.position);
  const seekTo = usePlayerStore((s) => s.seekTo);

  const [lyrics, setLyrics] = useState<LyricsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);

  const loadLyrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTrackLyrics(track);
      setLyrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load lyrics.');
    } finally {
      setLoading(false);
    }
  }, [track]);

  useEffect(() => {
    let cancelled = false;
    fetchTrackLyrics(track)
      .then((data) => {
        if (!cancelled) {
          setLyrics(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load lyrics.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [track]);

  const activeIndex = useMemo(() => {
    if (!lyrics || lyrics.synced.length === 0) return -1;
    let idx = -1;
    for (let i = 0; i < lyrics.synced.length; i++) {
      if (lyrics.synced[i].time <= position + 0.25) {
        idx = i;
      } else {
        break;
      }
    }
    return idx;
  }, [lyrics, position]);

  useEffect(() => {
    if (activeIndex < 0 || !scrollRef.current) return;
    const offset = Math.max(0, activeIndex * LINE_HEIGHT_ESTIMATE - height * 0.32);
    scrollRef.current.scrollTo({ y: offset, animated: true });
  }, [activeIndex, height]);

  return (
    <View style={[styles.container, { height }]}>
      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={colors.textPrimary} />
          <Text style={styles.stateText}>Finding lyrics...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerState}>
          <Ionicons name="cloud-offline-outline" size={28} color={colors.textSecondary} />
          <Text style={styles.stateText}>{error}</Text>
          <Pressable onPress={() => void loadLyrics()} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : lyrics?.instrumental ? (
        <View style={styles.centerState}>
          <Ionicons name="musical-notes-outline" size={32} color={colors.textSecondary} />
          <Text style={styles.stateTitle}>Instrumental</Text>
          <Text style={styles.stateText}>This track has no vocals.</Text>
        </View>
      ) : lyrics && lyrics.synced.length > 0 ? (
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {lyrics.synced.map((line, index) => {
            const isActive = index === activeIndex;
            const isPast = activeIndex >= 0 && index < activeIndex;
            return (
              <Pressable
                key={`${line.time}_${index}`}
                onPress={() => {
                  triggerLightHaptic();
                  void seekTo(line.time);
                }}
                style={styles.lineBtn}
              >
                <Text
                  style={[
                    styles.lyricLine,
                    isActive && styles.lyricLineActive,
                    isPast && styles.lyricLinePast,
                  ]}
                >
                  {line.text}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : lyrics?.plain ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.plainLyrics}>{lyrics.plain}</Text>
        </ScrollView>
      ) : (
        <View style={styles.centerState}>
          <Ionicons name="chatbubble-ellipses-outline" size={28} color={colors.textSecondary} />
          <Text style={styles.stateTitle}>No lyrics found</Text>
          <Text style={styles.stateText}>Lyrics are not available for this track yet.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: radii.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    overflow: 'hidden',
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.xs,
  },
  stateTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  stateText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: spacing.sm,
    backgroundColor: colors.textPrimary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
  },
  retryText: {
    color: colors.textInverse,
    fontWeight: '700',
    fontSize: 13,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  lineBtn: {
    paddingVertical: 4,
  },
  lyricLine: {
    fontSize: 19,
    fontWeight: '700',
    lineHeight: 27,
    color: 'rgba(255, 255, 255, 0.38)',
  },
  lyricLineActive: {
    fontSize: 22,
    lineHeight: 30,
    color: colors.textPrimary,
  },
  lyricLinePast: {
    color: 'rgba(255, 255, 255, 0.56)',
  },
  plainLyrics: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 26,
    color: 'rgba(255, 255, 255, 0.88)',
  },
});
