import { cta, services } from '@/content/home';
import { Arrow } from '../ui/Arrow';
import { SectionHead } from '../ui/SectionHead';
import styles from './Services.module.css';

export function Services({ index }: { index: string }) {
  return (
    <section id="serveis" className="section" aria-labelledby="serveis-titol">
      <div className="container">
        <SectionHead index={index} kicker={services.kicker} title={services.title} id="serveis-titol" />

        <ul className={styles.doors}>
          {services.groups.map((group, position) => (
            <li key={group.door} className={styles.door} data-reveal style={{ '--d': `${position * 70}ms` } as React.CSSProperties}>
              <p className={styles.letter} aria-hidden="true">
                {String.fromCharCode(65 + position)}
              </p>
              <h3 className={styles.name}>{group.door}</h3>
              <ul className={styles.items}>
                {group.items.map((item) => (
                  <li key={item.name}>
                    <h4>{item.name}</h4>
                    <p>{item.text}</p>
                  </li>
                ))}
              </ul>
              <a className={styles.go} href={cta.href} aria-label={`${cta.label}: ${group.door.toLowerCase()}`}>
                <Arrow />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
