import { Instagram, Mail, MapPin } from 'lucide-react';
import { TikTokIcon } from './TikTokIcon';

type Props = {
  onNavigate: (page: string) => void;
};

export default function Footer({ onNavigate }: Props) {
  return (
    <footer className="pt-20 pb-8" style={{ background: '#060403' }}>
      <div className="container-lux">
        <div className="divider-gold mb-16" />

        <div className="grid md:grid-cols-4 gap-12 mb-16">
          {/* Brand col */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 rounded-full overflow-hidden"
                style={{ border: '1px solid rgba(212,168,39,0.3)', boxShadow: '0 0 20px rgba(212,168,39,0.1)' }}>
                <img
                  src="/images/WhatsApp_Image_2026-06-30_at_2.12.44_PM.jpeg"
                  alt="LashifyAbuja"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="font-serif text-2xl" style={{ color: '#f9f1e8' }}>
                  Lashify<span style={{ color: '#d4a827' }}>Abuja</span>
                </div>
                <div className="text-[10px] uppercase tracking-[0.2em] mt-1" style={{ color: '#4e3219' }}>
                  Lash & Brow Studio
                </div>
              </div>
            </div>
            <p className="leading-relaxed max-w-md mb-6" style={{ color: '#4e3219' }}>
              Abuja's premier destination for luxury lash extensions and brow artistry.
              Where precision meets artistry, and every set is crafted to elevate your
              natural beauty.
            </p>
            <div className="flex gap-3">
              {[
                { href: 'https://www.instagram.com/lashifyabuja.ng?igsh=ajEyb3BuZDZnemlq', Icon: Instagram, label: 'Instagram' },
                { href: 'https://www.tiktok.com/@lashifyabuja?_r=1&_t=ZS-97dsNqcq5Si', Icon: TikTokIcon as typeof Instagram, label: 'TikTok' },
                { href: 'mailto:Tushaesthetic@gmail.com', Icon: Mail, label: 'Email' },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300"
                  style={{ border: '1px solid rgba(212,168,39,0.2)', color: '#6b5238' }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(212,168,39,0.15)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,168,39,0.5)';
                    (e.currentTarget as HTMLElement).style.color = '#d4a827';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,168,39,0.2)';
                    (e.currentTarget as HTMLElement).style.color = '#6b5238';
                  }}
                  aria-label={item.label}
                >
                  <item.Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Explore col */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] mb-5" style={{ color: '#d4a827' }}>
              Explore
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'Home', page: 'home' },
                { label: 'Services', page: 'services' },
                { label: 'Gallery', page: 'gallery' },
                { label: 'About', page: 'about' },
                { label: 'Book Appointment', page: 'book' },
                { label: 'Contact', page: 'contact' },
              ].map((item) => (
                <li key={item.page}>
                  <button
                    onClick={() => onNavigate(item.page)}
                    className="text-sm transition-colors duration-200"
                    style={{ color: '#4e3219' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#d4a827')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#4e3219')}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Visit col */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] mb-5" style={{ color: '#d4a827' }}>
              Visit Us
            </h4>
            <div className="space-y-3">
              <p className="flex items-start gap-2 text-sm" style={{ color: '#4e3219' }}>
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#b8891a' }} />
                <span>Life Camp/Gwarimpa<br />Abuja, Nigeria</span>
              </p>
              <p className="flex items-start gap-2 text-sm">
                <Mail className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#b8891a' }} />
                <a href="mailto:Tushaesthetic@gmail.com" className="transition-colors"
                  style={{ color: '#4e3219' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#d4a827')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#4e3219')}
                >
                  Tushaesthetic@gmail.com
                </a>
              </p>
              <p className="text-xs pt-2" style={{ color: '#2e1c0d' }}>
                Mon – Fri: 9:00 AM – 7:00 PM<br />
                Sat: 10:00 AM – 5:00 PM<br />
                Sun: By special request
              </p>
            </div>
          </div>
        </div>

        <div className="divider-gold mb-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm" style={{ color: '#2e1c0d' }}>
            © {new Date().getFullYear()} LashifyAbuja. All rights reserved.
          </p>
          <button
            onClick={() => onNavigate('admin')}
            className="text-xs transition-colors"
            style={{ color: '#2e1c0d' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#d4a827')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#2e1c0d')}
          >
            Admin Portal
          </button>
        </div>
      </div>
    </footer>
  );
}
