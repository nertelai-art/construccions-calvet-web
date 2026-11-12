// D'on ve la visita, per a l'analítica de nertel.ai. El mateix format a totes les webs de clients.
// Encara no hi ha domini propi: és el host de Vercel. Quan la web passi al domini del client, es
// canvia pel domini (sense `www.` ni protocol), i també la prova.
const SOURCE = 'construccions-calvet-web.vercel.app';

// Els idiomes que té nertel.ai. Si la pàgina és en un altre, l'enllaç porta a l'anglès.
const NERTEL_LOCALES = ['ca', 'es', 'en', 'fr', 'it', 'de'];

export function nertelCreditUrl(locale: string) {
  const path = NERTEL_LOCALES.includes(locale) ? locale : 'en';
  return `https://nertel.ai/${path}?utm_source=${SOURCE}&utm_medium=credit`;
}
