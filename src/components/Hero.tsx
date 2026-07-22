"use client";

import { useState, useEffect } from 'react';
import { Calendar, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function Hero() {
  const [visible, setVisible] = useState(false);

  useEffect(() => { 
    setTimeout(() => setVisible(true), 100); 
  }, []);

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden pt-24 pb-20" style={{ backgroundColor: '#faf5f0' }}>
      
      {/* Animated Spotlights */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="spotlight-1 absolute w-[600px] h-[600px] -top-20 -left-20 animate-pulse" style={{ animationDuration: '4s', willChange: 'opacity' }} />
        <div className="spotlight-2 absolute w-[600px] h-[600px] top-40 -right-20 animate-pulse" style={{ animationDuration: '6s', willChange: 'opacity' }} />
      </div>

      <div className="container-lux relative z-10 flex flex-col items-center text-center max-w-4xl w-full">
        
        <div className={`transition-all duration-1000 w-full ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h1 className="text-5xl md:text-7xl lg:text-[5rem] font-serif tracking-tight text-gray-900 mb-6 leading-[1.05]">
            ABUJA'S #1 LASH STUDIO
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-4 max-w-2xl mx-auto leading-relaxed font-medium">
            <span className="italic" style={{ color: '#b38b9e' }}>Where your eyes become art</span>
          </p>
          <p className="text-base md:text-lg text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed">
            Luxury lash extensions &amp; brow artistry by Lashify — Abuja's most trusted specialist.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/book"
              className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-bold text-lg px-10 py-4 rounded-full transition-all duration-200 active:scale-95 shadow-lg shadow-rose-200 w-full sm:w-auto justify-center"
            >
              <Calendar className="w-5 h-5" />
              Book Appointment
            </Link>
            <a
              href="#services"
              className="flex items-center gap-2 font-bold text-lg px-10 py-4 rounded-full transition-all duration-200 border-2 w-full sm:w-auto justify-center"
              style={{ borderColor: 'rgba(179,139,158,0.4)', color: '#5a4850' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = '#b38b9e';
                (e.currentTarget as HTMLElement).style.color = '#b38b9e';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(179,139,158,0.4)';
                (e.currentTarget as HTMLElement).style.color = '#5a4850';
              }}
            >
              View Services
              <ChevronRight className="w-5 h-5" />
            </a>
          </div>

          {/* Social Proof / Counters */}
          <div className="flex flex-wrap justify-center gap-10 md:gap-20 border-t border-[rgba(179,139,158,0.2)] pt-10">
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
    </section>
  );
}
