"use client";

import Hero from '../src/components/Hero';
import Services from '../src/components/Services';
import About from '../src/components/About';
import Gallery from '../src/components/Gallery';
import Reviews from '../src/components/Reviews';
import Contact from '../src/components/Contact';
import { useRouter } from 'next/navigation';
import type { Service } from '../src/lib/supabase';

export default function Home() {
  const router = useRouter();

  const handleBookService = (service: Service) => {
    // We could store the preselected service in a global state or search params
    // For now, we'll pass it in the URL query string
    router.push(`/book?service=${service.slug}`);
  };

  return (
    <>
      <Hero onBookService={handleBookService} />
      <Services onBookService={handleBookService} compact />
      <About />
      <Gallery />
      <Reviews />
      <Contact />
    </>
  );
}
