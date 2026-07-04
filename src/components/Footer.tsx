import { Instagram, Mail } from 'lucide-react';
import { TikTokIcon } from './TikTokIcon';

export default function Footer() {
  return (
    <footer className="pt-16 pb-8" style={{ background: '#050506' }}>
      <div className="container-lux text-center">
        <div className="divider-gold mb-12" />

        {/* Brand */}
        <div className="flex flex-col items-center gap-3 mb-6">
            <div className="w-10 h-10 transition-all duration-300">
              <img
                src="/images/logo.png"
                alt="LashifyAbuja Logo"
                className="w-full h-full object-contain"
              />
            </div>
          <div>
            <div className="font-serif text-xl" style={{ color: '#f4e6e0' }}>
              Lashify<span style={{ color: '#b38b9e' }}>Abuja</span>
            </div>
            <div className="text-[9px] uppercase tracking-[0.2em] mt-0.5" style={{ color: '#5a4850' }}>
              Lash &amp; Brow Studio
            </div>
          </div>
        </div>

        <p className="leading-relaxed max-w-md mx-auto mb-8 text-sm" style={{ color: '#5a4850' }}>
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
              style={{ border: '1px solid rgba(179, 139, 158, 0.3)', color: '#b38b9e' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(179, 139, 158, 0.08)';
                (e.currentTarget as HTMLElement).style.borderColor = '#3d2e36';
                (e.currentTarget as HTMLElement).style.color = '#3d2e36';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(179, 139, 158, 0.3)';
                (e.currentTarget as HTMLElement).style.color = '#b38b9e';
              }}
              aria-label={item.label}
            >
              <item.Icon className="w-4 h-4" />
            </a>
          ))}
        </div>
 
        <div className="divider-gold mb-6" />
 
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
          <p className="text-xs" style={{ color: '#8f7882' }}>
            © {new Date().getFullYear()} LashifyAbuja. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
