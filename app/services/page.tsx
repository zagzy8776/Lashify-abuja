import type { Metadata } from 'next';
import Services from '../../src/components/Services';
import { buildPageMetadata } from '../../src/lib/seo-config';

export const metadata: Metadata = buildPageMetadata({
  title: 'Lash Extensions & Beauty Services in Abuja',
  description: 'Explore lash extensions, lash refills, lash removal and brow services at Lashify Abuja. View treatments, prices and durations, then book your appointment.',
  path: '/services',
  keywords: [
    'lash extensions Abuja',
    'lash refill Abuja',
    'lash removal Abuja',
    'brow services Abuja',
    'eyelash extensions Abuja Nigeria',
    'lash artist Abuja',
    'beauty salon Abuja',
  ],
});

export default function ServicesPage() {
  return <div className="pt-20"><Services /></div>;
}
