// Coreografia de la masia, sense three.js: la llegeixen l'escena (què es mou) i l'HTML (quin pas
// és actiu, quan es fa fosc). Tot és funció pura del progrés del scroll, de 0 a 1.

export type Range = readonly [number, number];

/** Els sis passos que s'expliquen a l'esquerra. Es toquen sense forats. */
export const STEPS = [
  [0, 0.1], // l'estat actual
  [0.1, 0.27], // enderroc i sanejament
  [0.27, 0.42], // estructura
  [0.42, 0.66], // instal·lacions: la casa s'obre en capes
  [0.66, 0.86], // coberta i fusteria
  [0.86, 1], // claus en mà
] as const satisfies readonly Range[];

/** Moviments concrets dins dels passos. Se solapen una mica perquè no hi hagi estones mortes. */
export const BEATS = {
  tilesOff: [0.1, 0.215],
  raftersOff: [0.19, 0.265],
  raftersOn: [0.285, 0.41],
  explode: [0.42, 0.5],
  pipes: [0.485, 0.585],
  collapse: [0.6, 0.66],
  boards: [0.66, 0.72],
  joinery: [0.71, 0.835],
  tilesOn: [0.7, 0.83],
  ridge: [0.815, 0.86],
  clean: [0.86, 0.93],
  garden: [0.875, 0.965],
  dusk: [0.915, 1],
} as const satisfies Record<string, Range>;

/** Quant puja cada capa quan la casa és oberta: fonaments, murs baixos, forjat, murs alts, coberta. */
export const LAYER_LIFT = [0, 0.6, 2.5, 5.2, 7.6] as const;

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const segment = (p: number, [start, end]: Range) => clamp01((p - start) / (end - start));

export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOutBack = (t: number) => {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const c = 1.70158;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
};
export function easeOutBounce(t: number) {
  const n = 7.5625;
  const d = 2.75;
  if (t < 1 / d) return n * t * t;
  if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75;
  if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375;
  return n * (t -= 2.625 / d) * t + 0.984375;
}

/** Índex del pas actiu (0–5). */
export function stepAt(p: number) {
  const index = STEPS.findIndex(([, end]) => p < end);
  return index === -1 ? STEPS.length - 1 : index;
}

/** 0 = casa tancada, 1 = oberta del tot. Puja a `explode` i torna a baixar a `collapse`. */
export function explodeAt(p: number) {
  return easeInOut(segment(p, BEATS.explode)) * (1 - easeInOut(segment(p, BEATS.collapse)));
}

/** Les bigues velles i les noves són les mateixes peces: canvien de color mentre no n'hi ha cap a la vista. */
export const raftersAreNew = (p: number) => p >= (BEATS.raftersOff[1] + BEATS.raftersOn[0]) / 2;

/** 0 = migdia, 1 = capvespre amb els llums encesos. */
export const duskAt = (p: number) => easeInOut(segment(p, BEATS.dusk));

export type CameraPose = { azimuth: number; elevation: number; fit: number; targetY: number };

// [progrés, azimut, elevació, amplada que ha de cabre, alçada del punt de mira]
const CAMERA_KEYS: readonly (readonly [number, number, number, number, number])[] = [
  [0, 0.8, 0.3, 22.5, 3.5],
  [0.1, 0.72, 0.34, 22.5, 3.6],
  [0.27, 0.5, 0.44, 22.5, 3.9],
  [0.42, 0.62, 0.44, 22.5, 4],
  [0.5, 0.98, 0.56, 33, 7.3],
  [0.6, 1.12, 0.56, 33, 7.3],
  [0.66, 0.92, 0.42, 22.5, 4],
  [0.86, 0.66, 0.34, 23.5, 3.6],
  [1, 0.44, 0.2, 26, 3.3],
];

/** Posició de la càmera en cada moment: òrbita suau entre punts clau. */
export function cameraAt(p: number): CameraPose {
  const progress = clamp01(p);
  let index = 0;
  while (index < CAMERA_KEYS.length - 2 && progress > CAMERA_KEYS[index + 1]![0]) index++;
  const from = CAMERA_KEYS[index]!;
  const to = CAMERA_KEYS[index + 1]!;
  const t = easeInOut(segment(progress, [from[0], to[0]]));
  return {
    azimuth: lerp(from[1], to[1], t),
    elevation: lerp(from[2], to[2], t),
    fit: lerp(from[3], to[3], t),
    targetY: lerp(from[4], to[4], t),
  };
}
