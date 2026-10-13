import type { StaticImageData } from 'next/image';
import banyA from '../../public/obres/bany-1.jpg';
import banyB from '../../public/obres/bany-2.jpg';
import banyC from '../../public/obres/bany-3.jpg';
import cuinaAbans from '../../public/obres/ba-cuina-abans.jpg';
import cuinaDespres from '../../public/obres/ba-cuina-despres.jpg';
import masiaAbans from '../../public/obres/ba-masia-abans.jpg';
import masiaDespres from '../../public/obres/ba-masia-despres.jpg';
import piscinaAbans from '../../public/obres/ba-piscina-abans.jpg';
import piscinaDespres from '../../public/obres/ba-piscina-despres.jpg';
import placaAbans from '../../public/obres/ba-placa-abans.jpg';
import placaDespres from '../../public/obres/ba-placa-despres.jpg';
import cuinaA from '../../public/obres/cuina-1.jpg';
import cuinaB from '../../public/obres/cuina-3.jpg';
import exposicio from '../../public/obres/exposicio-facana.jpg';
import facanaA from '../../public/obres/facana-1.jpg';
import facanaB from '../../public/obres/facana-2.jpg';
import facanaC from '../../public/obres/facana-3.jpg';
import heroCasa from '../../public/obres/hero-casa-piscina.jpg';
import heroMasia from '../../public/obres/hero-masia-pedra.jpg';
import interiorA from '../../public/obres/interior-1.jpg';
import interiorB from '../../public/obres/interior-2.jpg';
import interiorC from '../../public/obres/interior-3.jpg';
import masiaArc from '../../public/obres/masia-arc.jpg';

// Textos de la portada, en català. Tot el que s'afirma surt del web actual del client;
// els peus de foto descriuen el que es veu i no diuen ni poble ni any (pendents de confirmar).

export const nav = [
  { href: '#anatomia', label: 'Com treballem' },
  { href: '#serveis', label: 'Serveis' },
  { href: '#obres', label: 'Obres' },
  { href: '#exposicio', label: 'Exposició' },
  { href: '#empresa', label: 'Empresa' },
] as const;

export const cta = { label: 'Demana el pressupost', href: '#pressupost' } as const;

export const hero = {
  kicker: 'Constructors a Torroella de Montgrí',
  title: ['La teva casa', 'a l’Empordà,', 'de la primera pedra', 'a les claus en mà.'],
  lead: 'Obra nova, reformes integrals i rehabilitació de masies a la Costa Brava. Un sol equip coordina paletes, instal·lacions, fusteria i pintura, amb el pressupost detallat abans de començar.',
  secondary: { label: "Visita l'exposició", href: '#exposicio' },
  drawingLabel: 'Alçat principal · E 1:100',
  photos: [
    { src: heroMasia, alt: 'Façana de pedra d’una masia rehabilitada, amb portal d’arc i finestres emmarcades', tag: 'Rehabilitació' },
    { src: heroCasa, alt: 'Casa d’obra nova amb porxos d’arc, terrassa de fusta i piscina entre pins', tag: 'Obra nova' },
  ],
  facts: [
    { label: 'Empresa', value: 'Familiar', note: 'Diverses generacions de contractistes d’obres' },
    { label: 'Exposició', value: 'Des de 2010', note: "Ctra. de l'Estartit, 147" },
    { label: 'Obra pública', value: 'RELI · REA', note: 'Empresa classificada' },
    { label: 'Zona', value: 'Costa Brava', note: 'I província de Girona' },
  ],
} as const;

export const anatomy = {
  kicker: 'Anatomia d’una obra',
  title: 'Una masia, de la ruïna a les claus en mà.',
  lead: 'Fes scroll i mira-la per dins: cada capa és un ofici, i algú els ha de fer entrar quan toca.',
  srDescription:
    'Animació d’una masia de pedra que es rehabilita en sis passos: es retiren les teules velles, entren bigues noves, la casa s’obre en capes per mostrar fonaments, murs, forjat i instal·lacions, es tanca amb teula nova i fusteria, i acaba il·luminada al capvespre amb jardí i piscina.',
  steps: [
    { title: "L'estat actual", text: 'Visitem la casa, la mesurem i escoltem què en vols fer. En surt un pressupost detallat, partida per partida.' },
    { title: 'Enderroc i sanejament', text: 'Fora la coberta malmesa i tot el que no aguanta. El que té valor, com els murs de pedra, es queda.' },
    { title: 'Estructura', text: 'Bigues noves i reforços: la feina de paleta que després no es veu i que ho aguanta tot.' },
    { title: 'Instal·lacions', text: 'Aigua, llum i climatització passen abans de tancar res. Coordinem cada industrial perquè entri quan toca.', legend: true },
    { title: 'Coberta i fusteria', text: 'Aïllament, teula nova i fusteria interior i exterior. La casa queda tancada i protegida.' },
    { title: 'Claus en mà', text: 'Acabats, pintura i exteriors. Hi entres a viure havent parlat amb un sol interlocutor de principi a fi.' },
  ],
  labels: ['Fonaments', 'Murs de pedra', 'Forjat de bigues', 'Aigua, llum i clima', 'Estructura de coberta'],
  legend: [
    { label: 'Terra radiant', tone: 'heat' },
    { label: 'Aigua', tone: 'water' },
    { label: 'Electricitat', tone: 'power' },
  ],
} as const;

