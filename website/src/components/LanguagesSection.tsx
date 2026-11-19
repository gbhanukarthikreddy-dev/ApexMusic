import { useState } from 'react';
import { LANGUAGES } from '../lib/constants';

export function LanguagesSection() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const current = LANGUAGES[selectedIndex];

  return (
    <section
      id="languages"
      aria-labelledby="languages-heading"
      className="border-b border-rule px-4 py-20 sm:px-6 lg:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <div>
            <p className="font-mono text-xs text-ink-muted">NINE LANGUAGES</p>
            <h2
              id="languages-heading"
              className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-ink-primary sm:text-4xl"
            >
              Curated shelves for the music you{' '}
              <span className="font-serif text-[1.12em] font-normal italic">
                actually
              </span>{' '}
              play.
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink-secondary sm:text-base">
              Pick a language inside the app to switch your home shelves and
              mood playlists across English, Hindi, Telugu, Tamil, Punjabi,
              Malayalam, Kannada, K-Pop, and Spanish.
            </p>

            {/* Clean Typographic Grid of 9 Languages */}
            <div className="mt-8 grid grid-cols-3 border-l border-t border-rule">
              {LANGUAGES.map((lang, idx) => {
                const active = idx === selectedIndex;
                return (
                  <button
                    key={lang.name}
                    type="button"
                    onClick={() => setSelectedIndex(idx)}
                    className={`border-b border-r border-rule px-3.5 py-4 text-left transition ${active
                        ? 'bg-panel text-ink-primary'
                        : 'bg-transparent text-ink-secondary hover:bg-white/[0.02] hover:text-ink-primary'
                      }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium">{lang.name}</span>
                      {active && (
                        <span className="h-1.5 w-1.5 rounded-full bg-crimson" />
                      )}
                    </div>
                    <p className="mt-1 text-xs text-ink-muted">{lang.native}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Curated Shelf Preview */}
          <div className="rounded-2xl border border-rule bg-panel p-6 lg:mt-10">
            <div className="flex items-baseline justify-between border-b border-rule pb-4">
              <div>
                <h3 className="text-lg font-semibold text-ink-primary">
                  {current.name}
                </h3>
                <p className="mt-0.5 text-xs text-ink-secondary">
                  {current.vibe}
                </p>
              </div>
              <span className="font-mono text-xs text-ink-muted">
                {current.native}
              </span>
            </div>

            <div className="mt-4 divide-y divide-rule">
              {current.playlists.map((playlist, i) => (
                <div
                  key={playlist}
                  className="flex items-center justify-between py-3.5 text-sm"
                >
                  <span className="text-ink-primary">{playlist}</span>
                  <span className="font-mono text-[11px] text-ink-muted">
                    0{i + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
