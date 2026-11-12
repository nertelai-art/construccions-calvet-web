import { nertelCreditUrl } from './nertel-credit';

// La franja «Web feta per Nertel» porta a nertel.ai en l'idioma de la pàgina, i marca d'on ve la
// visita perquè a l'analítica de nertel.ai es vegi quines webs de clients ens envien gent.
describe('enllaç de crèdit a Nertel', () => {
  it('porta a nertel.ai en l’idioma de la pàgina', () => {
    expect(new URL(nertelCreditUrl('ca')).origin).toBe('https://nertel.ai');
    expect(new URL(nertelCreditUrl('ca')).pathname).toBe('/ca');
    expect(new URL(nertelCreditUrl('es')).pathname).toBe('/es');
    expect(new URL(nertelCreditUrl('fr')).pathname).toBe('/fr');
  });

  it('si nertel.ai no té l’idioma de la pàgina, porta a la versió anglesa', () => {
    expect(new URL(nertelCreditUrl('nl')).pathname).toBe('/en');
  });

  it('diu que la visita ve del peu de la web de Calvet Sala', () => {
    const params = new URL(nertelCreditUrl('ca')).searchParams;
    expect(params.get('utm_source')).toBe('construccions-calvet-web.vercel.app');
    expect(params.get('utm_medium')).toBe('credit');
  });
});
