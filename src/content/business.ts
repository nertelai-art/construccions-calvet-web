// Dades del negoci. Totes surten del web del client (13-10-2026) tret de l'horari,
// que ve de directoris i de la fitxa de Google: vegeu «Pendent de confirmar» a CLAUDE.md.

export const business = {
  name: 'Calvet Sala Construccions',
  legalName: 'Construccions i Reformes Calvet Sala SL',
  taxId: 'B17614140',
  registry: 'Registre Mercantil de Girona, tom 1485, foli 133, full GI-25039',
  phone: { display: '972 758 693', href: 'tel:+34972758693' },
  email: 'reformes@construccions-calvet.com',
  address: {
    street: "Ctra. de l'Estartit, 147",
    postalCode: '17257',
    locality: 'Torroella de Montgrí',
    region: 'Girona',
    country: 'ES',
  },
  geo: { latitude: 42.0421203, longitude: 3.1397646 },
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Calvet+Sala+Construccions+Torroella+de+Montgr%C3%AD',
  hours: {
    text: 'De dilluns a divendres, de 9 a 13 h i de 16 a 19 h',
    schema: [
      { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:00', closes: '13:00' },
      { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '16:00', closes: '19:00' },
    ],
  },
  showroomSince: 2010,
} as const;

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
