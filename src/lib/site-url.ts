export type SiteEnv = {
  NEXT_PUBLIC_SITE_URL?: string;
  VERCEL_ENV?: string;
  VERCEL_PROJECT_PRODUCTION_URL?: string;
  VERCEL_URL?: string;
};

/**
 * Adreça pública del web, sense barra final: la que surt a l'enllaç canònic i a `og:url`.
 * Mana `NEXT_PUBLIC_SITE_URL`. Si no hi és, a Vercel es fa servir el domini de producció del projecte
 * (o l'adreça del desplegament, en una previsualització) i, fora de Vercel, el servidor local.
 */
export function resolveSiteUrl(env: SiteEnv): string {
  const explicit = env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, '');
  const host = env.VERCEL_ENV === 'production' ? env.VERCEL_PROJECT_PRODUCTION_URL : env.VERCEL_URL;
  return host ? `https://${host}` : 'http://localhost:3000';
}
