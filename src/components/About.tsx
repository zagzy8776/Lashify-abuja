import { Award, Heart, Leaf, Sparkles } from 'lucide-react';

type Props = {
  onNavigate: (page: string) => void;
};

export default function About({ onNavigate }: Props) {
  const values = [
    { icon: Award,    title: 'Certified',    desc: 'Advanced lash techniques, continuously updated.' },
    { icon: Heart,    title: 'Personalized', desc: 'Custom-mapped to your eye shape and lifestyle.' },
    { icon: Leaf,     title: 'Premium',      desc: 'Medical-grade adhesives and top-tier lash fibers.' },
    { icon: Sparkles, title: 'Hygienic',     desc: 'Hospital-level sanitation, every appointment.' },
  ];

  return (
    <section className="py-24 section-dark">
      <div className="container-lux">
        <div className="divider-gold mb-16" />

        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">

          {/* Image side — glowing circle */}
          <div className="relative flex items-center justify-center min-h-[300px] sm:min-h-[520px]">
            <GlowCircle />

            {/* Stat card — bottom right */}
            <div
              className="absolute z-20"
              style={{
                bottom: '16px',
                right: '0',
                padding: '16px 20px',
                borderRadius: '16px',
                background: 'rgba(10,7,4,0.92)',
                border: '1px solid rgba(212,168,39,0.35)',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 20px rgba(212,168,39,0.1)',
                animation: 'fadeUp 1s ease-out 0.6s both',
              }}
            >
              <div className="font-serif" style={{ fontSize: '2.4rem', lineHeight: 1, color: '#d4a827' }}>3+</div>
              <div className="text-xs mt-1 uppercase tracking-[0.15em]" style={{ color: '#6b5238' }}>Years in Abuja</div>
            </div>

            {/* Logo badge — top left */}
            <div
              className="absolute z-20"
              style={{
                top: '16px',
                left: '0',
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '2px solid rgba(212,168,39,0.4)',
                boxShadow: '0 0 20px rgba(212,168,39,0.25)',
                animation: 'fadeUp 1s ease-out 0.3s both',
              }}
            >
              <img
                src="/images/WhatsApp_Image_2026-06-30_at_2.12.44_PM.jpeg"
                alt="LashifyAbuja"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Text side */}
          <div>
            <span className="section-label">
              <span className="w-8 h-px" style={{ background: 'rgba(212,168,39,0.5)' }} />
              Meet Lashify
            </span>
            <h2 className="heading-serif text-4xl md:text-5xl mt-4 mb-6" style={{ color: '#f9f1e8' }}>
              The Artist Behind
              <br />
              <span className="italic" style={{ color: '#d4a827' }}>LashifyAbuja</span>
            </h2>
            <p className="leading-relaxed mb-3" style={{ color: '#6b5238', lineHeight: 1.8 }}>
              Abuja's trusted lash and brow specialist — known for precision,
              care, and results that speak for themselves.
            </p>
            <p className="leading-relaxed" style={{ color: '#6b5238', lineHeight: 1.8 }}>
              Every set is custom-crafted to your features and lifestyle. Your appointment
              is a personal experience, not a transaction.
            </p>
            <span className="font-script text-3xl block mt-8" style={{ color: '#d4a827' }}>Lashify</span>
            <span className="text-xs uppercase tracking-widest" style={{ color: '#3d2612' }}>
              Founder & Lead Artist
            </span>
            <br />
            <button onClick={() => onNavigate('book')} className="btn-gold mt-6">
              Book Now
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {values.map((v) => (
            <div key={v.title} className="card-lux p-6 text-center hover:-translate-y-1">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(212,168,39,0.08)', border: '1px solid rgba(212,168,39,0.2)' }}>
                <v.icon className="w-6 h-6" style={{ color: '#d4a827' }} />
              </div>
              <h3 className="font-serif text-lg mb-2" style={{ color: '#f9f1e8' }}>{v.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: '#6b5238' }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes imagePop {
          from { opacity: 0; transform: scale(0.93); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </section>
  );
}

function GlowCircle() {
  const SIZE = 380;

  return (
    <div
      className="relative scale-[0.7] sm:scale-90 md:scale-100 origin-center transition-transform duration-500"
      style={{ width: `${SIZE}px`, height: `${SIZE}px` }}
    >
      {/* Subtle background glow */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          inset: '-40px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,168,39,0.12) 0%, transparent 70%)',
        }}
      />

      {/* Elegant thin golden border ring */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          inset: '-8px',
          borderRadius: '50%',
          border: '1px solid rgba(212,168,39,0.25)',
        }}
      />

      {/* The circle image itself */}
      <div
        className="absolute inset-0 rounded-full overflow-hidden"
        style={{
          animation: 'imagePop 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both',
          boxShadow: 'inset 0 0 40px rgba(0,0,0,0.5), 0 10px 40px rgba(0,0,0,0.5)',
        }}
      >
        <img
          src="/images/download_(1).jpg"
          alt="LashifyAbuja"
          className="w-full h-full object-cover"
          style={{
            filter: 'brightness(0.9) contrast(1.08) saturate(0.9)',
          }}
        />
        {/* Inner vignette to blend with glow */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle at center, transparent 55%, rgba(10,8,6,0.4) 100%)',
          }}
        />
      </div>
    </div>
  );
}
