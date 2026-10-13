'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { works, type WorkCategory } from '@/content/home';
import { SectionHead } from '../ui/SectionHead';
import styles from './Works.module.css';

type Filter = WorkCategory | 'totes';

export function Works({ index }: { index: string }) {
  const [filter, setFilter] = useState<Filter>('totes');
  const [open, setOpen] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  const visible = works.items.filter((item) => filter === 'totes' || item.category === filter);
  const current = open === null ? undefined : visible[open];
  const step = (delta: number) => setOpen((value) => (value === null ? value : (value + delta + visible.length) % visible.length));

  // El visor és un <dialog> natiu: Escape, focus atrapat i fons inert venen del navegador.
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open !== null && !element.open) element.showModal();
    if (open === null && element.open) element.close();
  }, [open]);

  return (
    <section id="obres" className="section" aria-labelledby="obres-titol">
      <div className="container">
        <div className={styles.head}>
          <SectionHead index={index} kicker={works.kicker} title={works.title} id="obres-titol">
            <p className="lead">{works.lead}</p>
          </SectionHead>

          <div className={styles.filters} role="group" aria-label="Filtra les obres per tipus" data-reveal>
            {works.filters.map((item) => (
              <button key={item.id} type="button" aria-pressed={filter === item.id} onClick={() => setFilter(item.id)}>
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <ul className={styles.wall}>
          {visible.map((item, position) => (
            <li key={item.src.src}>
              <button type="button" className={styles.tile} onClick={() => setOpen(position)} aria-label={`Amplia la foto: ${item.alt}`}>
                <Image src={item.src} alt={item.alt} sizes="(min-width: 1000px) 30vw, (min-width: 620px) 46vw, 92vw" placeholder="blur" />
                <span aria-hidden="true">{String(position + 1).padStart(2, '0')}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <dialog
        ref={dialog}
        className={styles.viewer}
        aria-label="Visor de fotos"
        onClose={() => setOpen(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setOpen(null);
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight') step(1);
          if (event.key === 'ArrowLeft') step(-1);
        }}
      >
        {current && (
          <figure>
            <Image key={current.src.src} src={current.src} alt={current.alt} sizes="92vw" />
            <figcaption>
              <span>
                {String((open ?? 0) + 1).padStart(2, '0')} / {String(visible.length).padStart(2, '0')}
              </span>
              {current.alt}
            </figcaption>
          </figure>
        )}
        <div className={styles.controls}>
          <button type="button" onClick={() => step(-1)} aria-label="Foto anterior">
            ←
          </button>
          <button type="button" onClick={() => step(1)} aria-label="Foto següent">
            →
          </button>
          <button type="button" onClick={() => setOpen(null)} autoFocus>
            Tanca
          </button>
        </div>
      </dialog>
    </section>
  );
}
