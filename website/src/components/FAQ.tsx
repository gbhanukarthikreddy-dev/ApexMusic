import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Reveal } from './Reveal';

const FAQS = [
  {
    num: '01',
    q: 'Is Apex Music free to stream?',
    a: 'Yes. Apex Music lets you stream millions of tracks, explore trending releases, and build your personal library with zero interrupting audio ads.',
  },
  {
    num: '02',
    q: 'Does it support background playback and lock-screen controls?',
    a: 'Yes. Audio continues playing smoothly when your screen is locked or when switching apps, complete with native lock-screen artwork and skip controls.',
  },
  {
    num: '03',
    q: 'How does the swipe queue work?',
    a: 'Swipe left on any song row to drop it straight into your Up Next queue, or open the queue manager to reorder and remove tracks anytime.',
  },
  {
    num: '04',
    q: 'Can I choose my audio streaming quality?',
    a: 'Yes. Switch between Data Saver, Balanced, and Studio High directly in Settings to match your connection or listening setup.',
  },
  {
    num: '05',
    q: 'Where is my library stored?',
    a: 'Your liked songs, custom playlists, listening history, and saved tracks are persisted locally on your device for instant access.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const prefersReduced = useReducedMotion();

  return (
    <section
      id="faq"
      className="mx-auto max-w-[1440px] px-6 py-20 sm:px-12 lg:px-16 lg:py-28"
      aria-labelledby="faq-heading"
    >
      <Reveal>
        <div className="mb-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="label text-apex">QUESTIONS</span>
            <h2
              id="faq-heading"
              className="mt-3 font-display text-4xl uppercase tracking-tight text-bone sm:text-5xl"
            >
              FAQ.
            </h2>
          </div>
          <span className="label">EVERYTHING YOU NEED TO KNOW</span>
        </div>
      </Reveal>

      <div className="divide-y divide-line border-y border-line">
        {FAQS.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={item.num} className="py-6">
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-6 text-left"
              >
                <div className="flex items-baseline gap-5">
                  <span className="font-mono text-xs text-apex">{item.num}</span>
                  <span className="text-lg font-semibold text-bone sm:text-xl">
                    {item.q}
                  </span>
                </div>
                <Plus
                  className={`h-5 w-5 shrink-0 text-mute transition-transform duration-200 ${
                    isOpen ? 'rotate-45 text-apex' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen ? (
                  <motion.div
                    initial={prefersReduced ? { opacity: 1 } : { height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={prefersReduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                    transition={{ duration: prefersReduced ? 0 : 0.25 }}
                    className="overflow-hidden"
                  >
                    <p className="mt-4 max-w-2xl pl-9 text-sm leading-relaxed text-bone/75 sm:text-base">
                      {item.a}
                    </p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
