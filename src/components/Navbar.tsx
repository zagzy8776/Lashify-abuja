import { useEffect, useState, useRef } from 'react';
import { Menu, X, Calendar } from 'lucide-react';

type Props = {
  onNavigate: (page: string) => void;
  currentPage: string;
};

const navLinks = [
  { label: 'Home', page: 'home' },
  { label: 'Services', page: 'services' },
  { label: 'Gallery', page: 'gallery' },
  { label: 'About', page: 'about' },
  { label: 'Contact', page: 'contact' },
];

export default function Navbar({ onNavigate, currentPage }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const tapCount = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu when tapping outside
  useEffect(() => {
    if (!mobileOpen) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [mobileOpen]);

  const handleNav = (page: string) => {
    onNavigate(page);
    setMobileOpen(false);
  };

  // Secret triple-tap on logo → admin
  const handleLogoTap = () => {
    tapCount.current += 1;
    if (tapTimer.current) clearTimeout(tapTimer.current);
    if (tapCount.current >= 3) {
      tapCount.current = 0;
      onNavigate('admin');
      setMobileOpen(false);
      return;
    }
    tapTimer.current = setTimeout(() => { tapCount.current = 0; }, 1500);
    handleNav('home');
  };

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'py-3' : 'py-5'
      }`}
      style={{
        background: scrolled
          ? 'rgba(255, 255, 255, 0.55)'
          : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(179, 139, 158, 0.15)' : 'none',
      }}
    >
      <nav className="container-lux flex items-center justify-between">
        <button onClick={handleLogoTap} className="flex items-center gap-3 group">
          <div className="w-11 h-11 transition-all duration-300">
            <img
              src="/images/logo.webp"
              alt="LashifyAbuja Logo"
              width="44"
              height="44"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="text-left leading-none">
            <div className="font-serif text-xl tracking-wide" style={{ color: '#3d2e36' }}>
              Lashify<span style={{ color: '#b38b9e' }}>Abuja</span>
            </div>
            <div className="text-[10px] uppercase tracking-[0.2em] mt-0.5" style={{ color: '#8f7882' }}>
              Lash &amp; Brow Studio
            </div>
          </div>
        </button>
 
        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <button
              key={link.page}
              onClick={() => handleNav(link.page)}
              className="px-4 py-2 text-sm font-medium tracking-wide rounded-full transition-all duration-300"
              style={{
                color: currentPage === link.page ? '#b38b9e' : '#5a4850',
              }}
              onMouseEnter={(e) => { if (currentPage !== link.page) (e.target as HTMLElement).style.color = '#b38b9e'; }}
              onMouseLeave={(e) => { if (currentPage !== link.page) (e.target as HTMLElement).style.color = '#5a4850'; }}
            >
              {link.label}
            </button>
          ))}
          <button onClick={() => handleNav('book')} className="btn-gold ml-3 text-sm">
            <Calendar className="w-4 h-4" />
            Book Now
          </button>
        </div>
 
        {/* Mobile toggle */}
        <button
          className="md:hidden p-3"
          style={{ color: '#b38b9e' }}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>
 
      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 border-t animate-fade-down"
          style={{ background: 'rgba(250, 247, 242, 0.95)', borderColor: 'rgba(179, 139, 158, 0.12)', backdropFilter: 'blur(12px)' }}>
          <div className="container-lux py-6 flex flex-col gap-2">
            {navLinks.map((link) => (
              <button
                key={link.page}
                onClick={() => handleNav(link.page)}
                className="px-4 py-4 text-left text-base font-medium rounded-lg transition-colors"
                style={{
                  color: currentPage === link.page ? '#b38b9e' : '#5a4850',
                  background: currentPage === link.page ? 'rgba(179, 139, 158, 0.1)' : 'transparent',
                }}
              >
                {link.label}
              </button>
            ))}
            <button onClick={() => handleNav('book')} className="btn-gold mt-4 py-4">
              <Calendar className="w-4 h-4" />
              Book Now
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
