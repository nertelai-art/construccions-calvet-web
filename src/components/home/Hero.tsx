import Image from 'next/image';
import { cta, hero } from '@/content/home';
import { Arrow } from '../ui/Arrow';
import styles from './Hero.module.css';
import { MasiaElevation } from './MasiaElevation';

export function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-titol">
      <div className={`container ${styles.grid}`}>
        <div className={styles.copy}>
          <p className={`kicker ${styles.kicker}`}>{hero.kicker}</p>
          <h1 id="hero-titol" className={styles.title}>
            {hero.title.map((line, index) => (
              <span key={line} className={styles.line}>
                <span style={{ '--i': index } as React.CSSProperties}>{line}</span>{' '}
              </span>
            ))}
          </h1>
          <p className={`lead ${styles.lead}`}>{hero.lead}</p>
          <div className={styles.actions}>
            <a className="btn btnPrimary" href={cta.href}>
              {cta.label}
              <Arrow />
            </a>
            <a className="btn" href={hero.secondary.href}>
              {hero.secondary.label}
            </a>
          </div>
        </div>

        <div className={styles.visual}>
          <MasiaElevation label={hero.drawingLabel} className={styles.drawing} />
          {hero.photos.map((photo, index) => (
            <figure key={photo.tag} className={styles.photo} data-slot={index}>
              <Image src={photo.src} alt={photo.alt} sizes="(min-width: 900px) 22vw, 44vw" priority={index === 0} placeholder="blur" />
              <figcaption>{photo.tag}</figcaption>
            </figure>
          ))}
        </div>
      </div>

      {/* Caixetí: com el del peu d'un plànol, amb les dades que sostenen el titular */}
      <div className="container">
        <dl className={styles.block}>
          {hero.facts.map((fact) => (
            <div key={fact.label}>
              <dt>{fact.label}</dt>
              <dd>
                <strong>{fact.value}</strong>
                <span>{fact.note}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
