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
          <div className="relative flex items-center justify-center min-h-[380px] sm:min-h-[520px]">
            <GlowCircle />

            {/* Stat card — bottom right */}
            <div
              className="absolute z-20"
              style={{
                bottom: '20px',
                right: '-10px',
                padding: '18px 22px',
                borderRadius: '16px',
                background: 'rgba(10,7,4,0.92)',
                border: '1px solid rgba(212,168,39,0.35)',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 20px rgba(212,168,39,0.1)',
                animation: 'fadeUp 1s ease-out 0.6s both',
              }}
            >
              <div className="font-serif" style={{ fontSize: '2.8rem', lineHeight: 1, color: '#d4a827' }}>3+</div>
              <div className="text-xs mt-1 uppercase tracking-[0.15em]" style={{ color: '#6b5238' }}>Years in Abuja</div>
            </div>

            {/* Logo badge — top left */}
            <div
              className="absolute z-20"
              style={{
                top: '20px',
                left: '-10px',
                width: '72px',
                height: '72px',
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
              Meet Tusha
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
            <span className="font-script text-3xl block mt-8" style={{ color: '#d4a827' }}>Tusha</span>
            <span className="text-xs uppercase tracking-widest" style={{ color: '#3d2612' }}>
              Founder & Lead Artist
            </span>
            <br />
            <button onClick={() => onNavigate('book')} className="btn-gold mt-6">
              Book With Tusha
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
        @keyframes halopulse {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50%       { opacity: 0.85; transform: scale(1.04); }
        }
        @keyframes haloinner {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%       { opacity: 0.7; transform: scale(1.025); }
        }
        @keyframes spinring {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes sparkle1 {
          0%   { transform: rotate(0deg)   translateX(0); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: rotate(360deg) translateX(0); opacity: 0; }
        }
        @keyframes dot-orbit {
          from { transform: rotate(var(--start)) translateX(var(--r)) scale(1); opacity: var(--op); }
          to   { transform: rotate(calc(var(--start) + 360deg)) translateX(var(--r)) scale(1); opacity: var(--op); }
        }
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

  // 8 orbiting light dots
  const dots = [
    { r: '196px', start: '0deg',   dur: '9s',  op: '0.8',  sz: 5 },
    { r: '200px', start: '45deg',  dur: '11s', op: '0.5',  sz: 3 },
    { r: '194px', start: '110deg', dur: '14s', op: '0.9',  sz: 6 },
    { r: '198px', start: '180deg', dur: '10s', op: '0.6',  sz: 4 },
    { r: '202px', start: '225deg', dur: '13s', op: '0.7',  sz: 3.5 },
    { r: '195px', start: '290deg', dur: '8s',  op: '0.85', sz: 4.5 },
    { r: '199px', start: '330deg', dur: '16s', op: '0.5',  sz: 3 },
    { r: '197px', start: '60deg',  dur: '12s', op: '0.75', sz: 5 },
  ];

  return (
    <div
      className="relative scale-[0.75] sm:scale-90 md:scale-100 origin-center transition-transform duration-500"
      style={{ width: `${SIZE}px`, height: `${SIZE}px` }}
    >
      {/* ── Layer 1: Wide soft halo (outermost) ── */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          inset: '-70px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,168,39,0.22) 0%, rgba(180,100,20,0.12) 45%, transparent 70%)',
          animation: 'halopulse 3.5s ease-in-out infinite',
        }}
      />

      {/* ── Layer 2: Medium amber ring ── */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          inset: '-30px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, transparent 55%, rgba(212,168,39,0.28) 70%, rgba(180,90,10,0.15) 82%, transparent 92%)',
          animation: 'haloinner 2.8s ease-in-out infinite',
          animationDelay: '0.4s',
        }}
      />

      {/* ── Layer 3: Tight bright ring right at edge ── */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          inset: '-12px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, transparent 72%, rgba(230,185,60,0.5) 80%, rgba(212,140,20,0.3) 87%, transparent 94%)',
          animation: 'haloinner 2.2s ease-in-out infinite',
          animationDelay: '0.8s',
        }}
      />

      {/* ── Layer 4: Spinning arc ring ── */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          inset: '-16px',
          borderRadius: '50%',
          border: '1.5px solid transparent',
          backgroundImage:
            'conic-gradient(from 0deg, transparent 0%, rgba(212,168,39,0.7) 15%, rgba(230,200,80,0.9) 22%, rgba(212,168,39,0.5) 30%, transparent 50%, rgba(180,120,30,0.3) 75%, rgba(212,168,39,0.6) 88%, transparent 100%)',
          backgroundOrigin: 'border-box',
          WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'destination-out',
          maskComposite: 'exclude',
          animation: 'spinring 8s linear infinite',
        }}
      />

      {/* ── Layer 5: Counter-spinning faint arc ── */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          inset: '-20px',
          borderRadius: '50%',
          backgroundImage:
            'conic-gradient(from 180deg, transparent 0%, rgba(212,168,39,0.2) 20%, rgba(255,220,80,0.35) 35%, transparent 55%, rgba(212,168,39,0.15) 80%, transparent 100%)',
          animation: 'spinring 14s linear infinite reverse',
        }}
      />

      {/* ── Layer 6: Orbiting light dots ── */}
      {dots.map((dot, i) => (
        <div
          key={i}
          className="absolute pointer-events-none"
          style={{
            top: '50%',
            left: '50%',
            width: `${dot.sz}px`,
            height: `${dot.sz}px`,
            marginTop: `-${dot.sz / 2}px`,
            marginLeft: `-${dot.sz / 2}px`,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(255,220,80,0.95) 0%, rgba(212,168,39,0.6) 60%, transparent 100%)`,
            boxShadow: `0 0 ${dot.sz * 3}px rgba(212,168,39,0.8)`,
            transformOrigin: 'center center',
            animation: `dot-orbit ${dot.dur} linear infinite`,
            '--start': dot.start,
            '--r': dot.r,
            '--op': dot.op,
          } as React.CSSProperties & { [key: string]: string | number }}
        />
      ))}

      {/* ── The circle image itself ── */}
      <div
        className="absolute inset-0 rounded-full overflow-hidden"
        style={{
          animation: 'imagePop 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both',
          boxShadow: 'inset 0 0 40px rgba(0,0,0,0.5)',
        }}
      >
        <img
          src="/images/download_(1).jpg"
          alt="Tusha — LashifyAbuja"
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
