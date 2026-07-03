import { Instagram, Mail } from 'lucide-react';
import { TikTokIcon } from './TikTokIcon';

export default function Footer() {
  return (
    <footer className="pt-16 pb-8" style={{ background: '#060403' }}>
      <div className="container-lux text-center">
        <div className="divider-gold mb-12" />

        {/* Brand */}
        <div className="flex flex-col items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full overflow-hidden"
            style={{ border: '1px solid rgba(205,115,141,0.3)', boxShadow: '0 0 20px rgba(205,115,141,0.1)' }}>
            <img
              src="/images/WhatsApp_Image_2026-06-30_at_2.12.44_PM.jpeg"
              alt="LashifyAbuja"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="font-serif text-xl" style={{ color: '#f9f1e8' }}>
              Lashify<span style={{ color: '#cd738d' }}>Abuja</span>
            </div>
            <div className="text-[9px] uppercase tracking-[0.2em] mt-0.5" style={{ color: '#39383b' }}>
              Lash &amp; Brow Studio
            </div>
          </div>
        </div>

        <p className="leading-relaxed max-w-md mx-auto mb-8 text-sm" style={{ color: '#39383b' }}>
          Abuja's premier destination for luxury lash extensions and brow artistry.
          Where precision meets artistry to elevate your natural beauty.
        </p>

        {/* Social Links */}
        <div className="flex justify-center gap-3.5 mb-10">
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
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
              style={{ border: '1px solid rgba(205,115,141,0.2)', color: '#6a686c' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(205,115,141,0.15)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(205,115,141,0.5)';
                (e.currentTarget as HTMLElement).style.color = '#cd738d';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(205,115,141,0.2)';
                (e.currentTarget as HTMLElement).style.color = '#6a686c';
              }}
              aria-label={item.label}
            >
              <item.Icon className="w-4 h-4" />
            </a>
          ))}
        </div>

        <div className="divider-gold mb-6" />

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
          <p className="text-xs" style={{ color: '#2e1c0d' }}>
            © {new Date().getFullYear()} LashifyAbuja. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
