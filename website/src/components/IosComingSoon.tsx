import { useState } from 'react';
import { ArrowLeft, Check, Download } from 'lucide-react';
import { APK_DOWNLOAD_URL } from '../lib/constants';

interface IosComingSoonProps {
  onBack: () => void;
}

export function IosComingSoon({ onBack }: IosComingSoonProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    setEmail('');
  };

  return (
    <div className="flex min-h-screen flex-col justify-between bg-canvas text-ink-primary">
      <header className="border-b border-rule px-4 sm:px-6">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm text-ink-secondary transition hover:text-ink-primary"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </button>

          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="Apex Music"
              className="h-7 w-7 rounded-lg ring-1 ring-white/15"
            />
            <span className="text-sm font-semibold">Apex Music</span>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-xl px-4 py-20 sm:px-6">
        <p className="font-mono text-xs text-ink-muted">IOS · TESTFLIGHT</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
          Coming to iPhone{' '}
          <span className="font-serif text-[1.12em] font-normal italic">
            soon.
          </span>
        </h1>

        <p className="mt-4 text-sm leading-relaxed text-ink-secondary sm:text-base">
          We&apos;re finishing up the iOS build with native background audio and
          lock-screen controls. Leave your email if you&apos;d like a TestFlight
          invite when it opens.
        </p>

        {submitted ? (
          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-5 py-2.5 text-sm text-emerald-300">
            <Check className="h-4 w-4" aria-hidden="true" />
            You&apos;re on the list.
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              aria-label="Email address for iOS waitlist"
              className="flex-1 rounded-full border border-rule-strong bg-panel px-5 py-3 text-sm text-ink-primary placeholder:text-ink-muted focus:border-white/40 focus:outline-none"
            />
            <button type="submit" className="btn-primary shrink-0">
              Notify me
            </button>
          </form>
        )}

        <div className="mt-10 border-t border-rule pt-6">
          <a
            href={APK_DOWNLOAD_URL}
            download="apexmusic.apk"
            className="inline-flex items-center gap-2 text-xs text-ink-secondary transition hover:text-ink-primary"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            On Android? Download apexmusic.apk now
          </a>
        </div>
      </main>

      <footer className="border-t border-rule px-4 py-6 text-center font-mono text-[11px] text-ink-muted sm:px-6">
        Apex Music
      </footer>
    </div>
  );
}
