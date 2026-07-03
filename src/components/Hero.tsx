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
      style={{ background: 'radial-gradient(ellipse 120% 100% at 50% 0%, #1e1b1d 0%, #151416 70%)' }}>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(80,40,10,0.2) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(205,115,141,0.05) 0%, transparent 70%)' }} />
      </div>

      <div className="container-lux relative z-10 pt-24 lg:pt-28 pb-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left — text */}
          <div className={`transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="flex items-center gap-2 mb-7">
              <span className="text-xs tracking-[0.2em] uppercase" style={{ color: '#6a686c' }}>
                Abuja's #1 Lash Studio
              </span>
            </div>

            <h1 className="font-serif font-light leading-[1.05] mb-6"
              style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', color: '#f9f1e8' }}>
              Where Your Eyes
              <br />
              <span className="italic" style={{
                background: 'linear-gradient(135deg, #b2506e 0%, #df9db1 40%, #cd738d 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Become Art
              </span>
            </h1>

            <p style={{ fontSize: '1rem', color: '#6a686c', lineHeight: 1.7, maxWidth: '420px' }} className="mb-10">
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
                  <div className="font-serif text-3xl" style={{ color: '#cd738d' }}>{s.v}</div>
                  <div className="text-xs uppercase tracking-[0.15em] mt-1" style={{ color: '#2d2c2f' }}>{s.l}</div>
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
        <span className="text-xs uppercase tracking-[0.2em]" style={{ color: '#6a686c' }}>Scroll</span>
        <div className="w-px h-8" style={{ background: 'linear-gradient(to bottom, rgba(205,115,141,0.5), transparent)' }} />
      </div>

      <style>{`
        @keyframes hero-pop {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </section>
  );
}

function HeroLogoGlow() {
  const SIZE = 320;

  return (
    <div className="relative scale-[0.8] sm:scale-100 origin-center transition-transform duration-500" style={{ width: `${SIZE}px`, height: `${SIZE}px` }}>
      {/* The image */}
      <div className="absolute inset-0 rounded-full overflow-hidden" style={{
        animation: 'hero-pop 1.2s cubic-bezier(0.16,1,0.3,1) 0.2s both',
        boxShadow: 'inset 0 0 40px rgba(0,0,0,0.4)',
      }}>
        <img
          src="/images/WhatsApp_Image_2026-06-30_at_2.12.44_PM.jpeg"
          alt="LashifyAbuja"
          className="w-full h-full object-cover"
          style={{ filter: 'brightness(1.05) contrast(1.05)' }}
        />
        <div className="absolute inset-0 rounded-full pointer-events-none" style={{
          background: 'radial-gradient(circle at center, transparent 55%, rgba(10,8,6,0.35) 100%)',
        }} />
      </div>
    </div>
  );
}
