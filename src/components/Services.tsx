import { useEffect, useState } from 'react';
import { Clock, ArrowRight, Check } from 'lucide-react';
import { fetchServices, type Service } from '../lib/supabase';
import { formatNaira, formatDuration } from '../lib/utils';

type Props = {
  onNavigate: (page: string) => void;
  onBookService?: (service: Service) => void;
  compact?: boolean;
};

const categoryLabels: Record<string, string> = {
  lashes: 'Lash Extensions',
  brows: 'Brow Artistry',
  other: 'Signature Packages',
};

export default function Services({ onNavigate, onBookService, compact }: Props) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const data = await fetchServices();
        if (data && data.length > 0) {
          setServices(data);
        } else {
          // Fallback placeholders for Lashes and Brows
          setServices([
            { id: 'p1', name: 'Classic Lashes', category: 'lashes', price: 20000, duration_minutes: 90, description: 'A single extension applied to each natural lash for a subtle, natural enhancement.', is_active: true, created_at: '' },
            { id: 'p2', name: 'Hybrid Lashes', category: 'lashes', price: 25000, duration_minutes: 120, description: 'A perfect blend of Classic and Volume lashes for a textured, fuller look.', is_active: true, created_at: '' },
            { id: 'p3', name: 'Russian Volume', category: 'lashes', price: 30000, duration_minutes: 150, description: 'Multiple lightweight extensions applied to each natural lash for dramatic fluff and volume.', is_active: true, created_at: '' },
            { id: 'p4', name: 'Mega Volume', category: 'lashes', price: 35000, duration_minutes: 180, description: 'The most dramatic, dense, and dark lash look available. Maximum fullness.', is_active: true, created_at: '' },
            { id: 'p5', name: 'Wispy Lashes', category: 'lashes', price: 28000, duration_minutes: 135, description: 'Spiky, textured, and customized styling for a trendy, wispy effect.', is_active: true, created_at: '' },
            { id: 'p6', name: 'Microblading', category: 'brows', price: 50000, duration_minutes: 120, description: 'Semi-permanent brow tattoo using hair-like strokes for a natural, fuller brow.', is_active: true, created_at: '' },
            { id: 'p7', name: 'Ombre Powder Brows', category: 'brows', price: 60000, duration_minutes: 150, description: 'A soft, shaded brow pencil look that is semi-permanent and heals beautifully.', is_active: true, created_at: '' },
            { id: 'p8', name: 'Brow Lamination', category: 'brows', price: 25000, duration_minutes: 60, description: 'A perm for your brows that gives them a set, uniform shape for an extended period.', is_active: true, created_at: '' },
            { id: 'p9', name: 'Brow Tinting', category: 'brows', price: 10000, duration_minutes: 30, description: 'Semi-permanent dye to enhance the color, shape, and thickness of your brows.', is_active: true, created_at: '' },
            { id: 'p10', name: 'Brow Shaping', category: 'brows', price: 8000, duration_minutes: 30, description: 'Expert brow mapping and shaping using high-quality wax.', is_active: true, created_at: '' }
          ]);
        }
      } catch (err) {
        console.error('Failed to fetch services:', err);
      }
      setLoading(false);
    };
    loadServices();
  }, []);

  const categories = ['lashes', 'brows', 'other'];
  const displayCount = compact ? 6 : undefined;

  if (loading) {
    return (
      <section className="py-24 section-cream">
        <div className="container-lux">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 rounded-2xl shimmer-dark" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 section-cream">
      <div className="container-lux">
        {/* Divider */}
        <div className="divider-gold mb-16" />

        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="section-label">
            <span className="w-8 h-px" style={{ background: 'rgba(74,35,17,0.5)' }} />
            Our Services
            <span className="w-8 h-px" style={{ background: 'rgba(74,35,17,0.5)' }} />
          </span>
          <h2 className="heading-serif text-4xl md:text-5xl mt-4 mb-4" style={{ color: '#f4e6e0' }}>
            Services &
            <br />
            <span className="italic" style={{ color: '#4a2311' }}>Pricing</span>
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: '#7a4428' }}>
            All services include consultation and aftercare. No hidden fees.
          </p>
        </div>

        {categories.map((cat) => {
          const catServices = services.filter((s) => s.category === cat);
          if (catServices.length === 0) return null;
          const shown = displayCount ? catServices.slice(0, displayCount) : catServices;

          return (
            <div key={cat} className="mb-16 last:mb-0">
              <h3 className="font-serif text-2xl mb-6 flex items-center gap-3"
                style={{ color: '#5e311a' }}>
                <span className="w-10 h-px" style={{ background: 'rgba(74,35,17,0.4)' }} />
                {categoryLabels[cat] || cat}
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shown.map((service, idx) => (
                  <div
                    key={service.id}
                    className="card-lux hover:shadow-xl cursor-pointer flex flex-col group overflow-hidden"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                    onClick={() => onBookService ? onBookService(service) : onNavigate('book')}
                  >
                    {service.image_url && (
                      <div className="w-full h-48 bg-gray-100 overflow-hidden" style={{ borderBottom: '1px solid rgba(74,35,17,0.1)' }}>
                        <img src={service.image_url} alt={service.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      </div>
                    )}
                    <div className="p-7 flex flex-col flex-grow">
                      <div className="flex items-start justify-between mb-4">
                        <h4 className="font-serif text-xl transition-colors"
                          style={{ color: '#f4e6e0' }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#4a2311')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = '#f4e6e0')}
                        >
                          {service.name}
                        </h4>
                        <div className="text-right shrink-0 ml-3">
                        <div className="font-serif text-2xl" style={{ color: '#4a2311' }}>
                          {formatNaira(service.price)}
                        </div>
                      </div>
                    </div>

                    <p className="text-sm leading-relaxed mb-5 flex-grow" style={{ color: '#965d3e' }}>
                      {service.description}
                    </p>

                    <div className="flex items-center gap-4 text-sm mb-5 pb-5"
                      style={{ borderBottom: '1px solid rgba(74,35,17,0.1)', color: '#965d3e' }}>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" style={{ color: '#3a1c0d' }} />
                        {formatDuration(service.duration_minutes)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Check className="w-4 h-4" style={{ color: '#3a1c0d' }} />
                        Consultation included
                      </span>
                    </div>

                    <button className="flex items-center justify-between text-sm font-medium transition-colors"
                      style={{ color: '#7a4428' }}
                    >
                      <span className="group-hover:text-gold-400 transition-colors">
                        Book this service
                      </span>
                      <span className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                        style={{ border: '1px solid rgba(74,35,17,0.2)' }}>
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {compact && (
          <div className="text-center mt-12">
            <button onClick={() => onNavigate('services')} className="btn-outline">
              View All Services
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
