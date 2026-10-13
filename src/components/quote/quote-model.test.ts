import { emptyQuote, isComplete, isPhone, mailtoHref, summaryLines, validateStep, type QuoteData } from './quote-model';

const full: QuoteData = {
  job: 'Rehabilitació de masia',
  town: ' Pals ',
  property: 'Masia',
  size: 'Més de 200 m²',
  timing: 'D’aquí a 6 mesos',
  name: 'Montserrat Bosch',
  phone: '612 345 678',
  email: '',
  notes: '',
};

describe('pressupost guiat', () => {
  it('no deixa passar cap pas buit', () => {
    expect(validateStep(0, emptyQuote)).toHaveProperty('job');
    expect(Object.keys(validateStep(1, emptyQuote))).toEqual(['town', 'property']);
    expect(Object.keys(validateStep(2, emptyQuote))).toEqual(['size', 'timing']);
    expect(Object.keys(validateStep(3, emptyQuote))).toEqual(['name', 'phone']);
    expect(isComplete(emptyQuote)).toBe(false);
  });

  it('accepta una sol·licitud completa sense correu ni comentari', () => {
    expect(isComplete(full)).toBe(true);
  });

  it('accepta telèfons amb espais, punts i prefix, i rebutja els incomplets', () => {
    for (const phone of ['612345678', '612 345 678', '+34 612 345 678', '972.75.86.93', '0033 6 12 34 56 78']) expect(isPhone(phone)).toBe(true);
    for (const phone of ['', '61234', 'sis-u-dos', '612 345 67a']) expect(isPhone(phone)).toBe(false);
  });

  it('el correu és opcional, però si s’escriu ha de ser complet', () => {
    expect(validateStep(3, { ...full, email: 'montse@' })).toHaveProperty('email');
    expect(validateStep(3, { ...full, email: 'montse@exemple.cat' })).toEqual({});
  });

  it('el resum només porta les línies que tenen contingut', () => {
    expect(summaryLines(full).map(([label]) => label)).toEqual(['Obra', 'On', 'Superfície', 'Quan', 'Nom', 'Telèfon']);
    expect(summaryLines(full)[1]).toEqual(['On', 'Masia a Pals']);
    expect(summaryLines({ ...full, email: 'a@b.cat', notes: 'Hi ha una volta catalana.' }).map(([label]) => label)).toContain('Comentari');
  });

  it('el correu surt escrit i ben codificat', () => {
    const href = mailtoHref({ ...full, notes: 'Teulada & façana: 100%' }, 'reformes@example.com');
    expect(href.startsWith('mailto:reformes@example.com?subject=')).toBe(true);
    const params = new URLSearchParams(href.split('?')[1]);
    expect(params.get('subject')).toBe('Sol·licitud de pressupost: rehabilitació de masia a Pals');
    expect(params.get('body')).toContain('Comentari: Teulada & façana: 100%');
    expect(params.get('body')).toContain('Telèfon: 612 345 678');
  });
});