export const services = {
  kicker: 'Serveis',
  title: 'Què necessites?',
  groups: [
    {
      door: 'Vull construir',
      items: [
        {
          name: 'Obra nova',
          text: 'Xalets, cases i edificis a la Costa Brava i la província de Girona, a partir d’un pressupost totalment detallat i una organització acurada.',
        },
      ],
    },
    {
      door: 'Vull reformar',
      items: [
        {
          name: 'Reformes integrals',
          text: 'El canvi total o majoritari d’un habitatge, edifici, oficina o local. Ens hi podem implicar des del projecte fins a l’acabat, claus en mà.',
        },
        {
          name: 'Rehabilitació de masies',
          text: 'Tècniques de restauració apreses al cor de l’Empordà, on la casa pairal i la masia són a tot arreu.',
        },
      ],
    },
    {
      door: 'Tinc una reparació',
      items: [
        {
          name: 'Reparacions i manteniment de la llar',
          text: 'Paleta, instal·lacions, fusteria i pintura. Un professional de confiança també per a la feina petita.',
        },
        {
          name: 'Comunitats de veïns',
          text: 'Reparació i manteniment per a comunitats de propietaris i administradors de finques.',
        },
      ],
    },
    {
      door: 'Soc administració o tècnic',
      items: [
        {
          name: 'Obra pública',
          text: 'Inscrits al RELI, amb classificació oficial i licitadors habituals en concursos de les administracions.',
        },
        {
          name: 'Coordinació d’obres',
          text: 'Comunicació directa amb el client, els tècnics i els industrials per evitar desviaments de cost, errades d’execució i retards.',
        },
      ],
    },
  ],
} as const;

export type Comparison = { id: string; tab: string; caption: string; before: StaticImageData; after: StaticImageData; beforeAlt: string; afterAlt: string };

export const beforeAfter: { kicker: string; title: string; lead: string; pairs: Comparison[] } = {
  kicker: 'Abans i després',
  title: 'La mateixa obra, dues fotos.',
  lead: 'Obres de Calvet Sala. Arrossega la línia per comparar.',
  pairs: [
    {
      id: 'masia',
      tab: 'Masia',
      caption: 'Rehabilitació d’un cos de pedra amb obertures noves',
      before: masiaAbans,
      after: masiaDespres,
      beforeAlt: 'Mur de pedra antic amb dues portes de fusta velles i vegetació enfiladissa',
      afterAlt: 'El mateix cos de pedra rehabilitat, amb grans tancaments de vidre',
    },
    {
      id: 'placa',
      tab: 'Plaça',
      caption: 'Reurbanització d’una plaça',
      before: placaAbans,
      after: placaDespres,
      beforeAlt: 'Plaça en obres, amb el paviment aixecat i runa',
      afterAlt: 'La plaça acabada, amb paviment nou, fanals i jardineres',
    },
    {
      id: 'cuina',
      tab: 'Cuina',
      caption: 'Reforma d’una cuina',
      before: cuinaAbans,
      after: cuinaDespres,
      beforeAlt: 'Cuina antiga buida, amb rajola estampada i el taulell desmuntat',
      afterAlt: 'Cuina reformada amb mobles blancs, taulell fosc i electrodomèstics integrats',
    },
    {
      id: 'piscina',
      tab: 'Piscina',
      caption: 'Construcció d’una piscina',
      before: piscinaAbans,
      after: piscinaDespres,
      beforeAlt: 'Vas de piscina en construcció, amb parets de maó i una escala de mà',
      afterAlt: 'Piscina acabada, amb gresite blau i paviment gris',
    },
  ],
};

export type WorkCategory = 'exteriors' | 'interiors' | 'cuines' | 'banys';
export type Work = { src: StaticImageData; alt: string; category: WorkCategory };

