import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Heart,
  ListMusic,
  Pause,
  Play,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
} from 'lucide-react';
import { Reveal } from './Reveal';

const CHAPTERS = [
  {
    id: 'full',
    index: '01',
    label: 'FULL PLAYER',
    title: 'IMMERSIVE NOW PLAYING.',
    body: 'Edge-to-edge album artwork, precision scrub bar, shuffle, repeat, and instant swipe-to-skip gestures—designed for one-handed control.',
  },
  {
    id: 'mini',
    index: '02',
    label: 'PERSISTENT MINI-PLAYER',
    title: 'ALWAYS WITHIN REACH.',
    body: 'A floating frosted-glass bar rides cleanly above the navigation pill. Tap to expand, swipe left or right to skip, or pause in a single thumb tap.',
  },
  {
    id: 'queue',
    index: '03',
    label: 'LIVE SMART QUEUE',
    title: 'REORDER ON THE MOVE.',
    body: 'Build your session dynamically. Swipe tracks into Up Next, drag or nudge songs in the queue, and never lose your groove.',
  },
] as const;

export function PhoneShowcase() {
  const [activeChapter, setActiveChapter] = useState<'full' | 'mini' | 'queue'>('full');
  const [playing, setPlaying] = useState(true);
  const prefersReduced = useReducedMotion();

  return (
    <section
      id="app"
      className="mx-auto max-w-[1440px] px-6 py-24 sm:px-12 lg:px-16 lg:py-32"
      aria-labelledby="showcase-heading"
    >
      <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
        {/* Left: Scrolling Captions */}
        <div className="space-y-12 lg:col-span-6">
          <Reveal>
            <span className="label text-apex">THE INTERFACE</span>
            <h2
              id="showcase-heading"
              className="mt-3 font-display text-4xl uppercase tracking-tight text-bone sm:text-5xl"
            >
              DESIGNED FOR PURE FOCUS.
            </h2>
          </Reveal>

          <div className="space-y-6">
            {CHAPTERS.map((chapter) => {
              const isSelected = activeChapter === chapter.id;
              return (
                <motion.button
                  key={chapter.id}
                  type="button"
                  onClick={() => setActiveChapter(chapter.id)}
                  onViewportEnter={() => setActiveChapter(chapter.id)}
                  viewport={{ amount: 0.6 }}
                  className={`w-full rounded-3xl border p-6 text-left transition duration-200 ${
                    isSelected
                      ? 'border-apex/60 bg-white/[0.04]'
                      : 'border-line bg-transparent hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] uppercase tracking-label text-apex">
                      {chapter.index} · {chapter.label}
                    </span>
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isSelected ? 'bg-apex' : 'bg-line'
                      }`}
                    />
                  </div>
                  <h3 className="mt-3 font-display text-2xl uppercase tracking-tight text-bone">
                    {chapter.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-bone/75 sm:text-base">
                    {chapter.body}
                  </p>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Right: Sticky Dark Phone Mockup */}
        <div className="lg:col-span-6">
          <div className="lg:sticky lg:top-20 flex justify-center">
            <div className="relative w-full max-w-[330px] rounded-[44px] border border-white/15 bg-[#0F0F12] p-4 shadow-[0_32px_90px_rgba(0,0,0,0.85)]">
              {/* Dynamic Island */}
              <div className="mx-auto mb-5 h-5 w-24 rounded-full bg-black" />

              {/* Screen Content */}
              <div className="flex h-[540px] flex-col justify-between rounded-[32px] border border-line bg-ink p-5">
                {/* Top Status */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-label text-mute">
                    {activeChapter === 'queue' ? 'UP NEXT' : 'NOW PLAYING'}
                  </span>
                  <span className="rounded-full border border-apex/40 bg-apex/15 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-label text-apex">
                    HI-FI
                  </span>
                </div>

                {activeChapter === 'queue' ? (
                  /* Queue View */
                  <div className="my-auto space-y-3">
                    {[
                      { title: 'Midnight Ascent', artist: 'Kaelen Vance', active: true },
                      { title: 'Solaris Echoes', artist: 'Nora Lindqvist', active: false },
                      { title: 'Thin Air (Live)', artist: 'Sora & The Peaks', active: false },
                      { title: 'Velvet Horizon', artist: 'Milo Hayes', active: false },
                    ].map((item, i) => (
                      <div
                        key={item.title}
                        className={`flex items-center justify-between rounded-2xl border p-3 ${
                          item.active
                            ? 'border-apex/50 bg-apex/10'
                            : 'border-line bg-white/[0.02]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-[10px] text-mute">
                            0{i + 1}
                          </span>
                          <div>
                            <div className="text-xs font-semibold text-bone">
                              {item.title}
                            </div>
                            <div className="text-[11px] text-mute">{item.artist}</div>
                          </div>
                        </div>
                        {item.active ? (
                          <span className="h-2 w-2 rounded-full bg-apex" />
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Artwork + Track Info */
                  <div className="my-auto space-y-5">
                    <motion.div
                      animate={
                        prefersReduced
                          ? undefined
                          : { scale: playing ? 1 : 0.94 }
                      }
                      transition={{ duration: 0.35 }}
                      className="relative aspect-square w-full overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-apex/40 via-[#1b1210] to-ink p-5"
                    >
                      <div className="flex h-full flex-col justify-between">
                        <span className="font-mono text-[10px] uppercase tracking-label text-bone/70">
                          APEX ORIGINAL
                        </span>
                        <div>
                          <div className="h-1 w-12 rounded-full bg-apex" />
                          <div className="mt-2 font-display text-2xl leading-none text-bone">
                            SUMMIT
                            <br />
                            SESSION
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-base font-bold text-bone">
                          Midnight Ascent
                        </div>
                        <div className="text-xs text-mute">Kaelen Vance</div>
                      </div>
                      <Heart className="h-5 w-5 text-apex" fill="#FF4500" />
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
                        <div className="h-full w-2/3 rounded-full bg-apex" />
                      </div>
                      <div className="mt-1.5 flex justify-between font-mono text-[10px] text-mute">
                        <span>2:14</span>
                        <span>3:42</span>
                      </div>
                    </div>

                    {/* Transport Controls */}
                    <div className="flex items-center justify-between px-2">
                      <Shuffle className="h-4 w-4 text-apex" />
                      <SkipBack className="h-5 w-5 text-bone" />
                      <button
                        type="button"
                        onClick={() => setPlaying((p) => !p)}
                        aria-label={playing ? 'Pause preview' : 'Play preview'}
                        className="flex h-12 w-12 items-center justify-center rounded-full bg-apex text-bone transition-transform hover:scale-105"
                      >
                        {playing ? (
                          <Pause className="h-5 w-5" />
                        ) : (
                          <Play className="ml-0.5 h-5 w-5" />
                        )}
                      </button>
                      <SkipForward className="h-5 w-5 text-bone" />
                      <Repeat className="h-4 w-4 text-mute" />
                    </div>
                  </div>
                )}

                {/* Bottom Mini-Player Preview */}
                <div className="rounded-2xl border border-line bg-white/[0.04] p-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-apex/80" />
                      <div>
                        <div className="text-[11px] font-semibold text-bone">
                          Midnight Ascent
                        </div>
                        <div className="text-[10px] text-mute">
                          {activeChapter === 'mini' ? 'SWIPE TO SKIP' : 'Kaelen Vance'}
                        </div>
                      </div>
                    </div>
                    <ListMusic className="h-4 w-4 text-mute" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
