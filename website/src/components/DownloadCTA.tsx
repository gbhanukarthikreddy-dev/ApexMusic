import { ArrowUpRight, Download } from 'lucide-react';
import { APK_DOWNLOAD_URL } from '../lib/constants';

interface DownloadCTAProps {
  onOpenIos: () => void;
}

export function DownloadCTA({ onOpenIos }: DownloadCTAProps) {
  return (
    <section
      id="download"
      aria-labelledby="download-heading"
      className="border-b border-rule px-4 py-20 sm:px-6 lg:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Apex Music icon"
                className="h-11 w-11 rounded-xl ring-1 ring-white/15"
              />
              <span className="font-mono text-xs text-ink-muted">
                DIRECT RELEASE · GITHUB
              </span>
            </div>

            <h2
              id="download-heading"
              className="mt-5 text-3xl font-semibold tracking-[-0.03em] text-ink-primary sm:text-5xl"
            >
              Get Apex Music on{' '}
              <span className="font-serif text-[1.1em] font-normal italic">
                Android.
              </span>
            </h2>

            <p className="mt-4 max-w-lg text-sm leading-relaxed text-ink-secondary sm:text-base">
              Download the latest signed APK straight from GitHub Releases. No
              Play Store account, no tracking SDKs, and no subscription paywall.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href={APK_DOWNLOAD_URL}
                download="apexmusic.apk"
                className="btn-primary"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Download apexmusic.apk
              </a>
              <button
                type="button"
                onClick={onOpenIos}
                className="btn-secondary"
              >
                iOS Waitlist
                <ArrowUpRight className="h-4 w-4 text-ink-secondary" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Plain, Honest 3-Step Install Note */}
          <div className="rounded-2xl border border-rule bg-panel p-6">
            <p className="font-mono text-xs text-ink-muted">
              HOW TO INSTALL ON ANDROID
            </p>
            <ol className="mt-5 space-y-4 text-sm">
              <li className="flex gap-4">
                <span className="font-mono text-xs text-ink-muted">01</span>
                <div>
                  <p className="font-medium text-ink-primary">
                    Download the APK
                  </p>
                  <p className="mt-0.5 text-ink-secondary">
                    Tap the download button to grab the latest signed release.
                  </p>
                </div>
              </li>
              <li className="flex gap-4 border-t border-rule pt-4">
                <span className="font-mono text-xs text-ink-muted">02</span>
                <div>
                  <p className="font-medium text-ink-primary">
                    Open apexmusic.apk
                  </p>
                  <p className="mt-0.5 text-ink-secondary">
                    If Android prompts you, allow installs from your browser or
                    files app.
                  </p>
                </div>
              </li>
              <li className="flex gap-4 border-t border-rule pt-4">
                <span className="font-mono text-xs text-ink-muted">03</span>
                <div>
                  <p className="font-medium text-ink-primary">
                    Open and start listening
                  </p>
                  <p className="mt-0.5 text-ink-secondary">
                    No login screen. Search any track or save a playlist offline
                    right away.
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
