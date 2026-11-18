import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Check } from 'lucide-react';

interface IosComingSoonProps {
  onBack: () => void;
}

export function IosComingSoon({ onBack }: IosComingSoonProps) {
  const prefersReduced = useReducedMotion();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-ink px-3 py-3 text-bone sm:px-6 sm:py-6">
      <div className="frame relative mx-auto flex min-h-[calc(100vh-24px)] max-w-[1440px] flex-col justify-between overflow-hidden bg-ink px-6 py-7 sm:px-12 sm:py-10 lg:px-16 lg:py-12">
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-apex" aria-hidden="true" />
            <span className="label text-bone">APEX MUSIC · IOS</span>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="pill-btn-outline px-4 py-2 text-[11px]"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Back to Home
          </button>
        </div>

        {/* Center Coming Soon Content */}
        <motion.div
          initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReduced ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="my-auto flex flex-col items-center py-14 text-center"
        >
          <span className="label text-apex">TESTFLIGHT & APP STORE</span>

          <h1 className="mt-4 font-display text-[clamp(3.25rem,11vw,9.5rem)] leading-[0.86] tracking-[-0.04em] text-bone">
            COMING SOON<span className="text-apex">.</span>
          </h1>

          <p className="mt-6 max-w-lg text-base leading-relaxed text-bone/75 sm:text-lg">
            Apex Music for iPhone and iPad is currently in final tuning—native
            background audio, lock-screen Live Activities, and zero clutter.
          </p>

          {submitted ? (
            <div className="mt-8 inline-flex items-center gap-2.5 rounded-full border border-apex/50 bg-apex/15 px-6 py-3 font-mono text-xs uppercase tracking-label text-bone">
              <Check className="h-4 w-4 text-apex" aria-hidden="true" />
              You&apos;re on the iOS waitlist
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                aria-label="Email address for iOS early access"
                className="flex-1 rounded-full border border-line bg-white/[0.03] px-5 py-3 font-mono text-xs text-bone placeholder:text-mute focus:border-apex focus:outline-none"
              />
              <button type="submit" className="pill-btn shrink-0">
                Notify Me
              </button>
            </form>
          )}
        </motion.div>

        {/* Bottom Meta */}
        <div className="flex items-center justify-between">
          <span className="label">EST. 2026</span>
          <button
            type="button"
            onClick={onBack}
            className="font-mono text-[11px] uppercase tracking-label text-mute transition-colors hover:text-bone"
          >
            ANDROID APK AVAILABLE NOW →
          </button>
        </div>
      </div>
    </div>
  );
}
