import { Reveal } from './Reveal';

interface AltitudeStage {
  index: string;
  camp: string;
  elevation: string;
  title: string;
  description: string;
  tags: string[];
}

const STAGES: AltitudeStage[] = [
  {
    index: '01',
    camp: 'BASE CAMP 01',
    elevation: '1,800M',
    title: 'UNLIMITED STREAMING. ZERO CLUTTER.',
    description:
      'Stream millions of songs, albums, and curated playlists in high-fidelity audio with adaptive quality switching—no algorithmic bloat, no visual noise.',
    tags: ['HI-FI AUDIO', 'TRENDING & RELEASES', 'INSTANT SEARCH'],
  },
  {
    index: '02',
    camp: 'CAMP II',
    elevation: '4,200M',
    title: 'BACKGROUND PLAYBACK & LOCK-SCREEN CONTROLS.',
    description:
      'Lock your phone and keep climbing. Full OS media session integration with lock-screen artwork, seek scrubbing, and notification transport controls.',
    tags: ['LOCK SCREEN UI', 'BACKGROUND AUDIO', 'SEAMLESS HANDOFF'],
  },
  {
    index: '03',
    camp: 'CAMP III',
    elevation: '6,500M',
    title: 'SMART QUEUE & SWIPE GESTURES.',
    description:
      'Swipe left on any track to queue it instantly, reorder your Up Next stack on the fly, and enjoy zero-gap pre-buffered transitions between tracks.',
    tags: ['SWIPE TO QUEUE', 'UP NEXT REORDER', 'PRE-BUFFERED SKIPS'],
  },
  {
    index: '04',
    camp: 'SUMMIT',
    elevation: '8,848M',
    title: 'OFFLINE LIBRARY, LYRICS & PERSONALIZED MIXES.',
    description:
      'Your liked songs, custom playlists, listening history, and saved tracks live locally on your device—paired with time-synced lyrics and daily mixes.',
    tags: ['OFFLINE LIBRARY', 'SYNCED LYRICS', 'PERSONALIZED MIXES'],
  },
];

function ContourDivider() {
  return (
    <svg
      viewBox="0 0 1200 32"
      fill="none"
      className="my-12 h-6 w-full text-line sm:my-16"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M0 16 C 220 2, 420 30, 620 16 C 820 2, 1020 28, 1200 16"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M0 22 C 260 10, 480 28, 700 18 C 920 8, 1080 24, 1200 20"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeOpacity="0.6"
      />
    </svg>
  );
}

export function Features() {
  return (
    <section
      id="features"
      className="mx-auto max-w-[1440px] px-6 py-24 sm:px-12 lg:px-16 lg:py-32"
      aria-labelledby="features-heading"
    >
      <Reveal>
        <div className="flex flex-col justify-between gap-6 border-b border-line pb-10 sm:flex-row sm:items-end">
          <div>
            <span className="label text-apex">THE ASCENT</span>
            <h2
              id="features-heading"
              className="mt-3 font-display text-4xl uppercase tracking-tight text-bone sm:text-6xl"
            >
              BUILT FOR EVERY ELEVATION.
            </h2>
          </div>
          <p className="max-w-sm font-mono text-xs uppercase leading-relaxed tracking-label text-mute">
            FOUR STAGES FROM FIRST PLAY TO FULL SUMMIT IMMERSION.
          </p>
        </div>
      </Reveal>

      <div className="mt-14">
        {STAGES.map((stage, idx) => (
          <div key={stage.index}>
            <Reveal delay={0.05}>
              <article className="group grid grid-cols-1 gap-6 rounded-3xl border border-transparent p-4 transition duration-300 hover:-translate-y-1 hover:border-line hover:bg-white/[0.02] motion-reduce:transform-none motion-reduce:transition-none lg:grid-cols-12 lg:items-start lg:p-6">
                {/* Altitude Marker */}
                <div className="flex items-center gap-4 lg:col-span-4">
                  <span className="font-mono text-xs text-apex">/{stage.index}</span>
                  <div>
                    <div className="font-mono text-xs uppercase tracking-label text-bone">
                      {stage.camp}
                    </div>
                    <div className="font-mono text-[10px] uppercase tracking-label text-mute">
                      ELEV. {stage.elevation}
                    </div>
                  </div>
                </div>

                {/* Feature Copy */}
                <div className="lg:col-span-8">
                  <h3 className="font-display text-2xl uppercase tracking-tight text-bone transition-colors group-hover:text-apex sm:text-3xl">
                    {stage.title}
                  </h3>
                  <p className="mt-3 max-w-2xl text-base leading-relaxed text-bone/75">
                    {stage.description}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {stage.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-line px-3 py-1 font-mono text-[10px] uppercase tracking-label text-mute"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            </Reveal>

            {idx < STAGES.length - 1 ? <ContourDivider /> : null}
          </div>
        ))}
      </div>
    </section>
  );
}
