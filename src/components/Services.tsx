import { useEffect, useState } from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import { fetchServices, services, type Service } from '../lib/supabase';
import { formatNaira, formatDuration } from '../lib/utils';

type Props = {
  onNavigate: (page: string) => void;
  onBookService?: (service: Service) => void;
  compact?: boolean;
};

const categoryLabels: Record<string, string> = {
  'lash': 'LASH',
  'brows': 'BROWS',
  'lash-refill': 'LASH REFILL',
};

export default function Services({ onNavigate, onBookService, compact }: Props) {
  const [servicesList, setServicesList] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const data = await fetchServices();
        if (data && data.length > 0) {
          setServicesList(data);
        } else {
          setServicesList(services);
        }
      } catch (err) {
        console.error('Failed to fetch services, using local fallback:', err);
        setServicesList(services);
      }
      setLoading(false);
    };
    loadServices();
  }, []);

  const categories = ['lash', 'brows', 'lash-refill'];
  const displayCount = compact ? 6 : undefined;

  if (loading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="container-lux">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-gray-50">
      <div className="container-lux">

        <div className="text-left mb-12">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
            Services & Pricing
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl">
            Book your next appointment. All services include a professional consultation and aftercare.
          </p>
        </div>

        {categories.map((cat) => {
          const catServices = servicesList.filter((s) => s.category === cat);
          if (catServices.length === 0) return null;
          const shown = displayCount ? catServices.slice(0, displayCount) : catServices;

          return (
            <div key={cat} className="mb-16 last:mb-0">
              <h3 className="text-2xl font-bold tracking-tight text-gray-900 mb-6 flex items-center gap-3">
                {categoryLabels[cat] || cat}
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shown.map((service) => (
                  <div
                    key={service.id}
                    className="card-modern cursor-pointer flex flex-col group overflow-hidden"
                    onClick={() => onBookService ? onBookService(service) : onNavigate('book')}
                  >
                    {service.image_url && (
                      <div className="w-full h-48 bg-gray-100 overflow-hidden relative">
                        <img 
                          src={service.image_url} 
                          alt={service.name} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                        />
                      </div>
                    )}
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-lg font-bold text-gray-900 group-hover:text-black transition-colors leading-tight">
                          {service.name}
                        </h4>
                        <div className="text-right shrink-0 ml-4">
                          <div className="text-lg font-extrabold text-gray-900">
                            {formatNaira(service.price)}
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-gray-500 mb-6 flex-grow leading-relaxed line-clamp-2">
                        {service.description}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        {service.duration_text || service.duration_minutes > 0 ? (
                          <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-600">
                            <Clock className="w-4 h-4 text-gray-400" />
                            {service.duration_text || formatDuration(service.duration_minutes)}
                          </span>
                        ) : (
                          <span />
                        )}
                        
                        <button className="flex items-center gap-2 text-sm font-bold text-gray-900 transition-colors group-hover:translate-x-1 duration-300">
                          Book
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
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
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
