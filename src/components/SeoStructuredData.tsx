import { SERVICE_CATALOG } from '../lib/services-catalog';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, SOCIAL_LINKS, absoluteUrl } from '../lib/seo-config';

export default function SeoStructuredData() {
  const business = {
    '@context': 'https://schema.org',
    '@type': 'BeautySalon',
    '@id': `${SITE_URL}/#business`,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    telephone: '+2348087026970',
    email: 'Tushaesthetic@gmail.com',
    priceRange: '₦₦',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Plot 2079 Nonso Benson Udeh Street',
      addressLocality: 'Abuja',
      addressRegion: 'FCT',
      addressCountry: 'NG',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '19:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '10:00',
        closes: '17:00',
      },
    ],
    sameAs: SOCIAL_LINKS,
    areaServed: {
      '@type': 'City',
      name: 'Abuja',
    },
  };

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    publisher: { '@id': `${SITE_URL}/#business` },
    inLanguage: 'en-NG',
  };

  // Do not publish placeholder/zero prices as structured-data offers.
  const services = SERVICE_CATALOG
    .filter((service) => service.price > 0)
    .map((service) => ({
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: service.name,
      description: service.description,
      provider: { '@id': `${SITE_URL}/#business` },
      areaServed: { '@type': 'City', name: 'Abuja' },
      offers: {
        '@type': 'Offer',
        priceCurrency: 'NGN',
        price: String(service.price),
        availability: 'https://schema.org/InStock',
        url: absoluteUrl('/services'),
      },
    }));

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(business) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }} />
      {services.map((service) => (
        <script key={service.name} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(service) }} />
      ))}
    </>
  );
}
