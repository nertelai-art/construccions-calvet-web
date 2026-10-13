import { resolveSiteUrl } from './site-url';

describe('adreça pública del web', () => {
  it('la variable explícita mana, i se li treu la barra final', () => {
    expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: 'https://www.exemple.cat/', VERCEL_ENV: 'production', VERCEL_PROJECT_PRODUCTION_URL: 'projecte.vercel.app' })).toBe('https://www.exemple.cat');
  });

  it('a producció de Vercel fa servir el domini de producció del projecte', () => {
    expect(resolveSiteUrl({ VERCEL_ENV: 'production', VERCEL_PROJECT_PRODUCTION_URL: 'projecte.vercel.app', VERCEL_URL: 'projecte-abc123.vercel.app' })).toBe('https://projecte.vercel.app');
  });

  it('a una previsualització fa servir l’adreça del desplegament', () => {
    expect(resolveSiteUrl({ VERCEL_ENV: 'preview', VERCEL_PROJECT_PRODUCTION_URL: 'projecte.vercel.app', VERCEL_URL: 'projecte-abc123.vercel.app' })).toBe('https://projecte-abc123.vercel.app');
  });

  it('fora de Vercel i sense variable, és el servidor local', () => {
    expect(resolveSiteUrl({})).toBe('http://localhost:3000');
    expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: '  ' })).toBe('http://localhost:3000');
  });
});
