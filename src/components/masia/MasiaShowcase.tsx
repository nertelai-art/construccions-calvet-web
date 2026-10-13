'use client';

// Secció alta amb un escenari sticky: text HTML real a sobre i el canvas darrere.
// No importa three.js: l'escena es carrega amb next/dynamic quan la secció és a prop.

import dynamic from 'next/dynamic';
import { useRef } from 'react';
import { anatomy } from '@/content/home';
import { useNearViewport, useReducedMotion, useRenderMode, useScrollProgress } from '@/lib/scroll-scene';
import { MasiaElevation } from '../home/MasiaElevation';
import { duskAt, stepAt } from './masia-phases';
import styles from './MasiaShowcase.module.css';

const MasiaScene = dynamic(() => import('./MasiaScene'), { ssr: false });

const LAST_STEP = anatomy.steps.length - 1;
const two = (value: number) => String(value).padStart(2, '0');

export function MasiaShowcase({ index }: { index: string }) {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const steps = useRef<HTMLOListElement>(null);
  const labels = useRef<HTMLUListElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const mode = useRenderMode();
  const reducedMotion = useReducedMotion();
  const near = useNearViewport(section);

  // Pas actiu, comptador, regle i capvespre: directament al DOM, mai amb setState (canvia a cada píxel).
  const progress = useScrollProgress(section, (raw) => {
    const value = reducedMotion ? 1 : raw;
    const active = stepAt(value);
    // Només els fills directes: el pas de les instal·lacions porta una llista (la llegenda) a dins.
    const items = steps.current?.children ?? [];
    for (let position = 0; position < items.length; position++) {
      (items[position] as HTMLElement).dataset.state = position < active ? 'done' : position === active ? 'active' : 'todo';
    }
    if (counter.current) counter.current.textContent = two(active + 1);
    if (bar.current) bar.current.style.transform = `scaleX(${value})`;
    if (stage.current) {
      const dusk = duskAt(value);
      stage.current.style.setProperty('--dusk', dusk.toFixed(3));
      stage.current.dataset.step = String(active);
      stage.current.dataset.dark = dusk > 0.5 ? 'true' : 'false';
    }
  });

  // Al servidor («pending») es reserva el recorregut sencer: així no hi ha salt en hidratar.
  const compact = mode === 'static';
  const initial = reducedMotion ? LAST_STEP : 0;

  return (
    <section ref={section} id="anatomia" aria-labelledby="anatomia-titol" className={styles.section} data-compact={compact || undefined} data-still={reducedMotion || undefined}>
      <div ref={stage} className={styles.stage} data-step={initial} data-dark="false">
        <div className={styles.dusk} aria-hidden="true" />

        {mode === '3d' && near && (
          <div className={styles.canvas}>
            <MasiaScene progress={progress} reducedMotion={reducedMotion} labelsRef={labels} />
          </div>
        )}

        <ul ref={labels} className={styles.labels} aria-hidden="true">
          {anatomy.labels.map((label) => (
            <li key={label}>
              <span>{label}</span>
            </li>
          ))}
        </ul>

        <div className={`container ${styles.content}`}>
          <div className={styles.copy}>
            <p className="kicker">
              <b>{index}</b> {anatomy.kicker}
            </p>
            <h2 id="anatomia-titol" className={styles.title}>
              {anatomy.title}
            </h2>
            <p className={styles.lead}>{anatomy.lead}</p>

            <ol ref={steps} className={styles.steps}>
              {anatomy.steps.map((step, position) => (
                <li key={step.title} data-state={position < initial ? 'done' : position === initial ? 'active' : 'todo'}>
                  <span className={styles.number}>{two(position + 1)}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <div className={styles.body}>
                      <p>{step.text}</p>
                      {'legend' in step && (
                        <ul className={styles.legend} aria-hidden="true">
                          {anatomy.legend.map((item) => (
                            <li key={item.label} data-tone={item.tone}>
                              {item.label}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {compact && <MasiaElevation animated={false} className={styles.fallback} />}
        </div>

        <div className={styles.ruler} aria-hidden="true">
          <span className={styles.count}>
            <span ref={counter}>{two(initial + 1)}</span> / {two(anatomy.steps.length)}
          </span>
          <span className={styles.track}>
            <span ref={bar} className={styles.fill} />
          </span>
        </div>

        {/* Per a lectors de pantalla i cercadors */}
        <p className="sr-only">{anatomy.srDescription}</p>
      </div>
    </section>
  );
}
