import { APK_DOWNLOAD_URL, GITHUB_REPO_URL } from '../lib/constants';

export function Footer() {
  return (
    <footer className="px-4 py-10 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt="Apex Music"
            className="h-7 w-7 rounded-lg ring-1 ring-white/15"
          />
          <span className="text-sm font-medium text-ink-primary">
            Apex Music
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs text-ink-secondary">
          <a href="#features" className="transition hover:text-ink-primary">
            Features
          </a>
          <a href="#app" className="transition hover:text-ink-primary">
            Preview
          </a>
          <a href="#languages" className="transition hover:text-ink-primary">
            Languages
          </a>
          <a
            href={APK_DOWNLOAD_URL}
            download="apexmusic.apk"
            className="transition hover:text-ink-primary"
          >
            Download APK
          </a>
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-ink-primary"
          >
            GitHub
          </a>
        </div>

        <p className="font-mono text-[11px] text-ink-muted">
          © {new Date().getFullYear()} Apex Music
        </p>
      </div>
    </footer>
  );
}
