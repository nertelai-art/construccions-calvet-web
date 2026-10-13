import { faq } from '@/content/home';
import { SectionHead } from '../ui/SectionHead';
import styles from './Faq.module.css';

export function Faq({ index }: { index: string }) {
  return (
    <section id="preguntes" className={`section ${styles.section}`} aria-labelledby="preguntes-titol">
      <div className={`container ${styles.grid}`}>
        <SectionHead index={index} kicker={faq.kicker} title={faq.title} id="preguntes-titol" />

        <div className={styles.list} data-reveal>
          {faq.items.map((item) => (
            <details key={item.q} className={styles.item}>
              <summary>
                <h3>{item.q}</h3>
                <span aria-hidden="true" />
              </summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
