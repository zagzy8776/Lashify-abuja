import type { Metadata } from 'next';
import Hero from '../src/components/Hero';
import Services from '../src/components/Services';
import About from '../src/components/About';
import Gallery from '../src/components/Gallery';
import Reviews from '../src/components/Reviews';
import Contact from '../src/components/Contact';
import { buildPageMetadata } from '../src/lib/seo-config';

export const metadata: Metadata = buildPageMetadata({
  title: 'Premium Lash Studio in Abuja | Lashify Abuja',
  description: 'Lashify Abuja offers premium lash extensions, lash refills, lash removal and brow artistry in Abuja, Nigeria. Explore services, see our work and book an appointment.',
  path: '/',
  keywords: [
    'lash extensions Abuja',
    'premium lash studio Abuja',
    'lash artist Abuja',
    'lash refill Abuja',
    'lash removal Abuja',
    'brow services Abuja',
    'beauty salon Abuja',
  ],
});

export default function Home() {
  return (
    <>
      <Hero />
      <Services compact />
      <About />
      <Gallery />
      <Reviews />
      <Contact />
    </>
  );
}
