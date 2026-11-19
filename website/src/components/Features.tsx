interface FeatureRow {
  num: string;
  title: string;
  description: string;
  detail: string;
}

const FEATURES: FeatureRow[] = [
  {
    num: '01',
    title: 'Offline songs & full playlists',
    description:
      'Download individual tracks or entire playlists in one tap with live x/y progress. Your library separates Downloaded Playlists and Downloaded Songs so everything plays cleanly with zero signal.',
    detail: 'Local storage · Airplane mode',
  },
  {
    num: '02',
    title: 'Time-synced lyrics',
    description:
      'LRC lyrics from LRCLIB follow along automatically as the song plays. Tap any line to jump straight to that moment in the track.',
    detail: 'LRCLIB · Tap to seek',
  },
  {
    num: '03',
    title: 'Native lock-screen player',
    description:
      'Background audio with Android notification controls that actually work: a live seek bar, Previous, Play/Pause, and Next wired directly to your real playback queue.',
    detail: 'Background audio · Seek bar',
  },
  {
    num: '04',
    title: 'Swipe-to-queue & Up Next',
    description:
      'Swipe left on any track anywhere in the app to drop it into Up Next. Reorder, shuffle, or repeat without interrupting the song currently playing.',
    detail: 'Gesture queue · Instant skip',
  },
  {
    num: '05',
    title: 'True dark interface, zero ads',
    description:
      'Built on a deep #070709 canvas with frosted dark surfaces and hairline borders. No banner ads, no audio interruptions, and no podcasts or clutter pushed onto your home screen.',
    detail: 'OLED dark · Ad-free',
  },
  {
    num: '06',
    title: 'Quiet, instant search',
    description:
      'Search across songs, albums, artists, and playlists in milliseconds. Suggestions and history only appear while your keyboard is active—staying out of your way when you browse.',
    detail: 'Keyboard-aware · Fast lookup',
  },
];

export function Features() {
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="border-b border-rule px-4 py-20 sm:px-6 lg:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-6 lg:grid-cols-[0.38fr_0.62fr] lg:items-end">
          <div>
            <p className="font-mono text-xs text-ink-muted">WHAT&apos;S INSIDE</p>
            <h2
              id="features-heading"
              className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-ink-primary sm:text-4xl"
            >
              Built for people who just want to{' '}
              <span className="font-serif text-[1.12em] font-normal italic">
                press play.
              </span>
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-relaxed text-ink-secondary sm:text-base lg:justify-self-end">
            Most streaming apps bury your library under feeds, upsells, and
            video clips. Apex Music keeps the focus on your tracks, offline
            downloads, and a player that responds immediately.
          </p>
        </div>

        {/* Hairline Editorial Rows */}
        <div className="mt-14 border-t border-rule">
          {FEATURES.map((item) => (
            <div
              key={item.num}
              className="grid gap-3 border-b border-rule py-7 transition-colors hover:bg-white/[0.015] md:grid-cols-[72px_260px_1fr_190px] md:items-baseline md:gap-6"
            >
              <span className="font-mono text-xs text-ink-muted">
                {item.num}
              </span>
              <h3 className="text-base font-medium tracking-tight text-ink-primary">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed text-ink-secondary">
                {item.description}
              </p>
              <span className="font-mono text-[11px] text-ink-muted md:text-right">
                {item.detail}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
