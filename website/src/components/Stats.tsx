import { Reveal } from './Reveal';

const METRICS = [
  { value: '0', label: 'Ads & Interruptions', detail: 'Ever. No banners, no audio ads.' },
  { value: '9', label: 'Curated Languages', detail: 'From English & K-Pop to Telugu & Hindi.' },
  { value: '100%', label: 'Offline Ready', detail: 'Single songs & full bundled playlists.' },
  { value: '60fps', label: 'Liquid Glass UI', detail: 'True OLED dark with fluid gestures.' },
];

export function Stats() {
  return (
    <section aria-label="Highlights" className="px-4 py-10 sm:px-6 lg:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {METRICS.map((item, idx) => (
            <Reveal key={item.label} delay={idx * 0.05}>
              <div className="glass-card flex h-full flex-col justify-between rounded-glass p-6">
                <span className="font-display text-4xl font-extrabold tracking-tighter text-gradient-silver sm:text-5xl">
                  {item.value}
                </span>
                <div className="mt-5">
                  <p className="font-display text-base font-bold text-white">
                    {item.label}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-mist">
                    {item.detail}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
