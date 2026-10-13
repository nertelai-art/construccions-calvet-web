import Image from 'next/image';
import { business } from '@/content/business';
import { showroom } from '@/content/home';
import { Arrow } from '../ui/Arrow';
import { SectionHead } from '../ui/SectionHead';
import styles from './Showroom.module.css';

export function Showroom({ index }: { index: string }) {
  const { address } = business;
  return (
    <section id="exposicio" className={`section ${styles.section}`} aria-labelledby="exposicio-titol">
      <div className={`container ${styles.grid}`}>
        <figure className={styles.photo} data-reveal>
          <Image src={showroom.image.src} alt={showroom.image.alt} sizes="(min-width: 900px) 30vw, 70vw" placeholder="blur" />
          <figcaption>{address.street}</figcaption>
        </figure>

        <div className={styles.copy}>
          <SectionHead index={index} kicker={showroom.kicker} title={showroom.title} id="exposicio-titol">
            <p className="lead">{showroom.text}</p>
          </SectionHead>

          <dl className={styles.facts} data-reveal>
            <div>
              <dt>Adreça</dt>
              <dd>
                {address.street}
                <br />
                {address.postalCode} {address.locality}
              </dd>
            </div>
            <div>
              <dt>Horari</dt>
              <dd>{business.hours.text}</dd>
            </div>
            <div>
              <dt>Telèfon</dt>
              <dd>
                <a href={business.phone.href}>{business.phone.display}</a>
              </dd>
            </div>
          </dl>

          <div className={styles.actions} data-reveal>
            <a className="btn btnPrimary" href={business.mapsUrl} target="_blank" rel="noopener noreferrer">
              {showroom.directions}
              <Arrow />
              <span className="sr-only"> (s’obre a Google Maps, en una pestanya nova)</span>
            </a>
            <a className="btn" href={business.phone.href}>
              Truca’ns
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
