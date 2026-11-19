import { useState } from 'react';
import {
  CheckCircle2,
  DownloadCloud,
  Heart,
  ListMusic,
  MessageSquareQuote,
  Music2,
  Pause,
  Play,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
} from 'lucide-react';
import { DEMO_TRACKS } from '../lib/constants';

type TabKey = 'player' | 'lyrics' | 'offline' | 'queue';

interface ScreenTab {
  key: TabKey;
  label: string;
  heading: string;
  note: string;
  icon: typeof Music2;
}

const TABS: ScreenTab[] = [
  {
    key: 'player',
    label: 'Player',
    heading: 'One-handed now playing',
    note: 'Clean controls, gesture scrubbing, and quick access to favorites without visual clutter.',
    icon: Music2,
  },
  {
    key: 'lyrics',
    label: 'Lyrics',
    heading: 'Synced lyrics, tap to seek',
    note: 'Tap any lyric line in the preview to see how the active highlight moves through the song.',
    icon: MessageSquareQuote,
  },
  {
    key: 'offline',
    label: 'Downloads',
    heading: 'Playlists & songs saved locally',
    note: 'Toggle between bundled Downloaded Playlists and individual Downloaded Songs.',
    icon: DownloadCloud,
  },
  {
    key: 'queue',
    label: 'Queue',
    heading: 'Live Up Next control',
    note: 'Tap any upcoming track to switch immediately, or toggle Shuffle and Repeat.',
    icon: ListMusic,
  },
];

const OFFLINE_PLAYLISTS = [
  { name: 'Midnight Highway', count: '18 / 18', size: '112 MB', grad: 'from-crimson to-neutral-800' },
  { name: 'Telugu Breezy Melodies', count: '24 / 24', size: '148 MB', grad: 'from-cyan-700 to-neutral-900' },
  { name: 'Bollywood Unplugged', count: '15 / 15', size: '94 MB', grad: 'from-amber-700 to-neutral-900' },
];

