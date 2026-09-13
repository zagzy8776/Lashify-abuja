import Hero from '../src/components/Hero';
import Services from '../src/components/Services';
import About from '../src/components/About';
import Gallery from '../src/components/Gallery';
import Reviews from '../src/components/Reviews';
import Contact from '../src/components/Contact';

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
