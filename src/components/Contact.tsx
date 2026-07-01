import { Instagram, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';
import { TikTokIcon } from './TikTokIcon';

type Props = {
  onNavigate: (page: string) => void;
};

export default function Contact({ onNavigate }: Props) {
  return (
    <section className="py-24 section-dark">
      <div className="container-lux">
        <div className="divider-gold mb-16" />

        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="section-label">
            <span className="w-8 h-px" style={{ background: 'rgba(212,168,39,0.5)' }} />
            Get In Touch
            <span className="w-8 h-px" style={{ background: 'rgba(212,168,39,0.5)' }} />
          </span>
          <h2 className="heading-serif text-4xl md:text-5xl mt-4" style={{ color: '#f9f1e8' }}>
            Find
            <span className="italic" style={{ color: '#d4a827' }}> Us</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            {/* Location card */}
            <div className="card-lux p-7">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(212,168,39,0.08)', border: '1px solid rgba(212,168,39,0.2)' }}>
                  <MapPin className="w-6 h-6" style={{ color: '#d4a827' }} />
                </div>
                <div>
                  <h3 className="font-serif text-xl mb-2" style={{ color: '#f9f1e8' }}>Location</h3>
                  <p className="leading-relaxed" style={{ color: '#6b5238' }}>
                    Life Camp/Gwarimpa, Abuja
                  </p>
                  <p className="text-sm mt-1" style={{ color: '#4e3219' }}>
                    Federal Capital Territory, Nigeria
                  </p>
                </div>
              </div>
            </div>

            {/* Hours card */}
            <div className="card-lux p-7">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(212,168,39,0.08)', border: '1px solid rgba(212,168,39,0.2)' }}>
                  <Clock className="w-6 h-6" style={{ color: '#d4a827' }} />
                </div>
                <div className="flex-grow">
                  <h3 className="font-serif text-xl mb-3" style={{ color: '#f9f1e8' }}>Operating Hours</h3>
                  <div className="space-y-2 text-sm">
                    {[
                      { day: 'Monday – Friday', hours: '9:00 AM – 7:00 PM' },
                      { day: 'Saturday',        hours: '10:00 AM – 5:00 PM' },
                      { day: 'Sunday',          hours: 'By special request' },
                    ].map((row) => (
                      <div key={row.day} className="flex justify-between">
                        <span style={{ color: '#6b5238' }}>{row.day}</span>
                        <span className="font-medium" style={{ color: '#a8896e' }}>{row.hours}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Social grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                {
                  href: 'https://www.instagram.com/lashifyabuja.ng?igsh=ajEyb3BuZDZnemlq',
                  Icon: Instagram,
                  label: 'Instagram',
                  handle: '@lashifyabuja.ng',
                },
                {
                  href: 'https://www.tiktok.com/@lashifyabuja?_r=1&_t=ZS-97dsNqcq5Si',
                  Icon: TikTokIcon as typeof Instagram,
                  label: 'TikTok',
                  handle: '@lashifyabuja',
                },
                {
                  href: 'mailto:Tushaesthetic@gmail.com',
                  Icon: Mail,
                  label: 'Email',
                  handle: 'Tushaesthetic@gmail.com',
                },
                {
                  href: 'https://wa.me/2348087026970',
                  Icon: MessageCircle,
                  label: 'WhatsApp',
                  handle: '+234 808 702 6970',
                },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="card-lux p-6 hover:-translate-y-1 group block"
                >
                  <item.Icon className="w-7 h-7 mb-3 transition-transform group-hover:scale-110"
                    style={{ color: '#d4a827' }} />
                  <h4 className="font-medium mb-1" style={{ color: '#f9f1e8' }}>{item.label}</h4>
                  <p className="text-sm break-all" style={{ color: '#4e3219' }}>{item.handle}</p>
                </a>
              ))}
            </div>

            <button onClick={() => onNavigate('book')} className="btn-gold w-full">
              Book Your Appointment
            </button>
          </div>

          {/* Map */}
          <div className="rounded-3xl overflow-hidden min-h-[500px]"
            style={{ border: '1px solid rgba(212,168,39,0.15)' }}>
            <iframe
              title="LashifyAbuja Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31536.344!2d7.4893!3d9.0579!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x104e745f8e3f3a3b%3A0x0!2sAbuja%2C%20Nigeria!5e0!3m2!1sen!2sus!4v1700000000000"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '500px', filter: 'invert(90%) hue-rotate(180deg) saturate(0.3) brightness(0.85)' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
