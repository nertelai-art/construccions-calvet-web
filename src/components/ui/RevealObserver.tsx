'use client';

import { useEffect } from 'react';

/**
 * Marca amb `data-in` els elements `[data-reveal]` quan entren a la vista. Un sol observador per a
 * tota la pàgina; l'estat amagat només existeix al CSS quan hi ha JavaScript i moviment permès.
 */
export function RevealObserver() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.in = '';
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    document.querySelectorAll('[data-reveal]:not([data-in])').forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
  return null;
}
