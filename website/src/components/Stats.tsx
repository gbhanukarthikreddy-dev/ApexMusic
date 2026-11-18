import { Reveal } from './Reveal';

const STATS = [
  { value: '100M+', label: 'SONGS READY TO STREAM' },
  { value: '0', label: 'ADS IN THE WAY' },
  { value: '4.8', label: 'LISTENER RATING' },
];

export function Stats() {
  return (
    <section
      className="mx-auto max-w-[1440px] px-6 py-16 sm:px-12 lg:px-16"
      aria-label="Key metrics"
    >
      <Reveal>
        <div className="grid grid-cols-1 divide-y divide-line rounded-frame border border-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {STATS.map((stat) => (
            <div key={stat.label} className="p-8 sm:p-12">
              <div className="font-display text-5xl tracking-tight text-bone sm:text-6xl lg:text-7xl">
                {stat.value}
                <span className="text-apex">.</span>
              </div>
              <div className="label mt-3">{stat.label}</div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
