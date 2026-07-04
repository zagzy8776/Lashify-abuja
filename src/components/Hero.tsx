import { useState, useEffect } from 'react';
import { Calendar, ArrowRight } from 'lucide-react';

type Props = {
  onNavigate: (page: string) => void;
};

export default function Hero({ onNavigate }: Props) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden"
      style={{ background: 'radial-gradient(ellipse 120% 100% at 50% 0%, #f3ebe0 0%, #faf7f2 70%)' }}>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(179, 139, 158, 0.12) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(179, 139, 158, 0.04) 0%, transparent 70%)' }} />
      </div>

      <div className="container-lux relative z-10 pt-24 lg:pt-28 pb-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left — text */}
          <div className={`transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="flex items-center gap-2 mb-7">
              <span className="text-xs tracking-[0.2em] uppercase" style={{ color: '#b38b9e' }}>
                Abuja's #1 Lash Studio
              </span>
            </div>

            <h1 className="font-serif font-light leading-[1.05] mb-6"
              style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', color: '#3d2e36' }}>
              Where Your Eyes
              <br />
              <span className="italic" style={{
                background: 'linear-gradient(135deg, #dfc28d 0%, #c2967f 50%, #b38b9e 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Become Art
              </span>
            </h1>

            <p style={{ fontSize: '1rem', color: '#5a4850', lineHeight: 1.7, maxWidth: '420px' }} className="mb-10">
              Luxury lash extensions & brow artistry by Lashify — Abuja's most trusted specialist.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-14">
              <button onClick={() => onNavigate('book')} className="btn-gold group text-sm py-4">
                <Calendar className="w-4 h-4" />
                Book Now
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button onClick={() => onNavigate('services')} className="btn-outline text-sm py-4">
                Our Services
              </button>
            </div>

            <div className="flex gap-10">
              {[
                { v: '500+', l: 'Clients' },
                { v: '3+ yrs', l: 'Experience' },
              ].map((s) => (
                <div key={s.l}>
                  <div className="font-serif text-3xl" style={{ color: '#b38b9e' }}>{s.v}</div>
                  <div className="text-xs uppercase tracking-[0.15em] mt-1" style={{ color: '#8f7882' }}>{s.l}</div>
                </div>
              ))}
            </div>

          </div>

          {/* Right — logo (desktop only) */}
          <div
            className={`hidden lg:flex items-center justify-center transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            style={{ transitionDelay: '0.25s' }}
          >
            <HeroLogoGlow />
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2"
        style={{ opacity: 0.3 }}>
        <span className="text-xs uppercase tracking-[0.2em]" style={{ color: '#b38b9e' }}>Scroll</span>
        <div className="w-px h-8" style={{ background: 'linear-gradient(to bottom, rgba(179, 139, 158, 0.5), transparent)' }} />
      </div>

      <style>{`
        @keyframes hero-pop {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
}

function HeroLogoGlow() {
  const SIZE = 400;

  return (
    <div className="relative scale-[0.8] sm:scale-100 origin-center transition-transform duration-500 flex items-center justify-center" style={{ width: `${SIZE}px`, height: `${SIZE}px` }}>
      {/* Outer spinning border ring */}
      <div className="absolute inset-0 rounded-full" style={{
        border: '1px dashed rgba(179, 139, 158, 0.25)',
        animation: 'spin 120s linear infinite',
      }} />

      {/* Glassmorphic frosted backing circle */}
      <div className="absolute inset-4 rounded-full" style={{
        background: 'rgba(255, 255, 255, 0.45)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(179, 139, 158, 0.25)',
        boxShadow: '0 20px 50px rgba(179, 139, 158, 0.12), inset 0 0 30px rgba(255, 255, 255, 0.6)',
        animation: 'hero-pop 1.4s cubic-bezier(0.16,1,0.3,1) both',
      }} />

      {/* The logo image itself, floating inside the glassmorphism disk */}
      <div className="absolute inset-10" style={{
        animation: 'hero-pop 1.2s cubic-bezier(0.16,1,0.3,1) 0.1s both',
      }}>
        <img
          src="/images/logo.png"
          alt="LashifyAbuja Logo"
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
}
