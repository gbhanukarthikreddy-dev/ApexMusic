import { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  Download,
  Heart,
  Pause,
  Play,
  SkipBack,
  SkipForward,
} from 'lucide-react';
import { APK_DOWNLOAD_URL, DEMO_TRACKS } from '../lib/constants';

interface HeroProps {
  onOpenIos: () => void;
}

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export function Hero({ onOpenIos }: HeroProps) {
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [elapsed, setElapsed] = useState(64);
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({
    'midnight-glass': true,
  });
  const [showLyrics, setShowLyrics] = useState(false);

  const track = DEMO_TRACKS[trackIndex];
  const progressPct = Math.min(100, (elapsed / track.durationSec) * 100);
  const activeLyricIndex =
    Math.floor((elapsed / track.durationSec) * track.lyrics.length) %
    track.lyrics.length;

  useEffect(() => {
    if (!isPlaying) return;
    const id = window.setInterval(() => {
      setElapsed((prev) => {
        if (prev + 1 >= track.durationSec) {
          setTrackIndex((i) => (i + 1) % DEMO_TRACKS.length);
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [isPlaying, track.durationSec]);

  const handleNext = () => {
    setTrackIndex((i) => (i + 1) % DEMO_TRACKS.length);
    setElapsed(18);
  };

  const handlePrev = () => {
    setTrackIndex((i) => (i - 1 + DEMO_TRACKS.length) % DEMO_TRACKS.length);
    setElapsed(18);
  };

  const toggleLike = () => {
    setLikedIds((prev) => ({ ...prev, [track.id]: !prev[track.id] }));
  };

  const isLiked = !!likedIds[track.id];

  return (
    <section
      id="home"
      aria-label="Introduction"
      className="border-b border-rule px-4 py-16 sm:px-6 sm:py-24 lg:py-28"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.12fr_0.88fr] lg:gap-16">
        {/* Left Editorial Column */}
        <div>
          <h1 className="text-[clamp(2.75rem,6.5vw,4.75rem)] font-semibold leading-[1.03] tracking-[-0.035em] text-ink-primary">
            Listen without
            <br />
            the{' '}
            <span className="font-serif text-[1.1em] font-normal italic tracking-[-0.01em] text-ink-primary">
              noise.
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-base leading-[1.65] text-ink-secondary sm:text-[17px]">
            Apex Music is a fast, ad-free music player for Android. Save full
            playlists for offline listening, follow synced lyrics line by line,
            and control your queue straight from the lock screen.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={APK_DOWNLOAD_URL}
              download="apexmusic.apk"
              className="btn-primary"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Download for Android
            </a>
            <button type="button" onClick={onOpenIos} className="btn-secondary">
              iOS Waitlist
              <ArrowUpRight className="h-4 w-4 text-ink-secondary" aria-hidden="true" />
            </button>
          </div>

          <p className="mt-6 font-mono text-xs text-ink-muted">
            Android 8.0+ · Free &amp; ad-free · No account required
          </p>
        </div>

        {/* Right Interactive Player Artifact */}
        <div className="mx-auto w-full max-w-[420px]">
          <div className="rounded-2xl border border-rule-strong bg-panel p-5">
            {/* Top Bar */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-mono text-[11px] text-ink-secondary">
                <span className="flex h-3 items-end gap-[2px]" aria-hidden="true">
                  <span
                    className={`w-[2px] bg-crimson ${
                      isPlaying ? 'animate-eq' : 'h-1'
                    }`}
                    style={{ height: '100%', animationDelay: '0ms' }}
                  />
                  <span
                    className={`w-[2px] bg-crimson ${
                      isPlaying ? 'animate-eq' : 'h-2'
                    }`}
                    style={{ height: '100%', animationDelay: '180ms' }}
                  />
                  <span
                    className={`w-[2px] bg-crimson ${
                      isPlaying ? 'animate-eq' : 'h-1.5'
                    }`}
                    style={{ height: '100%', animationDelay: '320ms' }}
                  />
                </span>
                <span>{isPlaying ? 'Now Playing' : 'Paused'}</span>
              </div>

              <button
                type="button"
                onClick={() => setShowLyrics((v) => !v)}
                className={`rounded-md px-2.5 py-1 font-mono text-[11px] transition ${
                  showLyrics
                    ? 'bg-ink-primary text-canvas'
                    : 'border border-rule text-ink-secondary hover:text-ink-primary'
                }`}
              >
                {showLyrics ? 'Artwork' : 'Lyrics'}
              </button>
            </div>

            {/* Artwork or Lyrics */}
            <div className="mt-5">
              {showLyrics ? (
                <div className="flex h-[112px] flex-col justify-center gap-2 rounded-xl border border-rule bg-canvas px-4 py-3">
                  {track.lyrics.slice(0, 3).map((line, idx) => {
                    const active = idx === activeLyricIndex % 3;
                    return (
                      <p
                        key={line}
                        className={`truncate text-sm transition-colors ${
                          active
                            ? 'font-medium text-ink-primary'
                            : 'text-ink-muted'
                        }`}
                      >
                        {line}
                      </p>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl border border-white/10"
                    style={{
                      background: `linear-gradient(145deg, ${track.accentFrom}, ${track.accentTo})`,
                    }}
                  >
                    <img
                      src="/logo.png"
                      alt=""
                      aria-hidden="true"
                      className="h-10 w-10 rounded-lg opacity-95"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[11px] text-ink-muted">
                      {track.badge}
                    </p>
                    <h2 className="mt-1 truncate text-lg font-semibold tracking-tight text-ink-primary">
                      {track.title}
                    </h2>
                    <p className="truncate text-sm text-ink-secondary">
                      {track.artist}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-ink-muted">
                      {track.album}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={toggleLike}
                    aria-label={isLiked ? 'Unlike track' : 'Like track'}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-rule transition hover:border-rule-strong"
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        isLiked
                          ? 'fill-crimson text-crimson'
                          : 'text-ink-secondary'
                      }`}
                    />
                  </button>
                </div>
              )}
            </div>

            {/* Scrubbing Seek Bar */}
            <div className="mt-5">
              <input
                type="range"
                min={0}
                max={track.durationSec}
                value={elapsed}
                onChange={(e) => setElapsed(Number(e.target.value))}
                aria-label="Seek track position"
                className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-crimson"
              />
              <div className="mt-1.5 flex justify-between font-mono text-[11px] text-ink-muted">
                <span>{formatTime(elapsed)}</span>
                <span>{track.durationLabel}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="mt-4 flex items-center justify-center gap-6">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous track"
                className="rounded-full p-2 text-ink-secondary transition hover:text-ink-primary"
              >
                <SkipBack className="h-5 w-5 fill-current" />
              </button>

              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-primary text-canvas transition hover:bg-white active:scale-95"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5 fill-current" />
                ) : (
                  <Play className="ml-0.5 h-5 w-5 fill-current" />
                )}
              </button>

              <button
                type="button"
                onClick={handleNext}
                aria-label="Next track"
                className="rounded-full p-2 text-ink-secondary transition hover:text-ink-primary"
              >
                <SkipForward className="h-5 w-5 fill-current" />
              </button>
            </div>
          </div>

          {/* Android Lock-Screen Notification Strip */}
          <div className="mt-3 rounded-xl border border-rule bg-panel/70 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                  Notification Player · Android
                </p>
                <p className="mt-0.5 truncate text-xs text-ink-primary">
                  {track.title}{' '}
                  <span className="text-ink-secondary">— {track.artist}</span>
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1 text-ink-secondary">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Notification previous"
                  className="p-1 hover:text-ink-primary"
                >
                  <SkipBack className="h-3.5 w-3.5 fill-current" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsPlaying((p) => !p)}
                  aria-label="Notification play pause"
                  className="p-1 text-ink-primary"
                >
                  {isPlaying ? (
                    <Pause className="h-3.5 w-3.5 fill-current" />
                  ) : (
                    <Play className="h-3.5 w-3.5 fill-current" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Notification next"
                  className="p-1 hover:text-ink-primary"
                >
                  <SkipForward className="h-3.5 w-3.5 fill-current" />
                </button>
              </div>
            </div>
            <div className="mt-2.5 h-[3px] w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-crimson transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
