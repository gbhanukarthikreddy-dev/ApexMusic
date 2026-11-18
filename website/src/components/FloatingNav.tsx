import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Menu, X } from 'lucide-react';

interface FloatingNavProps {
  activeSection: string;
}

const NAV_ITEMS = [
  { id: 'home', label: 'HOME' },
  { id: 'features', label: 'FEATURES' },
  { id: 'app', label: 'APP' },
  { id: 'download', label: 'DOWNLOAD' },
  { id: 'faq', label: 'FAQ' },
];

export function FloatingNav({ activeSection }: FloatingNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const prefersReduced = useReducedMotion();

  const activeLabel =
    NAV_ITEMS.find((item) => item.id === activeSection)?.label || 'HOME';

  return (
    <nav
      aria-label="Primary navigation"
      className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-24px)] max-w-[680px] -translate-x-1/2 sm:bottom-6"
    >
      {/* Mobile Popover Menu */}
      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: prefersReduced ? 0 : 0.18 }}
            className="mb-3 rounded-3xl border border-line bg-black/85 p-3 backdrop-blur-xl shadow-2xl sm:hidden"
          >
            <div className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center justify-between rounded-2xl px-4 py-2.5 font-mono text-xs uppercase tracking-label transition-colors ${
                      isActive
                        ? 'bg-white/[0.08] text-bone'
                        : 'text-mute hover:bg-white/[0.04] hover:text-bone'
                    }`}
                  >
                    <span>{item.label}</span>
                    {isActive ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-apex" />
                    ) : null}
                  </a>
                );
              })}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Main Floating Pill */}
      <div className="flex items-center justify-between gap-2 rounded-full border border-line bg-black/70 p-1.5 backdrop-blur-xl shadow-2xl">
        {/* Apex Music logo badge */}
        <a
          href="#home"
          onClick={() => setMenuOpen(false)}
          aria-label="Apex Music Home"
          className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/15 transition-transform hover:scale-105 motion-reduce:transition-none"
        >
          <img
            src="/logo.png"
            alt="Apex Music logo"
            className="h-full w-full object-cover"
          />
        </a>

        {/* Desktop / Tablet Inline Links */}
        <div className="hidden items-center gap-4 px-2 sm:flex">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`relative whitespace-nowrap px-1.5 py-1.5 font-mono text-[11px] uppercase tracking-label transition-colors ${
                  isActive ? 'text-bone' : 'text-mute hover:text-bone'
                }`}
              >
                {item.label}
                {isActive ? (
                  <span
                    className="absolute bottom-0 left-1.5 right-1.5 h-px bg-apex"
                    aria-hidden="true"
                  />
                ) : null}
              </a>
            );
          })}
        </div>

        {/* Mobile Menu Trigger (shows active section cleanly without clipping) */}
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-expanded={menuOpen}
          aria-label="Toggle navigation menu"
          className="flex min-w-0 items-center gap-2 rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-label text-bone sm:hidden"
        >
          <span className="truncate">{activeLabel}</span>
          {menuOpen ? (
            <X className="h-3.5 w-3.5 shrink-0 text-apex" aria-hidden="true" />
          ) : (
            <Menu className="h-3.5 w-3.5 shrink-0 text-mute" aria-hidden="true" />
          )}
        </button>

        {/* White Download Pill */}
        <a
          href="#download"
          onClick={() => setMenuOpen(false)}
          className="shrink-0 rounded-full bg-bone px-3.5 py-2 font-mono text-[10px] font-semibold uppercase tracking-label text-ink transition-colors hover:bg-apex hover:text-bone sm:px-4 sm:text-[11px]"
        >
          DOWNLOAD +
        </a>
      </div>
    </nav>
  );
}
