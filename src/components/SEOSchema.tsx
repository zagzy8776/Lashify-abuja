import { Helmet } from 'react-helmet-async';

type Props = {
  title: string;
  description: string;
  serviceName?: string;
  neighborhood?: string;
};

export default function SEOSchema({ title, description, serviceName, neighborhood }: Props) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    "name": "Lashify Abuja",
    "image": "https://lashifyabuja.com/logo.png",
    "@id": "https://lashifyabuja.com",
    "url": "https://lashifyabuja.com",
    "telephone": "+2340000000000",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Plot 2079 Nonso Benson Udeh Street",
      "addressLocality": "Abuja",
      "addressCountry": "NG"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 9.0765, // Example Abuja coordinates, can be updated
      "longitude": 7.3986
    },
    "areaServed": neighborhood ? [neighborhood, "Abuja"] : ["Wuse", "Maitama", "Asokoro", "Gwarinpa", "Jabi", "Abuja"],
    "knowsAbout": serviceName ? [serviceName, "Eyelash Extensions", "Brows"] : ["Eyelash Extensions", "Russian Volume Lashes", "Classic Lashes", "Hybrid Lashes", "Microblading", "Brow Tinting", "Lash Lifts"]
  };

  return (
    <Helmet>
      <title>{title} | Lashify Abuja</title>
      <meta name="description" content={description} />
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}
