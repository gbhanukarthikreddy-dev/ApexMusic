import { Github, Instagram, Mail, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mx-auto max-w-[1440px] border-t border-line px-6 pb-32 pt-12 sm:px-12 lg:px-16">
      <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-center">
        <div>
          <div className="font-display text-2xl tracking-tight text-bone">
            APEX<span className="text-apex">.</span>
          </div>
          <div className="label mt-2">© 2026 APEX MUSIC</div>
        </div>

        <div className="flex flex-wrap items-center gap-6 font-mono text-[11px] uppercase tracking-label text-mute">
          <a href="#home" className="transition-colors hover:text-bone hover:underline hover:decoration-apex hover:underline-offset-4">
            HOME
          </a>
          <a href="#features" className="transition-colors hover:text-bone hover:underline hover:decoration-apex hover:underline-offset-4">
            FEATURES
          </a>
          <a href="#app" className="transition-colors hover:text-bone hover:underline hover:decoration-apex hover:underline-offset-4">
            APP
          </a>
          <a href="#download" className="transition-colors hover:text-bone hover:underline hover:decoration-apex hover:underline-offset-4">
            DOWNLOAD
          </a>
          <a href="#faq" className="transition-colors hover:text-bone hover:underline hover:decoration-apex hover:underline-offset-4">
            FAQ
          </a>
        </div>

        <div className="flex items-center gap-4 text-mute">
          <a
            href="https://github.com/gbhanukarthikreddy-dev/ApexMusic"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="rounded-full border border-line p-2 transition-colors hover:border-apex hover:text-apex"
          >
            <Github className="h-4 w-4" />
          </a>
          <a
            href="#download"
            aria-label="Twitter"
            className="rounded-full border border-line p-2 transition-colors hover:border-apex hover:text-apex"
          >
            <Twitter className="h-4 w-4" />
          </a>
          <a
            href="#download"
            aria-label="Instagram"
            className="rounded-full border border-line p-2 transition-colors hover:border-apex hover:text-apex"
          >
            <Instagram className="h-4 w-4" />
          </a>
          <a
            href="mailto:hello@apexmusic.app"
            aria-label="Email"
            className="rounded-full border border-line p-2 transition-colors hover:border-apex hover:text-apex"
          >
            <Mail className="h-4 w-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}
