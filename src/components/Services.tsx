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
  },
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
        setServicesList(data?.length ? data : fallbackServices);
      } catch (err) {
        console.error('Failed to fetch services, using local fallback:', err);
        setServicesList(fallbackServices);
      } finally {
        setLoading(false);
      }
    };
    loadServices();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedCategory(null);
    };

    if (selectedCategory) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
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

  const activeCategory = CATEGORIES.find((category) => category.id === selectedCategory);
  const modalServices = servicesList.filter((service) => service.category === selectedCategory && service.is_active !== false);
  const activeCategories = CATEGORIES.filter((category) =>
    servicesList.some((service) => service.category === category.id && service.is_active !== false),
  );

  const openBooking = (service: Service) => {
    if (onBookService) onBookService(service);
    else router.push(`/book?service=${encodeURIComponent(service.id)}`);
  };

  return (
    <section id="services" className="py-24 relative" style={{ backgroundColor: '#faf5f0' }}>
      <div className="container-lux">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-6">Our Services</h2>
          <p className="text-lg text-gray-500 font-medium leading-relaxed">
            Choose a category below to explore our luxury treatments. All services include a professional consultation and expert aftercare advice.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {activeCategories.length === 0 ? (
            <div className="col-span-3 text-center py-12">
              <p className="text-xl text-gray-500 font-serif">No services are currently available.</p>
            </div>
          ) : activeCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setSelectedCategory(category.id)}
              className="group cursor-pointer rounded-[32px] overflow-hidden relative shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 text-left"
              style={{ backgroundColor: '#3d2e36', willChange: 'transform' }}
              aria-label={`View ${category.title}`}
            >
              <div className="relative w-full" style={{ paddingBottom: '133%', minHeight: '300px' }}>
                <img
                  src={category.image}
                  alt={category.title}
                  loading={compact ? 'lazy' : 'eager'}
                  decoding="async"
                  width="600"
                  height="800"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(event) => { (event.currentTarget as HTMLImageElement).style.opacity = '0.3'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-8 flex flex-col items-center text-center">
                  <h3 className="text-3xl font-extrabold text-white mb-3 tracking-tight">{category.title}</h3>
                  <p className="text-white/80 font-medium mb-6 text-sm">{category.description}</p>
                  <span className="bg-rose-500 text-white font-bold px-8 py-3.5 rounded-full shadow-lg flex items-center gap-2 text-sm w-full justify-center">
                    View Options <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedCategory && activeCategory && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="services-modal-title"
          onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedCategory(null); }}
        >
          <div className="w-full max-w-2xl bg-gray-50 rounded-[30px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-white px-6 sm:px-8 py-5 sm:py-6 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div className="pr-4">
                <h3 id="services-modal-title" className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                  {activeCategory.title}
                </h3>
                <p className="text-gray-500 font-medium mt-1 text-sm sm:text-base">Select a service to book your appointment</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-rose-100 hover:text-rose-600 transition-colors shrink-0"
                aria-label="Close service options"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="overflow-y-auto p-4 sm:p-6 scrollbar-hide">
              {modalServices.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-gray-500 font-medium text-lg">No services currently available in this category.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:gap-5">
                  {modalServices.map((service) => (
                    <article
                      key={service.id}
                      className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 hover:border-rose-200 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <h4 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight pr-2">{service.name}</h4>
                        <div className="shrink-0 text-lg font-extrabold text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                          {service.original_price && service.original_price > service.price && (
                            <span className="line-through text-gray-400 text-xs font-normal mr-2">{formatNaira(service.original_price)}</span>
                          )}
                          <span>{formatNaira(service.price)}</span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-500 leading-relaxed mb-5">{service.description}</p>

                      <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-50">
                        <span className="flex items-center gap-1.5 text-sm font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
                          <Clock className="w-4 h-4 text-gray-400" />
                          {service.duration_text || formatDuration(service.duration_minutes)}
                        </span>
                        <button
                          type="button"
                          onClick={() => openBooking(service)}
                          className="flex items-center gap-2 text-sm font-bold text-rose-500 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 px-4 py-2 rounded-full transition-colors"
                        >
                          Book Now <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </article>
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
