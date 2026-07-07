import { useParams } from 'react-router-dom';
import SEOSchema from './SEOSchema';
import { services } from '../lib/supabase'; // Assuming services are defined here or we can mock them
import type { Service } from '../lib/supabase';
import { Sparkles, MapPin, CheckCircle2, Clock } from 'lucide-react';

type Props = {
  onNavigate: (page: string) => void;
  onBookService: (service: Service) => void;
};

// Map URL slugs back to proper names
const formatSlug = (slug: string) => slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

export default function ServiceLocationPage({ onNavigate: _, onBookService }: Props) {
  const { serviceSlug, locationSlug } = useParams<{ serviceSlug: string; locationSlug: string }>();

  const serviceName = formatSlug(serviceSlug || '');
  const locationName = formatSlug(locationSlug || '');

  // Find the exact service if it exists, otherwise provide a fallback
  const serviceData = services.find(s => s.name.toLowerCase() === serviceName.toLowerCase()) || {
    id: 'custom',
    name: serviceName,
    description: `Premium ${serviceName} applied by expert artists using top-tier products for a flawless finish.`,
    duration_minutes: 120,
    price: 35000,
    category: 'lashes'
  };

  const title = `Best ${serviceName} in ${locationName}, Abuja`;
  const description = `Looking for ${serviceName} near ${locationName}? Lashify Abuja offers premium, luxury ${serviceName} services. Book your appointment today.`;

  return (
    <div className="min-h-screen" style={{ background: '#faf5f0' }}>
      <SEOSchema 
        title={title}
        description={description}
        serviceName={serviceName}
        neighborhood={locationName}
      />

      <div className="container-lux py-16">
        <div className="max-w-3xl mx-auto mt-8 text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full" style={{ background: 'rgba(255,255,255,0.4)' }}>
            <MapPin className="w-4 h-4" style={{ color: '#b38b9e' }} />
            <span className="text-sm font-medium tracking-wide uppercase" style={{ color: '#b38b9e' }}>
              Serving {locationName} & Surroundings
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-serif mb-6 leading-tight">
            Flawless <span className="gold-gradient-text">{serviceName}</span> <br/>
            in {locationName}
          </h1>
          
          <p className="text-lg md:text-xl leading-relaxed mb-10" style={{ color: '#5a4850' }}>
            {description} Our studio specializes in creating perfectly tailored looks that enhance your natural beauty.
          </p>

          <button 
            onClick={() => onBookService(serviceData as Service)}
            className="btn-gold text-lg px-10 py-4 shadow-xl"
          >
            <Sparkles className="w-5 h-5" />
            Book Your Session Now
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mt-20 max-w-5xl mx-auto">
          <div className="card-lux p-8">
            <h3 className="text-2xl font-serif mb-6" style={{ color: '#3d2e36' }}>Why Choose Us for {serviceName}?</h3>
            <ul className="space-y-4">
              {[
                `Highly trained and certified artists`,
                `Premium quality, hypoallergenic materials`,
                `Relaxing, luxurious studio environment`,
                `Long-lasting retention and flawless results`
              ].map((item, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <CheckCircle2 className="w-6 h-6 shrink-0 mt-0.5" style={{ color: '#b38b9e' }} />
                  <span style={{ color: '#5a4850' }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card-lux p-8" style={{ background: 'linear-gradient(135deg, rgba(179, 139, 158, 0.04) 0%, rgba(74,35,17,0) 100%)' }}>
            <h3 className="text-2xl font-serif mb-6" style={{ color: '#3d2e36' }}>Service Details</h3>
            <div className="space-y-6">
              <div>
                <span className="text-sm font-medium uppercase tracking-wider mb-1 block" style={{ color: '#b38b9e' }}>Duration</span>
                <div className="flex items-center gap-2 text-lg font-medium" style={{ color: '#3d2e36' }}>
                  <Clock className="w-5 h-5" /> {serviceData.duration_minutes} Minutes
                </div>
              </div>
              
              <div>
                <span className="text-sm font-medium uppercase tracking-wider mb-1 block" style={{ color: '#b38b9e' }}>Investment</span>
                <div className="text-3xl font-serif" style={{ color: '#b38b9e' }}>
                  ₦{serviceData.price.toLocaleString()}
                </div>
              </div>
              
              <p className="text-sm mt-6 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.6)', color: '#5a4850' }}>
                We are easily accessible from {locationName} and surrounding areas in Abuja. 
                Full payment details and studio directions will be sent upon booking confirmation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