export const works: { kicker: string; title: string; lead: string; filters: { id: WorkCategory | 'totes'; label: string }[]; items: Work[] } = {
  kicker: 'Obres',
  title: 'Fet per nosaltres.',
  lead: 'Una tria de la galeria. Les fotos són de les nostres obres.',
  filters: [
    { id: 'totes', label: 'Totes' },
    { id: 'exteriors', label: 'Façanes i exteriors' },
    { id: 'interiors', label: 'Interiors' },
    { id: 'cuines', label: 'Cuines' },
    { id: 'banys', label: 'Banys' },
  ],
  items: [
    { src: facanaB, category: 'exteriors', alt: 'Casa amb porxos d’arc de pedra, baranes de vidre i piscina amb terrassa de fusta' },
    { src: interiorA, category: 'interiors', alt: 'Escala amb barana de vidre al costat d’un mur de pedra vista il·luminat' },
    { src: cuinaB, category: 'cuines', alt: 'Cuina oberta amb illa, taulell fosc i campana suspesa' },
    { src: masiaArc, category: 'exteriors', alt: 'Masia de pedra rehabilitada amb una gran obertura d’arc envidrada' },
    { src: banyB, category: 'banys', alt: 'Bany amb moble suspès de pedra, lavabo sobre taulell i finestra als pins' },
    { src: interiorC, category: 'interiors', alt: 'Sala d’estar amb sostre de bigues de fusta, llar de foc i parquet' },
    { src: facanaA, category: 'exteriors', alt: 'Casa moderna de volums blancs amb lames a la façana, entre pins' },
    { src: cuinaA, category: 'cuines', alt: 'Cuina blanca amb nevera americana i sortida a una terrassa amb vistes' },
    { src: banyA, category: 'banys', alt: 'Bany amb taulell de fusta retroil·luminat i mirall de paret a paret' },
    { src: interiorB, category: 'interiors', alt: 'Sala d’estar blanca de doble espai amb llar de foc encastada' },
    { src: facanaC, category: 'exteriors', alt: 'Casa de dues plantes amb sòcol de pedra, vista des del carrer' },
    { src: banyC, category: 'banys', alt: 'Bany amb lavabo rectangular, mirall amb focus i dutxa de vidre' },
  ],
};

export const showroom = {
  kicker: 'L’exposició',
  title: 'Vine a veure‑ho i a tocar‑ho.',
  text: 'Des de 2010 tenim exposició i showroom a Torroella de Montgrí. Hi pots veure, tocar i triar els materials que formaran part de casa teva abans de decidir res.',
  image: { src: exposicio, alt: 'Façana de vidre de l’exposició de Calvet Sala Construccions, amb el rètol del showroom' },
  directions: 'Com arribar-hi',
} as const;

export const company = {
  kicker: 'Empresa',
  title: 'Una família de constructors.',
  paragraphs: [
    'Calvet Sala és l’evolució d’un negoci familiar de diverses generacions de contractistes d’obres. Avui el dirigeixen els germans Jordi i Xavier Calvet Sala, amb l’ofici heretat i les tècniques que han anat incorporant pel camí.',
    'L’equip és el més important de la casa: gent amb molts anys d’experiència que es continua formant en les tècniques noves del sector.',
  ],
  credentialsTitle: 'Acreditacions',
  credentials: [
    { code: 'RELI', name: 'Registre Electrònic d’Empreses Licitadores' },
    { code: 'REA', name: 'Registre d’Empreses Acreditades del sector de la construcció de Catalunya' },
    { code: 'Obra pública', name: 'Classificació oficial al registre d’empreses classificades' },
  ],
} as const;

export const faq = {
  kicker: 'Preguntes',
  title: 'El que ens pregunten abans de començar.',
  items: [
    {
      q: 'Sabré què costa abans de començar?',
      a: 'Sí. Treballem a partir d’un pressupost totalment detallat, precisament perquè t’estalviïs maldecaps i sorpreses durant l’obra.',
    },
    {
      q: 'Qui coordina els industrials?',
      a: 'Nosaltres. En una reforma integral fem i coordinem tots els treballs: paleta, instal·lacions de llum, aigua, climatització i calefacció, fusteria interior i exterior d’alumini i PVC, i pintura.',
    },
    {
      q: 'Us podeu encarregar també del projecte?',
      a: 'Sí. Ens hi podem implicar des de la realització del projecte de reforma fins a l’acabat total, claus en mà.',
    },
    {
      q: 'Puc veure els materials abans de triar-los?',
      a: "Sí. A l'exposició de la Ctra. de l'Estartit, 147, a Torroella de Montgrí, pots veure i tocar els materials abans de decidir.",
    },
    {
      q: 'Feu també reparacions petites?',
      a: 'Sí. Tenim servei de reparacions i manteniment de la llar: paleta, instal·lacions, fusteria i pintura.',
    },
    {
      q: 'Treballeu per a comunitats i administradors de finques?',
      a: 'Sí. Oferim reparació i manteniment a comunitats de propietaris i administradors de finques.',
    },
    {
      q: 'On treballeu?',
      a: 'Principalment a la Costa Brava i a la província de Girona.',
    },
  ],
} as const;

export const quote = {
  kicker: 'Pressupost',
  title: 'Explica’ns l’obra en quatre passos.',
  lead: 'Sense compromís. Com més concret siguis, més ajustada serà la primera resposta.',
} as const;
