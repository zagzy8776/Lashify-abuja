import type { Metadata } from 'next';
import About from '../../src/components/About';
import { buildPageMetadata } from '../../src/lib/seo-config';

export const metadata: Metadata = buildPageMetadata({
  title: 'About Lashify Abuja | Luxury Lash Studio',
  description: 'Learn about Lashify Abuja, our approach to professional lash extensions, refills, brow services and personalised beauty care in Abuja, Nigeria.',
  path: '/about',
  keywords: ['about Lashify Abuja', 'lash studio Abuja', 'lash artist Abuja', 'beauty salon Abuja', 'lashes Abuja Nigeria'],
});

export default function AboutPage() {
  return <div className="pt-20"><About /></div>;
}
