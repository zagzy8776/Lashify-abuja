import type { Metadata } from 'next';
import Contact from '../../src/components/Contact';
import { buildPageMetadata } from '../../src/lib/seo-config';

export const metadata: Metadata = buildPageMetadata({
  title: 'Contact Lashify Abuja | Book Your Lash Appointment',
  description: 'Find Lashify Abuja, view opening hours and contact us to book professional lash extensions, refills, removal and brow services in Abuja, Nigeria.',
  path: '/contact',
  keywords: ['contact Lashify Abuja', 'book lash appointment Abuja', 'lash studio Abuja location', 'lash salon Abuja phone', 'lash appointment Abuja'],
});

export default function ContactPage() {
  return <div className="pt-20"><Contact /></div>;
}
