import type { Metadata } from 'next';
import Gallery from '../../src/components/Gallery';
import { buildPageMetadata } from '../../src/lib/seo-config';

export const metadata: Metadata = buildPageMetadata({
  title: 'Lash Gallery Abuja | Lash Extensions & Beauty Results',
  description: 'Browse Lashify Abuja’s lash and beauty gallery for inspiration, including lash extensions, refills and professional beauty treatments.',
  path: '/gallery',
  keywords: ['lash gallery Abuja', 'lash extensions Abuja photos', 'lashes Abuja', 'lash inspiration Abuja', 'lash artist Abuja'],
});

export default function GalleryPage() {
  return <div className="pt-20"><Gallery /></div>;
}
