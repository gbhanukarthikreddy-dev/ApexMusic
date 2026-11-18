import { ArrowUpRight, Smartphone } from 'lucide-react';
import { Reveal } from './Reveal';

interface DownloadCTAProps {
  onOpenIos: () => void;
}

export function DownloadCTA({ onOpenIos }: DownloadCTAProps) {
  return (
    <section
      id="download"
      className="mx-auto max-w-[1440px] px-3 py-20 sm:px-6 lg:py-28"
      aria-labelledby="download-heading"
    >
      <Reveal>
        <div className="frame relative overflow-hidden bg-ink px-6 py-16 sm:px-12 sm:py-24 lg:px-16">
          <span className="label text-apex">AVAILABLE NOW</span>
          <h2
            id="download-heading"
            className="mt-4 font-display text-[clamp(3.25rem,9vw,7.5rem)] leading-[0.88] tracking-[-0.03em] text-bone"
          >
            REACH THE APEX<span className="text-apex">.</span>
          </h2>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-bone/75 sm:text-lg">
            Install Apex Music on Android or join early access for iOS and carry
            your entire sound universe in your pocket—fast, lightweight, and
            ad-free.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="https://github.com/gbhanukarthikreddy-dev/ApexMusic/releases/latest/download/apexmusic.apk"
              download="apexmusic.apk"
              className="pill-btn"
            >
              <Smartphone className="h-4 w-4" aria-hidden="true" />
              Download for Android (APK)
            </a>
            <button type="button" onClick={onOpenIos} className="pill-btn-outline">
              Get on iOS
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
