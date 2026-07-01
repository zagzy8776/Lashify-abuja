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
          <Contact />
        </>
      )}

      {page === 'services' && (
        <div className="pt-20">
          <Services onNavigate={navigate} onBookService={handleBookService} />
        </div>
      )}

      {page === 'gallery' && (
        <div className="pt-20">
          <Gallery />
        </div>
      )}

      {page === 'about' && (
        <div className="pt-20">
          <About onNavigate={navigate} />
          <Reviews />
        </div>
      )}

      {page === 'contact' && (
        <div className="pt-20">
          <Contact />
        </div>
      )}

      {page === 'book' && (
        <Booking onNavigate={navigate} preselectedService={preselectedService} />
      )}

      {page === 'admin' && <Admin onNavigate={navigate} />}

      {!isAdmin && <Footer />}
    </div>
  );
}

export default App;
