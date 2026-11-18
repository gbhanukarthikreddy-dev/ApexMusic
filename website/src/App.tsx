import { useEffect, useState } from 'react';
import { DownloadCTA } from './components/DownloadCTA';
import { FAQ } from './components/FAQ';
import { Features } from './components/Features';
import { FloatingNav } from './components/FloatingNav';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero';
import { IosComingSoon } from './components/IosComingSoon';
import { PhoneShowcase } from './components/PhoneShowcase';
import { Stats } from './components/Stats';
import { useLenis } from './hooks/useLenis';
import { useScrollSpy } from './hooks/useScrollSpy';

const SECTIONS = ['home', 'features', 'app', 'download', 'faq'];

export default function App() {
  useLenis();
  const activeSection = useScrollSpy(SECTIONS, 'home');
  const [isIosPage, setIsIosPage] = useState(
    () => typeof window !== 'undefined' && window.location.hash === '#/ios'
  );

  useEffect(() => {
    const onHashChange = () => {
      setIsIosPage(window.location.hash === '#/ios');
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const openIosPage = () => {
    window.location.hash = '#/ios';
    window.scrollTo({ top: 0 });
    setIsIosPage(true);
  };

  const backToHome = () => {
    window.location.hash = '#download';
    setIsIosPage(false);
  };

  if (isIosPage) {
    return <IosComingSoon onBack={backToHome} />;
  }

  return (
    <div className="min-h-screen bg-ink text-bone">
      <main>
        <Hero />
        <Features />
        <PhoneShowcase />
        <Stats />
        <DownloadCTA onOpenIos={openIosPage} />
        <FAQ />
      </main>
      <Footer />
      <FloatingNav activeSection={activeSection} />
    </div>
  );
}
