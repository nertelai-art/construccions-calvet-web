import { resolveSiteUrl } from '@/lib/site-url';

// Només per al servidor (metadades i dades estructurades). Les variables es llegeixen una per una
// perquè Next pugui substituir-les en compilar.
export const siteUrl = resolveSiteUrl({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  VERCEL_ENV: process.env.VERCEL_ENV,
  VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL,
  VERCEL_URL: process.env.VERCEL_URL,
});
