export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://tushaesthetics.com').replace(/\/$/, '');
export const SITE_NAME = 'Lashify Abuja';
export const SITE_DESCRIPTION = 'Premium lash extensions, lash refills, brow services and professional lash removal in Abuja, Nigeria.';
export const SITE_LOCALE = 'en_NG';

export const SOCIAL_LINKS = [
  'https://www.instagram.com/lashifyabuja.ng',
  'https://www.tiktok.com/@lashifyabuja',
];

export const PUBLIC_ROUTES = ['/', '/services', '/about', '/gallery', '/contact'];

export const SEO_KEYWORDS = [
  'lash extensions Abuja',
  'lash studio Abuja',
  'best lash extensions Abuja',
  'lash refill Abuja',
  'lash removal Abuja',
  'brow services Abuja',
  'eyelash extensions Abuja Nigeria',
  'beauty salon Abuja',
  'lash artist Abuja',
  'lash appointment Abuja',
  'lashes in Abuja',
  'premium lashes Abuja',
];

export function absoluteUrl(path = '/') {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export function buildPageMetadata({
  title,
  description,
  path,
  keywords = SEO_KEYWORDS,
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
}) {
  const canonical = absoluteUrl(path);

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    openGraph: {
      type: 'website' as const,
      locale: SITE_LOCALE,
      url: canonical,
      siteName: SITE_NAME,
      title,
      description,
    },
    twitter: {
      card: 'summary_large_image' as const,
      title,
      description,
    },
  };
}
