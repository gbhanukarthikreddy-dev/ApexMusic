import { motion, useReducedMotion } from 'framer-motion';

const LETTERS = 'APEX MUSIC'.split('');

export function Hero() {
  const prefersReduced = useReducedMotion();

  return (
    <section
      id="home"
      className="px-3 pt-3 sm:px-6 sm:pt-6"
      aria-label="Hero"
    >
      <div className="frame relative mx-auto flex min-h-[calc(100vh-24px)] max-w-[1440px] flex-col justify-between overflow-hidden bg-ink px-5 py-6 sm:px-12 sm:py-10 lg:px-16 lg:py-12">
        {/* Subtle centered ambient summit glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[380px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-apex/[0.08] blur-[120px]"
        />

        {/* Top Architectural Frame Labels */}
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-apex" aria-hidden="true" />
            <span className="label text-bone">SUMMIT SOUND</span>
          </div>

          <div className="text-right font-mono text-[10px] uppercase leading-relaxed tracking-label text-mute sm:text-[11px]">
            <div>ELEV. 8,848M</div>
            <div className="text-apex">EST. 2026</div>
          </div>
        </div>

        {/* Centered Single-Line Animated Brand Title */}
        <div className="relative z-10 my-auto flex flex-col items-center py-12 text-center">
          <h1
            aria-label="APEX MUSIC."
            className="inline-flex items-baseline whitespace-nowrap font-display text-[clamp(2.5rem,11vw,10.5rem)] leading-[0.9] tracking-[-0.04em] text-bone"
          >
            {LETTERS.map((char, idx) => (
              <motion.span
                key={`${char}-${idx}`}
                aria-hidden="true"
                initial={
                  prefersReduced
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 40, filter: 'blur(8px)' }
                }
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{
                  duration: prefersReduced ? 0 : 0.55,
                  delay: prefersReduced ? 0 : idx * 0.045,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="inline-block"
              >
                {char === ' ' ? '\u00A0' : char}
              </motion.span>
            ))}
            <motion.span
              aria-hidden="true"
              initial={
                prefersReduced ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }
              }
              animate={
                prefersReduced
                  ? { opacity: 1, scale: 1 }
                  : { opacity: 1, scale: [0, 1.25, 1] }
              }
              transition={{
                duration: prefersReduced ? 0 : 0.5,
                delay: prefersReduced ? 0 : LETTERS.length * 0.045 + 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="inline-block text-apex"
            >
              .
            </motion.span>
          </h1>

          <motion.p
            initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: prefersReduced ? 0 : 0.6,
              delay: prefersReduced ? 0 : 0.55,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mt-5 font-mono text-[10px] uppercase tracking-label text-mute sm:mt-6 sm:text-xs"
          >
            STREAM · DISCOVER · REPEAT
          </motion.p>
        </div>

        {/* Bottom Architectural Frame Anchors */}
        <div className="relative z-10 flex items-end justify-between pb-16 sm:pb-12">
          <span className="label">HI-FI · ZERO ADS</span>
          <a
            href="#features"
            className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-label text-mute transition-colors hover:text-bone"
          >
            <span>SCROLL TO CLIMB</span>
            <motion.span
              aria-hidden="true"
              animate={prefersReduced ? undefined : { scaleY: [0.6, 1, 0.6] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              className="h-7 w-px origin-top bg-apex"
            />
          </a>
        </div>
      </div>
    </section>
  );
}
