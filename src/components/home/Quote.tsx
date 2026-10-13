import { business } from '@/content/business';
import { quote } from '@/content/home';
import { QuoteWizard } from '../quote/QuoteWizard';
import styles from './Quote.module.css';

export function Quote({ index }: { index: string }) {
  const { address } = business;
  return (
    <section id="pressupost" className={styles.section} aria-labelledby="pressupost-titol">
      <div className={`container ${styles.grid}`}>
        <div className={styles.copy} data-reveal>
          <p className="kicker">
            <b>{index}</b> {quote.kicker}
          </p>
          <h2 id="pressupost-titol" className="display">
            {quote.title}
          </h2>
          <p className={styles.lead}>{quote.lead}</p>

          <ul className={styles.direct}>
            <li>
              <span>Telèfon</span>
              <a href={business.phone.href}>{business.phone.display}</a>
            </li>
            <li>
              <span>Correu</span>
              <a href={`mailto:${business.email}`}>{business.email}</a>
            </li>
            <li>
              <span>Exposició</span>
              <p>
                {address.street}, {address.locality}
              </p>
            </li>
          </ul>
        </div>

        <div data-reveal style={{ '--d': '120ms' } as React.CSSProperties}>
          <QuoteWizard />
        </div>
      </div>
    </section>
  );
}
