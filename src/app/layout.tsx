import type { Metadata, Viewport } from 'next';
import { Besley, IBM_Plex_Mono, Instrument_Sans } from 'next/font/google';
import type { ReactNode } from 'react';
import { RevealObserver } from '@/components/ui/RevealObserver';
import { business, siteUrl } from '@/content/business';
import './globals.css';

const besley = Besley({ subsets: ['latin'], variable: '--font-besley', display: 'swap' });
const instrument = Instrument_Sans({ subsets: ['latin'], variable: '--font-instrument', display: 'swap' });
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-plex-mono', display: 'swap' });

const description =
  'Obra nova, reformes integrals i rehabilitació de masies a la Costa Brava i la província de Girona. Exposició pròpia a Torroella de Montgrí i pressupost detallat abans de començar.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Calvet Sala Construccions · Obra nova, reformes i masies a l’Empordà',
    template: '%s · Calvet Sala Construccions',
  },
  description,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'ca_ES',
    siteName: business.name,
    title: 'Calvet Sala Construccions · La teva casa a l’Empordà, de la primera pedra a les claus en mà',
    description,
    url: '/',
  },
};

export const viewport: Viewport = { themeColor: '#f4efe6' };

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'GeneralContractor',
  name: business.name,
  legalName: business.legalName,
  taxID: business.taxId,
  url: siteUrl,
  telephone: '+34972758693',
  email: business.email,
  address: {
    '@type': 'PostalAddress',
    streetAddress: business.address.street,
    postalCode: business.address.postalCode,
    addressLocality: business.address.locality,
    addressRegion: business.address.region,
    addressCountry: business.address.country,
  },
  geo: { '@type': 'GeoCoordinates', ...business.geo },
  areaServed: ['Costa Brava', 'Baix Empordà', 'Província de Girona'],
  openingHoursSpecification: business.hours.schema.map((slot) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: slot.days,
    opens: slot.opens,
    closes: slot.closes,
  })),
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ca" className={`${besley.variable} ${instrument.variable} ${plexMono.variable}`}>
      <body>
        <a className="skip" href="#contingut">
          Salta al contingut
        </a>
        {children}
        <RevealObserver />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      </body>
    </html>
  );
}
