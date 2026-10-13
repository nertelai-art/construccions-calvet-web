'use client';

import Image from 'next/image';
import { useId, useRef, useState } from 'react';
import { beforeAfter } from '@/content/home';
import styles from './BeforeAfter.module.css';

/**
 * Cortina d'abans i després. El control és un `<input type="range">` invisible estès sobre la foto:
 * arrossegar, tocar i les fletxes del teclat funcionen sols, i només s'escriu una variable CSS.
 */
export function BeforeAfter({ index }: { index: string }) {
  const [active, setActive] = useState(0);
  const frame = useRef<HTMLDivElement>(null);
  const slider = useRef<HTMLInputElement>(null);
  const rangeId = useId();
  const pair = beforeAfter.pairs[active]!;

  const move = (value: string) => frame.current?.style.setProperty('--pos', `${value}%`);

  const select = (position: number) => {
    setActive(position);
    if (slider.current) slider.current.value = '50';
    move('50');
  };

  return (
    <section id="abans-i-despres" className={styles.section} aria-labelledby="abans-titol">
      <div className={`container ${styles.grid}`}>
        <div className={styles.copy} data-reveal>
          <p className="kicker">
            <b>{index}</b> {beforeAfter.kicker}
          </p>
          <h2 id="abans-titol" className="display">
            {beforeAfter.title}
          </h2>
          <p className={styles.lead}>{beforeAfter.lead}</p>

          <div className={styles.tabs} role="group" aria-label="Tria l'obra">
            {beforeAfter.pairs.map((item, position) => (
              <button key={item.id} type="button" aria-pressed={position === active} onClick={() => select(position)}>
                <span aria-hidden="true">{String(position + 1).padStart(2, '0')}</span>
                {item.tab}
              </button>
            ))}
          </div>
        </div>

        <figure className={styles.figure} data-reveal>
          <div ref={frame} className={styles.frame}>
            {/* `key` per obra: en canviar de pestanya les fotos es munten de nou i no es barregen. */}
            <Image key={`${pair.id}-after`} className={styles.image} src={pair.after} alt={`Després: ${pair.afterAlt}`} sizes="(min-width: 900px) 56vw, 100vw" placeholder="blur" />
            <div className={styles.before}>
              <Image key={`${pair.id}-before`} className={styles.image} src={pair.before} alt={`Abans: ${pair.beforeAlt}`} sizes="(min-width: 900px) 56vw, 100vw" placeholder="blur" />
            </div>
            <label htmlFor={rangeId} className="sr-only">
              Posició de la línia entre l’abans i el després de {pair.tab.toLowerCase()}
            </label>
            <input ref={slider} id={rangeId} className={styles.range} type="range" min={0} max={100} step={0.5} defaultValue={50} onInput={(event) => move(event.currentTarget.value)} />
            <span className={styles.tag} data-side="before" aria-hidden="true">
              Abans
            </span>
            <span className={styles.tag} data-side="after" aria-hidden="true">
              Després
            </span>
            <span className={styles.handle} aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M9 6l-6 6 6 6M15 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" />
              </svg>
            </span>
          </div>
          <figcaption>{pair.caption}</figcaption>
        </figure>
      </div>
    </section>
  );
}
