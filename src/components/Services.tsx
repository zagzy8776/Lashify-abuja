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
        setServices(data);
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
            <span className="w-8 h-px" style={{ background: 'rgba(205,115,141,0.5)' }} />
            Our Services
            <span className="w-8 h-px" style={{ background: 'rgba(205,115,141,0.5)' }} />
          </span>
          <h2 className="heading-serif text-4xl md:text-5xl mt-4 mb-4" style={{ color: '#371c14' }}>
            Services &
            <br />
            <span className="italic" style={{ color: '#cd738d' }}>Pricing</span>
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: '#6a686c' }}>
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
                style={{ color: '#989599' }}>
                <span className="w-10 h-px" style={{ background: 'rgba(205,115,141,0.4)' }} />
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
                      <div className="w-full h-48 bg-gray-100 overflow-hidden" style={{ borderBottom: '1px solid rgba(205,115,141,0.1)' }}>
                        <img src={service.image_url} alt={service.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      </div>
                    )}
                    <div className="p-7 flex flex-col flex-grow">
                      <div className="flex items-start justify-between mb-4">
                        <h4 className="font-serif text-xl transition-colors"
                          style={{ color: '#371c14' }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#cd738d')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = '#371c14')}
                        >
                          {service.name}
                        </h4>
                        <div className="text-right shrink-0 ml-3">
                        <div className="font-serif text-2xl" style={{ color: '#cd738d' }}>
                          {formatNaira(service.price)}
                        </div>
                      </div>
                    </div>

                    <p className="text-sm leading-relaxed mb-5 flex-grow" style={{ color: '#39383b' }}>
                      {service.description}
                    </p>

                    <div className="flex items-center gap-4 text-sm mb-5 pb-5"
                      style={{ borderBottom: '1px solid rgba(205,115,141,0.1)', color: '#39383b' }}>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" style={{ color: '#b2506e' }} />
                        {formatDuration(service.duration_minutes)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Check className="w-4 h-4" style={{ color: '#b2506e' }} />
                        Consultation included
                      </span>
                    </div>

                    <button className="flex items-center justify-between text-sm font-medium transition-colors"
                      style={{ color: '#6a686c' }}
                    >
                      <span className="group-hover:text-gold-400 transition-colors">
                        Book this service
                      </span>
                      <span className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                        style={{ border: '1px solid rgba(205,115,141,0.2)' }}>
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