export function PhoneShowcase() {
  const [activeTab, setActiveTab] = useState<TabKey>('player');
  const [trackIdx, setTrackIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [liked, setLiked] = useState(true);
  const [lyricIdx, setLyricIdx] = useState(3);
  const [offlineFilter, setOfflineFilter] = useState<'playlists' | 'songs'>('playlists');
  const [shuffleOn, setShuffleOn] = useState(false);
  const [repeatOn, setRepeatOn] = useState(false);

  const track = DEMO_TRACKS[trackIdx];

  return (
    <section
      id="app"
      aria-labelledby="preview-heading"
      className="border-b border-rule px-4 py-20 sm:px-6 lg:py-28"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr_340px] lg:gap-16">
        {/* Left Controls & Copy */}
        <div>
          <p className="font-mono text-xs text-ink-muted">INTERACTIVE PREVIEW</p>
          <h2
            id="preview-heading"
            className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-ink-primary sm:text-4xl"
          >
            Try the screens before you{' '}
            <span className="font-serif text-[1.12em] font-normal italic">
              install.
            </span>
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink-secondary sm:text-base">
            Click through the four core views below—everything inside the phone
            responds to taps.
          </p>

          <div className="mt-8 divide-y divide-rule border-y border-rule">
            {TABS.map((tab) => {
              const selected = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex w-full items-start justify-between gap-4 py-5 text-left transition ${
                    selected ? 'opacity-100' : 'opacity-55 hover:opacity-85'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          selected ? 'bg-crimson' : 'bg-white/25'
                        }`}
                      />
                      <span className="text-base font-medium text-ink-primary">
                        {tab.heading}
                      </span>
                    </div>
                    <p className="mt-1.5 pl-4 text-sm leading-relaxed text-ink-secondary">
                      {tab.note}
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-[11px] uppercase text-ink-muted">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Clean Matte Phone Mockup */}
        <div className="mx-auto w-full max-w-[330px]">
          <div className="rounded-[44px] border border-rule-strong bg-[#070709] p-2.5 shadow-2xl">
            <div className="flex h-[585px] flex-col overflow-hidden rounded-[36px] border border-rule bg-[#070709]">
              {/* Status Bar */}
              <div className="flex items-center justify-between px-6 pb-2 pt-3.5 font-mono text-[10px] text-ink-secondary">
                <span>9:41</span>
                <div className="h-4 w-20 rounded-full bg-black ring-1 ring-white/10" />
                <span>5G</span>
              </div>

              {/* Screen Content */}
              <div className="flex-1 overflow-hidden px-5 pb-4 pt-2">
                {activeTab === 'player' && (
                  <div className="flex h-full flex-col justify-between">
                    <p className="text-center font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                      Now Playing
                    </p>

                    <div
                      className="mx-auto my-2 flex aspect-square w-48 items-center justify-center rounded-2xl border border-white/10"
                      style={{
                        background: `linear-gradient(145deg, ${track.accentFrom}, ${track.accentTo})`,
                      }}
                    >
                      <img
                        src="/logo.png"
                        alt=""
                        aria-hidden="true"
                        className="h-16 w-16 rounded-xl"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-ink-primary">
                          {track.title}
                        </p>
                        <p className="truncate text-xs text-ink-secondary">
                          {track.artist}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setLiked((l) => !l)}
                        aria-label="Toggle favorite"
                        className="p-2"
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            liked ? 'fill-crimson text-crimson' : 'text-ink-secondary'
                          }`}
                        />
                      </button>
                    </div>

                    <div>
                      <div className="h-1 w-full overflow-hidden rounded-full bg-white/15">
                        <div className="h-full w-2/5 bg-ink-primary" />
                      </div>
                      <div className="mt-1.5 flex justify-between font-mono text-[10px] text-ink-muted">
                        <span>1:18</span>
                        <span>{track.durationLabel}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-6 pb-2">
                      <button
                        type="button"
                        onClick={() =>
                          setTrackIdx(
                            (i) => (i - 1 + DEMO_TRACKS.length) % DEMO_TRACKS.length
                          )
                        }
                        aria-label="Previous"
                        className="p-2 text-ink-secondary hover:text-ink-primary"
                      >
                        <SkipBack className="h-5 w-5 fill-current" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsPlaying((p) => !p)}
                        aria-label="Play or pause"
                        className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-primary text-canvas"
                      >
                        {isPlaying ? (
                          <Pause className="h-5 w-5 fill-current" />
                        ) : (
                          <Play className="ml-0.5 h-5 w-5 fill-current" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setTrackIdx((i) => (i + 1) % DEMO_TRACKS.length)
                        }
                        aria-label="Next"
                        className="p-2 text-ink-secondary hover:text-ink-primary"
                      >
                        <SkipForward className="h-5 w-5 fill-current" />
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'lyrics' && (
                  <div className="flex h-full flex-col">
                    <div className="border-b border-rule pb-3">
                      <p className="truncate text-sm font-semibold text-ink-primary">
                        {track.title}
                      </p>
                      <p className="font-mono text-[10px] text-ink-muted">
                        Synced LRC · Tap any line
                      </p>
                    </div>

                    <div className="mt-3 flex-1 space-y-2.5 overflow-y-auto pr-1">
                      {track.lyrics.map((line, i) => {
                        const active = i === lyricIdx;
                        return (
                          <button
                            key={line}
                            type="button"
                            onClick={() => setLyricIdx(i)}
                            className={`block w-full rounded-lg px-2.5 py-2 text-left text-[15px] leading-snug transition ${
                              active
                                ? 'bg-white/[0.08] font-semibold text-ink-primary'
                                : 'text-ink-muted hover:text-ink-secondary'
                            }`}
                          >
                            {line}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeTab === 'offline' && (
                  <div className="flex h-full flex-col">
                    <div className="flex items-baseline justify-between">
                      <p className="text-base font-semibold text-ink-primary">
                        Downloads
                      </p>
                      <span className="font-mono text-[10px] text-ink-muted">
                        OFFLINE READY
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 rounded-lg border border-rule bg-panel p-1 text-xs">
                      <button
                        type="button"
                        onClick={() => setOfflineFilter('playlists')}
                        className={`rounded-md py-1.5 transition ${
                          offlineFilter === 'playlists'
                            ? 'bg-ink-primary font-medium text-canvas'
                            : 'text-ink-secondary'
                        }`}
                      >
                        Playlists
                      </button>
                      <button
                        type="button"
                        onClick={() => setOfflineFilter('songs')}
                        className={`rounded-md py-1.5 transition ${
                          offlineFilter === 'songs'
                            ? 'bg-ink-primary font-medium text-canvas'
                            : 'text-ink-secondary'
                        }`}
                      >
                        Songs
                      </button>
                    </div>

                    <div className="mt-3.5 space-y-2">
                      {offlineFilter === 'playlists'
                        ? OFFLINE_PLAYLISTS.map((pl) => (
                            <div
                              key={pl.name}
                              className="flex items-center gap-3 rounded-xl border border-rule bg-panel/80 p-2.5"
                            >
                              <div
                                className={`h-11 w-11 shrink-0 rounded-lg bg-gradient-to-br ${pl.grad}`}
                              />
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-ink-primary">
                                  {pl.name}
                                </p>
                                <p className="font-mono text-[10px] text-ink-muted">
                                  {pl.count} · {pl.size}
                                </p>
                              </div>
                              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                            </div>
                          ))
                        : DEMO_TRACKS.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-3 rounded-xl border border-rule bg-panel/80 p-2.5"
                            >
                              <div
                                className="h-10 w-10 shrink-0 rounded-lg"
                                style={{
                                  background: `linear-gradient(145deg, ${item.accentFrom}, ${item.accentTo})`,
                                }}
                              />
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-ink-primary">
                                  {item.title}
                                </p>
                                <p className="truncate text-xs text-ink-secondary">
                                  {item.artist}
                                </p>
                              </div>
                              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                            </div>
                          ))}
                    </div>
                  </div>
                )}

                {activeTab === 'queue' && (
                  <div className="flex h-full flex-col">
                    <div className="flex items-center justify-between">
                      <p className="text-base font-semibold text-ink-primary">
                        Up Next
                      </p>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setShuffleOn((s) => !s)}
                          aria-label="Toggle shuffle"
                          className={`rounded-md p-1.5 transition ${
                            shuffleOn
                              ? 'bg-crimson text-white'
                              : 'border border-rule text-ink-secondary'
                          }`}
                        >
                          <Shuffle className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setRepeatOn((r) => !r)}
                          aria-label="Toggle repeat"
                          className={`rounded-md p-1.5 transition ${
                            repeatOn
                              ? 'bg-crimson text-white'
                              : 'border border-rule text-ink-secondary'
                          }`}
                        >
                          <Repeat className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3.5 space-y-2">
                      {DEMO_TRACKS.map((item, i) => {
                        const current = i === trackIdx;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setTrackIdx(i)}
                            className={`flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition ${
                              current
                                ? 'border-crimson/50 bg-crimson/10'
                                : 'border-rule bg-panel/80 hover:bg-panel-hover'
                            }`}
                          >
                            <div
                              className="h-9 w-9 shrink-0 rounded-lg"
                              style={{
                                background: `linear-gradient(145deg, ${item.accentFrom}, ${item.accentTo})`,
                              }}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-ink-primary">
                                {item.title}
                              </p>
                              <p className="truncate text-xs text-ink-secondary">
                                {item.artist}
                              </p>
                            </div>
                            <span className="font-mono text-[10px] text-ink-muted">
                              {current ? 'NOW' : item.durationLabel}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Tab Bar inside Phone */}
              <div className="border-t border-rule bg-[#0B0B0E] px-3 py-2.5">
                <div className="grid grid-cols-4 gap-1">
                  {TABS.map((t) => {
                    const Icon = t.icon;
                    const active = activeTab === t.key;
                    return (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setActiveTab(t.key)}
                        aria-label={t.label}
                        className={`flex flex-col items-center gap-1 rounded-lg py-1.5 text-[10px] transition ${
                          active
                            ? 'text-ink-primary'
                            : 'text-ink-muted hover:text-ink-secondary'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
