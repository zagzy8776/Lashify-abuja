import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
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
import ServiceLocationPage from './components/ServiceLocationPage';
import SEOSchema from './components/SEOSchema';
import type { Service } from './lib/supabase';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [preselectedService, setPreselectedService] = useState<Service | null>(null);

  // Extract the page name from the path for the Navbar
  const page = location.pathname === '/' ? 'home' 
    : location.pathname.substring(1).split('/')[0];
  const isAdmin = page === 'admin';

  const handleNavigate = (newPage: string) => {
    if (newPage !== 'book') setPreselectedService(null);
    navigate(newPage === 'home' ? '/' : `/${newPage}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookService = (service: Service) => {
    setPreselectedService(service);
    navigate('/book');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-white">
      <SEOSchema title="Lash & Brow Studio" description="Premium Lash and Brow services in Abuja. Book your luxury appointment today." />
      {!isAdmin && <Navbar onNavigate={handleNavigate} currentPage={page} />}

      <Routes>
        <Route path="/" element={
          <>
            <Hero onNavigate={handleNavigate} onBookService={handleBookService} />
            <Services onNavigate={handleNavigate} onBookService={handleBookService} compact />
            <About onNavigate={handleNavigate} />
            <Gallery />
            <Reviews />
            <Contact />
          </>
        } />
        
        <Route path="/services" element={
          <div className="pt-20">
            <Services onNavigate={handleNavigate} onBookService={handleBookService} />
          </div>
        } />
        
        {/* Dynamic SEO Route */}
        <Route path="/service/:serviceSlug-in-:locationSlug" element={
          <div className="pt-20">
            <ServiceLocationPage onNavigate={handleNavigate} onBookService={handleBookService} />
          </div>
        } />

        <Route path="/gallery" element={<div className="pt-20"><Gallery /></div>} />
        
        <Route path="/about" element={
          <div className="pt-20">
            <About onNavigate={handleNavigate} />
            <Reviews />
          </div>
        } />
        
        <Route path="/contact" element={<div className="pt-20"><Contact /></div>} />
        
        <Route path="/book" element={<Booking onNavigate={handleNavigate} preselectedService={preselectedService} />} />
        
        <Route path="/admin" element={<Admin onNavigate={handleNavigate} />} />
      </Routes>

      {!isAdmin && <Footer />}
    </div>
  );
}

export default App;
