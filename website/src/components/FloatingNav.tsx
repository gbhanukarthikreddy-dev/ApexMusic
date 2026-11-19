import { useState } from 'react';
import { Download, Menu, X } from 'lucide-react';
import { APK_DOWNLOAD_URL } from '../lib/constants';

interface FloatingNavProps {
  activeSection: string;
}

const NAV_LINKS = [
  { id: 'features', label: 'Features', href: '#features' },
  { id: 'app', label: 'Preview', href: '#app' },
  { id: 'languages', label: 'Languages', href: '#languages' },
  { id: 'faq', label: 'FAQ', href: '#faq' },
];

export function FloatingNav({ activeSection }: FloatingNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-rule bg-canvas/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <a
          href="#home"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson"
        >
          <img
            src="/logo.png"
            alt="Apex Music"
            className="h-7 w-7 rounded-lg object-cover ring-1 ring-white/15"
          />
          <span className="text-[15px] font-semibold tracking-tight text-ink-primary">
            Apex Music
          </span>
        </a>

        {/* Desktop Links */}
        <nav aria-label="Primary navigation" className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((item) => {
            const active = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={item.href}
                className={`text-sm transition-colors ${
                  active
                    ? 'text-ink-primary font-medium'
                    : 'text-ink-secondary hover:text-ink-primary'
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          <a
            href={APK_DOWNLOAD_URL}
            download="apexmusic.apk"
            className="inline-flex items-center gap-1.5 rounded-full bg-ink-primary px-4 py-2 text-xs font-medium text-canvas transition hover:bg-white active:scale-[0.98]"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Download APK</span>
          </a>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-rule text-ink-primary transition hover:bg-white/[0.05] md:hidden"
          >
            {mobileOpen ? (
              <X className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Menu className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t border-rule bg-canvas px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((item) => (
              <a
                key={item.id}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`rounded-lg px-3 py-2.5 text-sm ${
                  activeSection === item.id
                    ? 'bg-white/[0.06] font-medium text-ink-primary'
                    : 'text-ink-secondary hover:text-ink-primary'
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
