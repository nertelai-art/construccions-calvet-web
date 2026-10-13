import { business } from '@/content/business';
import { cta, nav } from '@/content/home';
import styles from './Footer.module.css';
import { SectionLink } from '../ui/SectionLink';
import { Wordmark } from './Header';

export function Footer({ home = true }: { home?: boolean }) {
  const { address } = business;
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.brand}>
          <Wordmark />
          <p>Obra nova, reformes integrals i rehabilitació de masies a la Costa Brava i la província de Girona.</p>
        </div>

        <div>
          <h2>Exposició i oficines</h2>
          <address>
            {address.street}
            <br />
            {address.postalCode} {address.locality} ({address.region})
          </address>
          <p>{business.hours.text}</p>
        </div>

        <div>
          <h2>Contacte</h2>
          <ul>
            <li>
              <a href={business.phone.href}>{business.phone.display}</a>
            </li>
            <li>
              <a href={`mailto:${business.email}`}>{business.email}</a>
            </li>
            <li>
              <SectionLink home={home} href={cta.href}>
                {cta.label}
              </SectionLink>
            </li>
          </ul>
        </div>

        <nav aria-label="Peu de pàgina">
          <h2>Seccions</h2>
          <ul>
            {nav.map((item) => (
              <li key={item.href}>
                <SectionLink home={home} href={item.href}>
                  {item.label}
                </SectionLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className={`container ${styles.legal}`}>
        <p>
          {business.legalName} · CIF {business.taxId} · {business.registry}
        </p>
      </div>
    </footer>
  );
}
