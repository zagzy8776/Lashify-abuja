import type { Metadata } from 'next';
import '../src/index.css';
import Navbar from '../src/components/Navbar';
import Footer from '../src/components/Footer';
import SeoStructuredData from '../src/components/SeoStructuredData';
import { Toaster } from 'react-hot-toast';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, SEO_KEYWORDS } from '../src/lib/seo-config';

export const revalidate = 60;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Premium Lash & Brow Studio in Abuja`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: SEO_KEYWORDS,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: 'beauty',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Premium Lash & Brow Studio in Abuja`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} | Premium Lash & Brow Studio in Abuja`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NG">
      <body className="min-h-screen antialiased bg-[#faf5f0]" style={{ backgroundColor: '#faf5f0' }}>
        <SeoStructuredData />
        <Toaster position="bottom-right" />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
