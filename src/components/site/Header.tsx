'use client';

import { useEffect, useState } from 'react';
import { business } from '@/content/business';
import { cta, nav } from '@/content/home';
import { LogoMark } from '../ui/Logo';
import { SectionLink } from '../ui/SectionLink';
import styles from './Header.module.css';

export function Wordmark() {
  return (
    <span className={styles.wordmark}>
      <LogoMark className={styles.mark} />
      <span>
        <strong>Calvet Sala</strong>
        <small>Construccions</small>
      </span>
    </span>
  );
}

export function Header({ home = true }: { home?: boolean }) {
  const [open, setOpen] = useState(false);

  // El menú de mòbil es tanca amb Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className={styles.header} data-open={open || undefined}>
      <div className={`container ${styles.bar}`}>
        <SectionLink home={home} href="#contingut" className={styles.home} aria-label={`${business.name}, inici`}>
          <Wordmark />
        </SectionLink>

        <nav id="menu" className={styles.nav} aria-label="Seccions">
          <ul>
            {nav.map((item) => (
              <li key={item.href}>
                <SectionLink home={home} href={item.href} onClick={() => setOpen(false)}>
                  {item.label}
                </SectionLink>
              </li>
            ))}
          </ul>
          <a className={styles.navPhone} href={business.phone.href}>
            {business.phone.display}
          </a>
        </nav>

        <div className={styles.actions}>
          <a className={styles.phone} href={business.phone.href}>
            <span className="sr-only">Truca&apos;ns al </span>
            {business.phone.display}
          </a>
          <SectionLink home={home} className={`btn btnPrimary ${styles.cta}`} href={cta.href} onClick={() => setOpen(false)}>
            <span className={styles.ctaLong}>{cta.label}</span>
            <span className={styles.ctaShort}>Pressupost</span>
          </SectionLink>
          <button type="button" className={styles.toggle} aria-expanded={open} aria-controls="menu" onClick={() => setOpen((value) => !value)}>
            <span className="sr-only">{open ? 'Tanca el menú' : 'Obre el menú'}</span>
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}
