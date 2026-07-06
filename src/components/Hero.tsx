import { useState, useEffect } from 'react';
import { Search, Calendar, X } from 'lucide-react';
import { fetchServices, services as defaultServices, type Service } from '../lib/supabase';

type Props = {
  onNavigate: (page: string) => void;
  onBookService?: (service: Service) => void;
};

export default function Hero({ onNavigate, onBookService }: Props) {
  const [visible, setVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [servicesList, setServicesList] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  useEffect(() => { 
    setTimeout(() => setVisible(true), 100); 
    const load = async () => {
      try {
        const data = await fetchServices();
        if (data && data.length > 0) setServicesList(data);
        else setServicesList(defaultServices);
      } catch (err) {
        setServicesList(defaultServices);
      }
    };
    load();
  }, []);

  const handleSearch = () => {
    if (selectedService && onBookService) {
      onBookService(selectedService);
    } else {
      onNavigate('book');
    }
  };

  const categories = Array.from(new Set(servicesList.map(s => s.category)));

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden bg-white pt-24 pb-20">
      
      {/* Animated Spotlights */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="spotlight-1 absolute w-[600px] h-[600px] -top-20 -left-20 animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="spotlight-2 absolute w-[600px] h-[600px] top-40 -right-20 animate-pulse" style={{ animationDuration: '6s' }} />
      </div>

      <div className="container-lux relative z-10 flex flex-col items-center text-center max-w-4xl w-full">
        
        <div className={`transition-all duration-1000 w-full ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h1 className="text-5xl md:text-7xl lg:text-[5rem] font-extrabold tracking-tight text-gray-900 mb-6 leading-[1.05]">
            Book local selfcare services
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Discover top-rated lash extensions, brow artistry, and beauty experts at Abuja's most trusted specialist.
          </p>

          {/* The Booking/Search Bar */}
          <div className="w-full max-w-3xl mx-auto bg-white p-2 rounded-2xl md:rounded-full shadow-[0_12px_40px_rgb(0,0,0,0.08)] border border-gray-100 flex flex-col md:flex-row items-center gap-2 mb-16 transition-all hover:shadow-[0_16px_50px_rgb(0,0,0,0.12)]">
            
            <div 
              className="flex-1 w-full flex items-center gap-3 px-5 py-3 md:py-0 md:h-16 border-b md:border-b-0 md:border-r border-gray-100 cursor-pointer group hover:bg-gray-50 md:rounded-l-full transition-colors" 
              onClick={() => setShowModal(true)}
            >
              <Search className="w-6 h-6 text-gray-400 group-hover:text-gray-900 transition-colors flex-shrink-0" />
              <div className="flex flex-col items-start w-full overflow-hidden">
                <span className="text-[11px] font-bold text-gray-900 uppercase tracking-widest mb-0.5">Treatment</span>
                <span className={`text-base font-medium truncate w-full text-left ${selectedService ? 'text-gray-900' : 'text-gray-500'}`}>
                  {selectedService ? selectedService.name : 'All treatments'}
                </span>
              </div>
            </div>

            <div 
              className="flex-1 w-full flex items-center gap-3 px-5 py-3 md:py-0 md:h-16 cursor-pointer group hover:bg-gray-50 transition-colors" 
              onClick={() => onNavigate('book')}
            >
              <Calendar className="w-6 h-6 text-gray-400 group-hover:text-gray-900 transition-colors flex-shrink-0" />
              <div className="flex flex-col items-start w-full overflow-hidden">
                <span className="text-[11px] font-bold text-gray-900 uppercase tracking-widest mb-0.5">Date</span>
                <span className="text-base text-gray-500 font-medium truncate w-full text-left">
                  Any time
                </span>
              </div>
            </div>

            <button 
              onClick={handleSearch}
              className="w-full md:w-auto mt-2 md:mt-0 bg-rose-500 hover:bg-rose-600 text-white font-bold text-lg px-10 h-14 md:h-16 rounded-xl md:rounded-full transition-all duration-200 active:scale-95 flex items-center justify-center flex-shrink-0"
            >
              Search
            </button>
          </div>

          {/* Social Proof / Counters */}
          <div className="flex flex-wrap justify-center gap-10 md:gap-20 border-t border-gray-100 pt-10">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">500+</div>
              <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Happy Clients</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2 flex items-center justify-center gap-1">
                5.0 
                <svg className="w-8 h-8 text-yellow-400 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              </div>
              <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Average Rating</div>
            </div>
          </div>
          
        </div>
      </div>

      {/* Fresha-style Categories Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-fresha" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Categories</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-900" />
              </button>
            </div>
            <div className="overflow-y-auto p-2 pb-6">
              <button 
                onClick={() => { setSelectedService(null); setShowModal(false); }}
                className="w-full text-left px-4 py-4 hover:bg-gray-50 text-gray-900 font-bold transition-colors border-b border-gray-50 uppercase tracking-tight"
              >
                ALL TREATMENTS
              </button>
              {categories.map(cat => (
                <div key={cat} className="mt-2">
                  <div className="px-4 pt-4 pb-2 text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                    {cat.replace('-', ' ')}
                  </div>
                  {servicesList.filter(s => s.category === cat).map(service => (
                    <button 
                      key={service.id}
                      onClick={() => { setSelectedService(service); setShowModal(false); }}
                      className="w-full text-left px-4 py-4 hover:bg-gray-50 text-gray-900 font-bold transition-colors uppercase tracking-tight"
                    >
                      {service.name}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
