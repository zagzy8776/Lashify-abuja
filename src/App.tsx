import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import type { Service } from './lib/supabase';
import { Toaster } from 'react-hot-toast';

// Eagerly loaded — always needed on first paint
import Hero from './components/Hero';
import Services from './components/Services';
import About from './components/About';
import Contact from './components/Contact';
import Reviews from './components/Reviews';
import SEOSchema from './components/SEOSchema';

// Lazy loaded — only fetched when the user navigates to them
const Gallery = lazy(() => import('./components/Gallery'));
const Booking = lazy(() => import('./components/Booking'));
const Admin = lazy(() => import('./components/Admin'));
const ServiceLocationPage = lazy(() => import('./components/ServiceLocationPage'));

// Minimal inline spinner — no extra dependency needed
function PageLoader() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        border: '3px solid #ffe4e6',
        borderTopColor: '#f43f5e',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [preselectedService, setPreselectedService] = useState<Service | null>(null);

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
    <div className="min-h-screen" style={{ backgroundColor: '#faf5f0' }}>
      <Toaster position="bottom-right" />
      <SEOSchema title="Lash &amp; Brow Studio" description="Premium Lash and Brow services in Abuja. Book your luxury appointment today." />
      {!isAdmin && <Navbar onNavigate={handleNavigate} currentPage={page} />}

      <Suspense fallback={<PageLoader />}>
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

          <Route path="/book" element={
            <Booking onNavigate={handleNavigate} preselectedService={preselectedService} />
          } />

          <Route path="/admin" element={<Admin onNavigate={handleNavigate} />} />
        </Routes>
      </Suspense>

      {!isAdmin && <Footer />}
    </div>
  );
}

export default App;
