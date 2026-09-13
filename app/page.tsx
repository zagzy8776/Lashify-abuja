import Hero from '../src/components/Hero';
import Services from '../src/components/Services';
import About from '../src/components/About';
import Gallery from '../src/components/Gallery';
import Reviews from '../src/components/Reviews';
import Contact from '../src/components/Contact';
import type { Service } from '../src/lib/api';
import { redirect } from 'next/navigation';

export default function Home() {
  const handleBookService = (service: Service) => {
    redirect(`/book?service=${encodeURIComponent(service.slug)}`);
  };

  return (
    <>
      <Hero />
      <Services onBookService={handleBookService} compact />
      <About />
      <Gallery />
      <Reviews />
      <Contact />
    </>
  );
}
