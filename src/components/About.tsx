'use client';

import { Award, Heart, Leaf, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function About() {
  const router = useRouter();
  const values = [
    { icon: Award,    title: 'Certified',    desc: 'Advanced lash techniques, continuously updated.' },
    { icon: Heart,    title: 'Personalized', desc: 'Custom-mapped to your eye shape and lifestyle.' },
    { icon: Leaf,     title: 'Premium',      desc: 'Medical-grade adhesives and top-tier lash fibers.' },
    { icon: Sparkles, title: 'Hygienic',     desc: 'Hospital-level sanitation, every appointment.' },
  ];

  return (
    <section className="py-24 section-light">
      <div className="container-lux">
        <div className="divider-gold mb-16" />

        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">

          {/* Image side — glowing circle only */}
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
                background: 'rgba(250, 247, 242, 0.72)',
                border: '1px solid rgba(179, 139, 158, 0.25)',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 8px 32px rgba(179, 139, 158, 0.12), 0 0 20px rgba(179, 139, 158, 0.08)',
                animation: 'fadeUp 1s ease-out 0.6s both',
              }}
            >
              <div className="font-serif" style={{ fontSize: '2.4rem', lineHeight: 1, color: '#b38b9e' }}>3+</div>
              <div className="text-xs mt-1 uppercase tracking-[0.15em]" style={{ color: '#5a4850' }}>Years in Abuja</div>
            </div>
          </div>

          {/* Text side */}
          <div>
            <span className="section-label">
              <span className="w-8 h-px" style={{ background: 'rgba(179, 139, 158, 0.5)' }} />
              Meet Amaya
            </span>
            <h2 className="heading-serif text-4xl md:text-5xl mt-4 mb-6" style={{ color: '#3d2e36' }}>
              The Artist Behind
              <br />
              <span className="italic" style={{ color: '#b38b9e' }}>LashifyAbuja</span>
            </h2>
            <p className="leading-relaxed mb-3" style={{ color: '#5a4850', lineHeight: 1.8 }}>
              Abuja's trusted lash and brow specialist known for precision,
              care, and results that speak for themselves.
            </p>
            <p className="leading-relaxed mb-3" style={{ color: '#5a4850', lineHeight: 1.8 }}>
              Every set is custom-crafted to your features and lifestyle. Your appointment
              is a personal experience, not a transaction.
            </p>
            <span className="font-script text-3xl block mt-8" style={{ color: '#b38b9e' }}>Amaya</span>
            <span className="text-xs uppercase tracking-widest" style={{ color: '#8f7882' }}>
              Founder & Lead Artist
            </span>
            <br />
            <button onClick={() => router.push('/book')} className="btn-gold mt-6">
              Book Now
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {values.map((v) => (
            <div key={v.title} className="card-lux p-6 text-center hover:-translate-y-1">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(179, 139, 158, 0.08)', border: '1px solid rgba(179, 139, 158, 0.2)' }}>
                <v.icon className="w-6 h-6" style={{ color: '#b38b9e' }} />
              </div>
              <h3 className="font-serif text-lg mb-2" style={{ color: '#3d2e36' }}>{v.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: '#5a4850' }}>{v.desc}</p>
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
          background: 'radial-gradient(circle, rgba(179, 139, 158, 0.15) 0%, transparent 70%)',
        }}
      />

      {/* Elegant thin border ring */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          inset: '-8px',
          borderRadius: '50%',
          border: '1px solid rgba(179, 139, 158, 0.3)',
        }}
      />

      {/* Circle container — logo centred, no photo */}
      <div
        className="absolute inset-0 rounded-full overflow-hidden flex items-center justify-center"
        style={{
          animation: 'imagePop 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both',
          background: 'radial-gradient(circle at center, rgba(250,247,242,1) 0%, rgba(238,228,232,0.6) 100%)',
          boxShadow: '0 10px 60px rgba(179, 139, 158, 0.25)',
        }}
      >
        <img
          src="/images/logo.webp"
          alt="LashifyAbuja Logo"
          width="220"
          height="220"
          className="object-contain"
          style={{ filter: 'drop-shadow(0 4px 24px rgba(179,139,158,0.25))' }}
        />
      </div>
    </div>
  );
}
