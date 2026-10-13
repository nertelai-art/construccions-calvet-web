import { company } from '@/content/home';
import { SectionHead } from '../ui/SectionHead';
import styles from './Company.module.css';

export function Company({ index }: { index: string }) {
  return (
    <section id="empresa" className="section" aria-labelledby="empresa-titol">
      <div className={`container ${styles.grid}`}>
        <div>
          <SectionHead index={index} kicker={company.kicker} title={company.title} id="empresa-titol" />
          <div className={styles.text} data-reveal>
            {company.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>

        <div className={styles.credentials} data-reveal>
          <h3>{company.credentialsTitle}</h3>
          <ul>
            {company.credentials.map((credential) => (
              <li key={credential.code}>
                <strong>{credential.code}</strong>
                <span>{credential.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
