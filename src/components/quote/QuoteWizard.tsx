'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { business } from '@/content/business';
import { Arrow } from '../ui/Arrow';
import { JOB_TYPES, PROPERTY_TYPES, SIZES, STEP_COUNT, TIMINGS, emptyQuote, mailtoHref, summaryLines, validateStep, type QuoteData, type QuoteErrors } from './quote-model';
import styles from './QuoteWizard.module.css';

const TITLES = ['Quina obra és?', 'On és?', 'Com és de gran, i per a quan?', 'Com et trobem?', 'Aquesta és la teva sol·licitud'];

function Choices({ legend, name, options, value, error, onChange }: { legend: string; name: keyof QuoteData; options: readonly string[]; value: string; error?: string; onChange: (value: string) => void }) {
  const errorId = useId();
  return (
    <fieldset className={styles.choices} aria-describedby={error ? errorId : undefined}>
      <legend>{legend}</legend>
      <div>
        {options.map((option) => (
          <label key={option}>
            <input type="radio" name={name} value={option} checked={value === option} onChange={() => onChange(option)} />
            <span>{option}</span>
          </label>
        ))}
      </div>
      {error && (
        <p className={styles.error} id={errorId} role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: (props: { id: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }) => ReactNode }) {
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className={styles.field} data-invalid={error ? '' : undefined}>
      <label htmlFor={id}>{label}</label>
      {children({ id, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined })}
      {error ? (
        <p className={styles.error} id={`${id}-error`} role="alert">
          {error}
        </p>
      ) : (
        hint && (
          <p className={styles.hint} id={`${id}-hint`}>
            {hint}
          </p>
        )
      )}
    </div>
  );
}

export function QuoteWizard() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<QuoteData>(emptyQuote);
  const [errors, setErrors] = useState<QuoteErrors>({});
  const form = useRef<HTMLFormElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);

  const done = step === STEP_COUNT;
  const set = (key: keyof QuoteData) => (value: string) => {
    setData((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  // En canviar de pas, el focus va al títol: qui navega amb teclat o lector sap on és.
  useEffect(() => {
    if (moved.current) title.current?.focus();
  }, [step]);

  const go = (target: number) => {
    moved.current = true;
    setErrors({});
    setStep(target);
  };

  const next = () => {
    const found = validateStep(step, data);
    setErrors(found);
    if (Object.keys(found).length === 0) return go(step + 1);
    // Amb errors, el focus va al primer camp que falla.
    requestAnimationFrame(() => form.current?.querySelector<HTMLElement>('[aria-invalid="true"], fieldset[aria-describedby] input')?.focus());
  };

  return (
    <form
      ref={form}
      className={styles.card}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (!done) next();
      }}
    >
      <div className={styles.head}>
        <p aria-live="polite">{done ? 'Resum' : `Pas ${step + 1} de ${STEP_COUNT}`}</p>
        <div className={styles.progress} aria-hidden="true">
          {Array.from({ length: STEP_COUNT }, (_, index) => (
            <span key={index} data-on={index < step || done ? 'done' : index === step ? 'now' : undefined} />
          ))}
        </div>
      </div>

      <div className={styles.body} key={step}>
        <h3 ref={title} tabIndex={-1} className={styles.title}>
          {TITLES[step]}
        </h3>

        {step === 0 && <Choices legend="Tipus d’obra" name="job" options={JOB_TYPES} value={data.job} error={errors.job} onChange={set('job')} />}

        {step === 1 && (
          <>
            <Field label="Municipi" error={errors.town}>
              {(props) => <input {...props} type="text" autoComplete="address-level2" placeholder="Per exemple, Pals" value={data.town} onChange={(event) => set('town')(event.target.value)} />}
            </Field>
            <Choices legend="Tipus d’immoble" name="property" options={PROPERTY_TYPES} value={data.property} error={errors.property} onChange={set('property')} />
          </>
        )}

        {step === 2 && (
          <>
            <Choices legend="Superfície aproximada" name="size" options={SIZES} value={data.size} error={errors.size} onChange={set('size')} />
            <Choices legend="Quan voldries començar?" name="timing" options={TIMINGS} value={data.timing} error={errors.timing} onChange={set('timing')} />
          </>
        )}

        {step === 3 && (
          <>
            <div className={styles.pair}>
              <Field label="Nom" error={errors.name}>
                {(props) => <input {...props} type="text" autoComplete="name" value={data.name} onChange={(event) => set('name')(event.target.value)} />}
              </Field>
              <Field label="Telèfon" error={errors.phone}>
                {(props) => <input {...props} type="tel" inputMode="tel" autoComplete="tel" value={data.phone} onChange={(event) => set('phone')(event.target.value)} />}
              </Field>
            </div>
            <Field label="Correu" hint="Opcional." error={errors.email}>
              {(props) => <input {...props} type="email" autoComplete="email" value={data.email} onChange={(event) => set('email')(event.target.value)} />}
            </Field>
            <Field label="Vols afegir-hi res?" hint="Opcional. L’estat actual, el que t’agradaria fer, si ja tens projecte…">
              {(props) => <textarea {...props} rows={3} value={data.notes} onChange={(event) => set('notes')(event.target.value)} />}
            </Field>
          </>
        )}

        {done && (
          <>
            <dl className={styles.summary}>
              {summaryLines(data).map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <p className={styles.note}>
              S’obrirà el teu programa de correu amb el missatge ja escrit: només l’has d’enviar. Si t’estimes més parlar-ne, truca’ns al{' '}
              <a href={business.phone.href}>{business.phone.display}</a>.
            </p>
          </>
        )}
      </div>

      <div className={styles.foot}>
        {step > 0 && (
          <button type="button" className={styles.back} onClick={() => go(step - 1)}>
            {done ? 'Canvia alguna cosa' : 'Enrere'}
          </button>
        )}
        {done ? (
          <a className="btn btnPrimary" href={mailtoHref(data, business.email)}>
            Envia-la per correu
            <Arrow />
          </a>
        ) : (
          <button type="submit" className="btn btnPrimary">
            {step === STEP_COUNT - 1 ? 'Revisa la sol·licitud' : 'Continua'}
            <Arrow />
          </button>
        )}
      </div>
    </form>
  );
}
