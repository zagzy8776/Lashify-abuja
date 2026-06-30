import { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Hero from './components/Hero';
import Services from './components/Services';
import Gallery from './components/Gallery';
import About from './components/About';
import Contact from './components/Contact';
import Reviews from './components/Reviews';
import Booking from './components/Booking';
import Admin from './components/Admin';
import type { Service } from './lib/supabase';
import { Calendar, ArrowRight, Star, Instagram } from 'lucide-react';

type Page = 'home' | 'services' | 'gallery' | 'about' | 'contact' | 'book' | 'admin';

function App() {
  const [page, setPage] = useState<Page>('home');
  const [preselectedService, setPreselectedService] = useState<Service | null>(null);

  const navigate = (newPage: string) => {
    setPage(newPage as Page);
    if (newPage !== 'book') setPreselectedService(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookService = (service: Service) => {
    setPreselectedService(service);
    setPage('book');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isAdmin = page === 'admin';

  return (
    <div className="min-h-screen" style={{ background: '#0a0806' }}>
      {!isAdmin && <Navbar onNavigate={navigate} currentPage={page} />}

      {page === 'home' && (
        <>
          <Hero onNavigate={navigate} />
          <Services onNavigate={navigate} onBookService={handleBookService} compact />
          <About onNavigate={navigate} />
          <Gallery />
          <Reviews />
          <CTASection onNavigate={navigate} />
          <Contact onNavigate={navigate} />
        </>
      )}

      {page === 'services' && (
        <div className="pt-20">
          <Services onNavigate={navigate} onBookService={handleBookService} />
          <CTASection onNavigate={navigate} />
        </div>
      )}

      {page === 'gallery' && (
        <div className="pt-20">
          <Gallery />
          <CTASection onNavigate={navigate} />
        </div>
      )}

      {page === 'about' && (
        <div className="pt-20">
          <About onNavigate={navigate} />
          <Reviews />
          <CTASection onNavigate={navigate} />
        </div>
      )}

      {page === 'contact' && (
        <div className="pt-20">
          <Contact onNavigate={navigate} />
        </div>
      )}

      {page === 'book' && (
        <Booking onNavigate={navigate} preselectedService={preselectedService} />
      )}

      {page === 'admin' && <Admin onNavigate={navigate} />}

      {!isAdmin && <Footer onNavigate={navigate} />}
    </div>
  );
}

function CTASection({ onNavigate }: { onNavigate: (page: string) => void }) {
  return (
    <section className="py-28 relative overflow-hidden" style={{ background: '#0a0806' }}>
      {/* Radial amber glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(180,100,20,0.12) 0%, transparent 70%)' }} />
      <div className="divider-gold absolute top-0 left-0 right-0" />
      <div className="divider-gold absolute bottom-0 left-0 right-0" />

      <div className="container-lux relative z-10 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-8"
          style={{ background: 'rgba(212,168,39,0.08)', border: '1px solid rgba(212,168,39,0.25)' }}>
          <img
            src="/images/WhatsApp_Image_2026-06-30_at_2.12.44_PM.jpeg"
            alt="LashifyAbuja"
            className="w-full h-full object-cover rounded-full"
          />
        </div>

        <h2 className="heading-serif mb-5" style={{ fontSize: 'clamp(2.5rem,7vw,5rem)', color: '#f9f1e8' }}>
          Ready?
          <br />
          <span style={{
            background: 'linear-gradient(135deg, #b8891a 0%, #e8c45a 40%, #d4a827 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontStyle: 'italic',
          }}>
            Book Now
          </span>
        </h2>
        <p className="text-base max-w-sm mx-auto mb-10" style={{ color: '#4e3219' }}>
          Your eyes deserve the very best.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={() => onNavigate('book')} className="btn-gold group">
            <Calendar className="w-5 h-5" />
            Book Now
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <a
            href="https://www.instagram.com/lashifyabuja.ng?igsh=ajEyb3BuZDZnemlq"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline"
          >
            <Instagram className="w-5 h-5" />
            Follow Our Work
          </a>
        </div>
        <div className="flex items-center justify-center gap-2 mt-10">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4" style={{ fill: '#d4a827', color: '#d4a827' }} />
            ))}
          </div>
          <span className="text-sm" style={{ color: '#3d2612' }}>
            Rated 4.9/5 by 500+ happy clients
          </span>
        </div>
      </div>
    </section>
  );
}

export default App;
