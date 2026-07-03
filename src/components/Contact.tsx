import { Instagram, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';
import { TikTokIcon } from './TikTokIcon';

export default function Contact() {
  return (
    <section className="py-24 section-dark">
      <div className="container-lux">
        <div className="divider-gold mb-16" />

        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="section-label">
            <span className="w-8 h-px" style={{ background: 'rgba(205,115,141,0.5)' }} />
            Get In Touch
            <span className="w-8 h-px" style={{ background: 'rgba(205,115,141,0.5)' }} />
          </span>
          <h2 className="heading-serif text-4xl md:text-5xl mt-4" style={{ color: '#f9f1e8' }}>
            Find{' '}
            <span className="italic" style={{ color: '#cd738d' }}>Us</span>
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          {/* Location + Hours row */}
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Location card */}
            <div className="card-lux p-7">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(205,115,141,0.08)', border: '1px solid rgba(205,115,141,0.2)' }}>
                  <MapPin className="w-6 h-6" style={{ color: '#cd738d' }} />
                </div>
                <div>
                  <h3 className="font-serif text-xl mb-2" style={{ color: '#f9f1e8' }}>Location</h3>
                  <a 
                    href="https://www.google.com/maps/search/?api=1&query=Plot+2079+Nonso+Benson+Udeh+Street+Abuja+Nigeria" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block hover:opacity-75 transition-opacity"
                  >
                    <p className="leading-relaxed" style={{ color: '#6a686c' }}>
                      Plot 2079 Nonso Benson<br />
                      Udeh Street Abuja
                    </p>
                    <p className="text-sm mt-1" style={{ color: '#39383b' }}>
                      Federal Capital Territory, Nigeria
                    </p>
                  </a>
              </div>
            </div>

            {/* Hours card */}
            <div className="card-lux p-7">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(205,115,141,0.08)', border: '1px solid rgba(205,115,141,0.2)' }}>
                  <Clock className="w-6 h-6" style={{ color: '#cd738d' }} />
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
                        <span style={{ color: '#6a686c' }}>{row.day}</span>
                        <span className="font-medium" style={{ color: '#989599' }}>{row.hours}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Social grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  style={{ color: '#cd738d' }} />
                <h4 className="font-medium mb-1" style={{ color: '#f9f1e8' }}>{item.label}</h4>
                <p className="text-sm break-all" style={{ color: '#39383b' }}>{item.handle}</p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

