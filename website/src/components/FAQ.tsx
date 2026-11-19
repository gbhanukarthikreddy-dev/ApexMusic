import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';

const FAQS = [
  {
    q: 'Is Apex Music actually free and ad-free?',
    a: 'Yes. There are no banner ads, no audio ads between songs, and no account sign-up required.',
  },
  {
    q: 'Can I download whole playlists for offline playback?',
    a: 'Yes. Open any playlist and tap download to save every track with live x/y progress. Downloaded Playlists and Downloaded Songs appear in separate sections in your library and work with zero internet.',
  },
  {
    q: 'Where do the synced lyrics come from?',
    a: 'Time-synced LRC lyrics are fetched from LRCLIB. They auto-scroll as the track plays, and you can tap any line to jump straight to that part of the song.',
  },
  {
    q: 'Do lock-screen and notification controls work properly?',
    a: 'Yes. Background playback runs natively on Android with a seek bar plus Previous, Play/Pause, and Next controls wired directly to your real playback queue.',
  },
  {
    q: 'What about iOS?',
    a: 'The iOS build is still being finalized. You can leave your email on the iOS Waitlist page and we will let you know when TestFlight opens.',
  },
];

export function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="border-b border-rule px-4 py-20 sm:px-6 lg:py-28"
    >
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.38fr_0.62fr]">
        <div>
          <p className="font-mono text-xs text-ink-muted">FAQ</p>
          <h2
            id="faq-heading"
            className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-ink-primary sm:text-4xl"
          >
            Common{' '}
            <span className="font-serif text-[1.12em] font-normal italic">
              questions.
            </span>
          </h2>
        </div>

        <div className="divide-y divide-rule border-y border-rule">
          {FAQS.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div key={item.q}>
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="text-base font-medium text-ink-primary">
                    {item.q}
                  </span>
                  {isOpen ? (
                    <Minus className="h-4 w-4 shrink-0 text-ink-secondary" aria-hidden="true" />
                  ) : (
                    <Plus className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
                  )}
                </button>
                {isOpen && (
                  <p className="pb-5 pr-8 text-sm leading-relaxed text-ink-secondary">
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
