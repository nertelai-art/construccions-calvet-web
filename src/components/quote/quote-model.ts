// Model del pressupost guiat: opcions, validació i resum. TypeScript pur, sense React ni DOM.
// L'enviament encara no té proveïdor: de moment la sol·licitud surt pel correu de qui l'omple.

export const JOB_TYPES = ['Obra nova', 'Reforma integral', 'Rehabilitació de masia', 'Reparació o manteniment', 'Comunitat de veïns', 'Obra pública o una altra cosa'] as const;
export const PROPERTY_TYPES = ['Casa', 'Pis', 'Masia', 'Local', 'Edifici', 'Solar'] as const;
export const SIZES = ['Menys de 50 m²', 'De 50 a 100 m²', 'De 100 a 200 m²', 'Més de 200 m²', 'No ho sé'] as const;
export const TIMINGS = ['Com més aviat millor', 'D’aquí a 3 mesos', 'D’aquí a 6 mesos', 'Només m’informo'] as const;

export type QuoteData = {
  job: string;
  town: string;
  property: string;
  size: string;
  timing: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
};

export const emptyQuote: QuoteData = { job: '', town: '', property: '', size: '', timing: '', name: '', phone: '', email: '', notes: '' };

export const STEP_COUNT = 4;
export type QuoteErrors = Partial<Record<keyof QuoteData, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Un telèfon és vàlid si, tret d'espais, punts, guions i un + inicial, té entre 9 i 15 xifres. */
export function isPhone(value: string) {
  const digits = value.replace(/[\s.()-]/g, '').replace(/^\+/, '');
  return /^\d{9,15}$/.test(digits);
}

/** Errors del pas indicat (0–3). Un objecte buit vol dir que es pot continuar. */
export function validateStep(step: number, data: QuoteData): QuoteErrors {
  const errors: QuoteErrors = {};
  if (step === 0 && !data.job) errors.job = 'Tria quina mena d’obra és.';
  if (step === 1) {
    if (data.town.trim().length < 2) errors.town = 'Escriu el municipi on és l’obra.';
    if (!data.property) errors.property = 'Tria el tipus d’immoble.';
  }
  if (step === 2) {
    if (!data.size) errors.size = 'Tria una superfície aproximada, o «No ho sé».';
    if (!data.timing) errors.timing = 'Digues quan voldries començar.';
  }
  if (step === 3) {
    if (data.name.trim().length < 2) errors.name = 'Escriu el teu nom.';
    if (!isPhone(data.phone)) errors.phone = 'Escriu un telèfon de 9 xifres on et puguem trucar.';
    if (data.email.trim() && !EMAIL.test(data.email.trim())) errors.email = 'Aquest correu no sembla complet. Revisa’l o deixa’l en blanc.';
  }
  return errors;
}

export const isComplete = (data: QuoteData) => Array.from({ length: STEP_COUNT }, (_, step) => validateStep(step, data)).every((errors) => Object.keys(errors).length === 0);

/** Resum de la sol·licitud, línia a línia: el mateix que es veu a pantalla i el que s'envia. */
export function summaryLines(data: QuoteData): [string, string][] {
  const lines: [string, string][] = [
    ['Obra', data.job],
    ['On', `${data.property} a ${data.town.trim()}`],
    ['Superfície', data.size],
    ['Quan', data.timing],
    ['Nom', data.name.trim()],
    ['Telèfon', data.phone.trim()],
  ];
  if (data.email.trim()) lines.push(['Correu', data.email.trim()]);
  if (data.notes.trim()) lines.push(['Comentari', data.notes.trim()]);
  return lines;
}

/** Enllaç `mailto:` amb la sol·licitud ja escrita. */
export function mailtoHref(data: QuoteData, to: string) {
  const subject = `Sol·licitud de pressupost: ${data.job.toLowerCase()} a ${data.town.trim()}`;
  const body = ['Bon dia,', '', 'Voldria un pressupost per a aquesta obra:', '', ...summaryLines(data).map(([label, value]) => `${label}: ${value}`), '', 'Gràcies.'].join('\n');
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
