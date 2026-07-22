"use client";

import { useEffect, useState } from 'react';
import { Clock, ArrowRight, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { fetchServices, services as fallbackServices, type Service } from '../lib/api';
import { formatNaira, formatDuration } from '../lib/utils';

type Props = {
  onBookService?: (service: Service) => void;
  compact?: boolean;
};

const CATEGORIES = [
  {
    id: 'lash',
    title: 'Lash Services',
    description: 'Luxurious lash extensions tailored to your eye shape.',
    image: '/images/category-lash-v2.jpg',
  },
  {
    id: 'brows',
    title: 'Brow Services',
    description: 'Expert brow shaping, tinting, and microblading.',
    image: '/images/category-brow.jpg',
  },
  {
    id: 'lash-refill',
    title: 'Lash Refill',
    description: 'Maintain your gorgeous lashes with regular refills.',
    image: '/images/category-lash-refill.jpg',
  }
];

export default function Services({ onBookService, compact }: Props) {
  const router = useRouter();
  const [servicesList, setServicesList] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const data = await fetchServices();
        if (data && data.length > 0) {
          setServicesList(data);
        } else {
          setServicesList(fallbackServices);
        }
      } catch (err) {
        console.error('Failed to fetch services, using local fallback:', err);
        setServicesList(fallbackServices);
      }
      setLoading(false);
    };
    loadServices();
  }, []);

  // Disable body scroll and handle Escape when modal is open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedCategory) setSelectedCategory(null);
    };
    if (selectedCategory) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedCategory]);

  if (loading) {
    return (
      <section className="py-24" style={{ backgroundColor: '#faf5f0' }}>
        <div className="container-lux">
          <div className="grid md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-96 rounded-[32px] animate-pulse" style={{ backgroundColor: 'rgba(179,139,158,0.1)' }} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const activeCategory = CATEGORIES.find(c => c.id === selectedCategory);
  const modalServices = servicesList.filter(s => s.category === selectedCategory && s.is_active !== false);
  const activeCategories = CATEGORIES.filter(cat => 
    servicesList.some(s => s.category === cat.id && s.is_active !== false)
  );

  return (
    <section id="services" className="py-24 relative" style={{ backgroundColor: '#faf5f0' }}>
      <div className="container-lux">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-6">
            Our Services
          </h2>
          <p className="text-lg text-gray-500 font-medium leading-relaxed">
            Choose a category below to explore our luxury treatments. All services include a professional consultation and expert aftercare advice.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {activeCategories.length === 0 ? (
            <div className="col-span-3 text-center py-12">
              <p className="text-xl text-gray-500 font-serif">No services are currently available.</p>
            </div>
          ) : activeCategories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className="group cursor-pointer rounded-[32px] overflow-hidden relative shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              style={{ backgroundColor: '#3d2e36', willChange: 'transform' }}
            >
              <div className="relative w-full" style={{ paddingBottom: '133%', minHeight: '300px' }}>
                <img 
                  src={cat.image} 
                  alt={cat.title} 
                  loading="eager"
                  decoding="async"
                  width="600"
                  height="800"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.3'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300" />
                
                <div className="absolute bottom-0 inset-x-0 p-8 flex flex-col items-center text-center">
                  <h3 className="text-3xl font-extrabold text-white mb-3 tracking-tight">
                    {cat.title}
                  </h3>
                  <p className="text-white/80 font-medium mb-6 text-sm">
                    {cat.description}
                  </p>
                  <button className="bg-rose-500 text-white font-bold px-8 py-3.5 rounded-full hover:bg-rose-600 transition-colors shadow-lg flex items-center gap-2 text-sm w-full justify-center">
                    View Options <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Services Modal */}
      {selectedCategory && activeCategory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md" onClick={() => setSelectedCategory(null)}>
          <div 
            className="w-full max-w-5xl bg-gray-50 rounded-[32px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-white px-6 sm:px-10 py-6 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                  {activeCategory.title}
                </h3>
                <p className="text-gray-500 font-medium mt-1 text-sm sm:text-base">
                  Select a service to book your appointment
                </p>
              </div>
              <button 
                onClick={() => setSelectedCategory(null)}
                className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-rose-100 hover:text-rose-600 transition-colors shrink-0"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="overflow-y-auto p-6 sm:p-10 scrollbar-hide">
              {modalServices.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-gray-500 font-medium text-lg">No services currently available in this category.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {modalServices.map((service) => (
                    <div
                      key={service.id}
                      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-rose-200 hover:shadow-md transition-all group flex flex-col cursor-pointer"
                      onClick={() => router.push('/book?service=' + service.id)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight pr-4">
                          {service.name}
                        </h4>
                        <div className="text-right shrink-0">
                          <div className="text-lg font-extrabold text-gray-900 bg-gray-50 px-3 py-1 rounded-lg flex items-center gap-2">
                            {service.original_price && service.original_price > service.price && (
                              <span className="line-through text-gray-400 text-xs font-normal">
                                {formatNaira(service.original_price)}
                              </span>
                            )}
                            <span>{formatNaira(service.price)}</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-gray-500 flex-grow leading-relaxed mb-6 line-clamp-3">
                        {service.description}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                        {service.duration_text || service.duration_minutes > 0 ? (
                          <span className="flex items-center gap-1.5 text-sm font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
                            <Clock className="w-4 h-4 text-gray-400" />
                            {service.duration_text || formatDuration(service.duration_minutes)}
                          </span>
                        ) : (
                          <span />
                        )}
                        
                        <button className="flex items-center gap-2 text-sm font-bold text-rose-500 transition-colors group-hover:text-rose-600 bg-rose-50 hover:bg-rose-100 px-4 py-1.5 rounded-full">
                          Book Now
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
