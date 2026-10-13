import { BoxGeometry, CatmullRomCurve3, CylinderGeometry, ExtrudeGeometry, Matrix4, Path, Quaternion, Shape, TubeGeometry, Vector3 } from 'three';
import { seededRandom } from '@/lib/random';

// Mides i peces de la masia (unitats = metres). És una casa inventada per explicar el procés,
// amb les proporcions d'una masia de l'Empordà: testera a la façana i coberta a dues aigües.

export const W = 9; // amplada de la façana (eix X)
export const D = 7.2; // fondària (eix Z)
export const T = 0.5; // gruix dels murs de pedra
export const H1 = 2.8; // planta baixa
export const H2 = 2.5; // pis, fins al ràfec
export const RISE = 2; // del ràfec al carener
export const EAVES = H1 + H2;
export const RIDGE = EAVES + RISE;
export const OVERHANG = 0.45;
export const PITCH = Math.atan2(RISE, W / 2);
export const SLOPE_LEN = Math.hypot(W / 2, RISE) + OVERHANG;
export const ROOF_D = D + 0.7;

export type Layer = 0 | 1 | 2 | 3 | 4;

// ── Murs ──

export type Opening = { u: number; v: number; w: number; h: number };
export type Wall = { id: string; layer: 1 | 3; rotY: number; offset: number; length: number; height: number; openings: Opening[]; gable?: boolean; door?: boolean; oculus?: boolean };

const win = (u: number, low = false): Opening => ({ u, v: low ? 1.1 : 0.75, w: 0.86, h: low ? 1 : 1.2 });
export const DOOR = { width: 1.6, spring: 1.55 };
export const OCULUS = { v: H2 + 0.72, radius: 0.3 };

const SIDE = D - 2 * T;
export const WALLS: Wall[] = [
  { id: 'front-1', layer: 1, rotY: 0, offset: D / 2, length: W, height: H1, door: true, openings: [win(-2.7, true), win(2.7, true)] },
  { id: 'front-3', layer: 3, rotY: 0, offset: D / 2, length: W, height: H2, gable: true, oculus: true, openings: [win(-2.7), win(0), win(2.7)] },
  { id: 'back-1', layer: 1, rotY: Math.PI, offset: D / 2, length: W, height: H1, openings: [win(-2.7, true), win(0, true), win(2.7, true)] },
  { id: 'back-3', layer: 3, rotY: Math.PI, offset: D / 2, length: W, height: H2, gable: true, openings: [win(-2.2), win(2.2)] },
  { id: 'right-1', layer: 1, rotY: Math.PI / 2, offset: W / 2, length: SIDE, height: H1, openings: [win(-1.6, true), win(1.6, true)] },
  { id: 'right-3', layer: 3, rotY: Math.PI / 2, offset: W / 2, length: SIDE, height: H2, openings: [win(-1.6), win(1.6)] },
  { id: 'left-1', layer: 1, rotY: -Math.PI / 2, offset: W / 2, length: SIDE, height: H1, openings: [win(-1.6, true), win(1.6, true)] },
  { id: 'left-3', layer: 3, rotY: -Math.PI / 2, offset: W / 2, length: SIDE, height: H2, openings: [win(-1.6), win(1.6)] },
];

export const layerBase = (layer: Layer) => (layer >= 3 ? H1 : 0);

function rectHole({ u, v, w, h }: Opening) {
  const hole = new Path();
  hole.moveTo(u - w / 2, v);
  hole.lineTo(u + w / 2, v);
  hole.lineTo(u + w / 2, v + h);
  hole.lineTo(u - w / 2, v + h);
  hole.closePath();
  return hole;
}

/** Contorn del portal d'arc, obert per baix. Serveix per al forat del mur i per a la porta. */
function doorOutline(target: Shape | Path, inset = 0) {
  const half = DOOR.width / 2 - inset;
  target.lineTo(-half, 0);
  target.lineTo(-half, DOOR.spring);
  target.absarc(0, DOOR.spring, half, Math.PI, 0, true);
  target.lineTo(half, 0);
}

/** Mur amb les obertures foradades. La cara de fora queda a z = 0 i el gruix cap a −z. */
export function wallGeometry(wall: Wall) {
  const half = wall.length / 2;
  const shape = new Shape();
  shape.moveTo(-half, 0);
  if (wall.door) doorOutline(shape);
  shape.lineTo(half, 0);
  shape.lineTo(half, wall.height);
  if (wall.gable) shape.lineTo(0, wall.height + RISE);
  shape.lineTo(-half, wall.height);
  shape.closePath();
  for (const opening of wall.openings) shape.holes.push(rectHole(opening));
  if (wall.oculus) {
    const hole = new Path();
    hole.absarc(0, OCULUS.v, OCULUS.radius, 0, Math.PI * 2, false);
    shape.holes.push(hole);
  }
  const geometry = new ExtrudeGeometry(shape, { depth: T, bevelEnabled: false, curveSegments: 14 });
  geometry.translate(0, 0, -T);
  return geometry;
}

export function doorGeometry() {
  const shape = new Shape();
  shape.moveTo(-(DOOR.width / 2 - 0.04), 0);
  doorOutline(shape, 0.04);
  shape.closePath();
  const geometry = new ExtrudeGeometry(shape, { depth: 0.09, bevelEnabled: false, curveSegments: 14 });
  geometry.translate(0, 0, -0.045);
  return geometry;
}

/** Marc d'una finestra de dues fulles (0,86 × 1,2 m), centrat a l'origen. */
export function windowFrameGeometry() {
  const w = 0.86;
  const h = 1.2;
  const bar = 0.07;
  const shape = new Shape();
  shape.moveTo(-w / 2, -h / 2);
  shape.lineTo(w / 2, -h / 2);
  shape.lineTo(w / 2, h / 2);
  shape.lineTo(-w / 2, h / 2);
  shape.closePath();
  const paneW = w / 2 - bar * 1.5;
  for (const side of [-1, 1]) {
    const cx = side * (paneW / 2 + bar / 2);
    shape.holes.push(rectHole({ u: cx, v: -h / 2 + bar, w: paneW, h: h - bar * 2 }));
  }
  const geometry = new ExtrudeGeometry(shape, { depth: 0.08, bevelEnabled: false });
  geometry.translate(0, 0, -0.04);
  return geometry;
}

/** Marc pla amb un forat rectangular (fonaments, coronament de la piscina), ajagut a terra. */
export function frameGeometry(outerX: number, outerZ: number, innerX: number, innerZ: number, height: number) {
  const shape = new Shape();
  shape.moveTo(-outerX / 2, -outerZ / 2);
  shape.lineTo(outerX / 2, -outerZ / 2);
  shape.lineTo(outerX / 2, outerZ / 2);
  shape.lineTo(-outerX / 2, outerZ / 2);
  shape.closePath();
  shape.holes.push(rectHole({ u: 0, v: -innerZ / 2, w: innerX, h: innerZ }));
  const geometry = new ExtrudeGeometry(shape, { depth: height, bevelEnabled: false });
  geometry.rotateX(-Math.PI / 2);
  return geometry;
}

// ── Coberta ──

/** Sistema del faldó: X pendent avall des del carener, Y normal a la coberta, Z al llarg del carener. */
export function slopeMatrix(side: 1 | -1) {
  return new Matrix4()
    .makeRotationY(side === 1 ? 0 : Math.PI)
    .multiply(new Matrix4().makeTranslation(0, RIDGE, 0))
    .multiply(new Matrix4().makeRotationZ(-PITCH));
}

/** Teula àrab: mig tronc de con buit, amb l'eix al llarg de X i el llom cap a +Y. */
export function tileGeometry(length: number, radius: number) {
  // L'extrem de +X (el de baix del faldó, el que queda a la vista) és el més ample.
  const geometry = new CylinderGeometry(radius, radius * 0.84, length, 7, 1, true, -Math.PI / 2, Math.PI);
  // (x, y, z) → (y, z, x): l'eix del cilindre passa a X i el llom, que mirava a +Z, a +Y.
  geometry.applyMatrix4(new Matrix4().makeBasis(new Vector3(0, 0, 1), new Vector3(1, 0, 0), new Vector3(0, 1, 0)));
  return geometry;
}

export type Pose = { position: Vector3; quaternion: Quaternion; normal: Vector3 };

function poseOf(matrix: Matrix4): Pose {
  const position = new Vector3();
  const quaternion = new Quaternion();
  matrix.decompose(position, quaternion, new Vector3());
  return { position, quaternion, normal: new Vector3(0, 1, 0).applyQuaternion(quaternion) };
}

export const TILE_COLS = 21;
export const TILE_ROWS = 10;
export const TILE_STEP_Z = ROOF_D / TILE_COLS;
export const TILE_STEP_X = SLOPE_LEN / TILE_ROWS;

export type Tile = {
  rest: Pose;
  /** La mateixa teula, torta i moguda: com és abans de l'obra. */
  worn: Pose;
  missing: boolean;
  row: number;
  /** 0–1: ordre de sortida de la teula vella i d'arribada de la nova. */
  leave: number;
  arrive: number;
  drift: Vector3;
  axis: Vector3;
  spin: number;
  wobble: number;
  tone: number;
  moss: number;
};

export function buildTiles(): Tile[] {
  const random = seededRandom(2010);
  const tiles: Tile[] = [];
  for (const side of [1, -1] as const) {
    const slope = slopeMatrix(side);
    for (let row = 0; row < TILE_ROWS; row++) {
      for (let col = 0; col < TILE_COLS; col++) {
        const x = (row + 0.5) * TILE_STEP_X;
        const z = -ROOF_D / 2 + (col + 0.5) * TILE_STEP_Z;
        const local = new Matrix4().makeTranslation(x, 0.27, z).multiply(new Matrix4().makeRotationZ(0.075));
        const crooked = new Matrix4()
          .makeTranslation(x + (random() - 0.5) * 0.12, 0.25 + random() * 0.05, z + (random() - 0.5) * 0.07)
          .multiply(new Matrix4().makeRotationY((random() - 0.5) * 0.3))
          .multiply(new Matrix4().makeRotationZ(0.075 + (random() - 0.5) * 0.16));
        // Les velles marxen de dalt a baix; les noves es col·loquen del ràfec cap al carener, com a l'obra.
        const fromRidge = row / (TILE_ROWS - 1);
        tiles.push({
          rest: poseOf(slope.clone().multiply(local)),
          worn: poseOf(slope.clone().multiply(crooked)),
          missing: random() < 0.09,
          row,
          leave: fromRidge * 0.55 + random() * 0.25,
          arrive: (1 - fromRidge) * 0.62 + random() * 0.14,
          drift: new Vector3(side * (2 + random() * 5), 0, (random() - 0.5) * 7),
          axis: new Vector3(random() - 0.5, random() - 0.5, random() - 0.5).normalize(),
          spin: 2 + random() * 6,
          wobble: (random() - 0.5) * 0.9,
          tone: random(),
          moss: random(),
        });
      }
    }
  }
  return tiles;
}

export const RAFTERS_PER_SLOPE = 11;
export type Rafter = { rest: Pose; order: number; drift: Vector3; axis: Vector3; spin: number };

export function rafterGeometry() {
  return new BoxGeometry(SLOPE_LEN, 0.17, 0.13);
}

export function buildRafters(): Rafter[] {
  const random = seededRandom(77);
  const rafters: Rafter[] = [];
  for (const side of [1, -1] as const) {
    const slope = slopeMatrix(side);
    for (let index = 0; index < RAFTERS_PER_SLOPE; index++) {
      const z = -ROOF_D / 2 + 0.22 + (index / (RAFTERS_PER_SLOPE - 1)) * (ROOF_D - 0.44);
      rafters.push({
        rest: poseOf(slope.clone().multiply(new Matrix4().makeTranslation(SLOPE_LEN / 2, 0.085, z))),
        // De la façana cap al fons, alternant faldons.
        order: (RAFTERS_PER_SLOPE - 1 - index + (side === 1 ? 0 : 0.5)) / RAFTERS_PER_SLOPE,
        drift: new Vector3(side * (1.5 + random() * 3), 0, (random() - 0.5) * 3),
        axis: new Vector3(random() - 0.5, random() * 0.4, random() - 0.5).normalize(),
        spin: 1 + random() * 2.5,
      });
    }
  }
  return rafters;
}

export const RIDGE_CAPS = 13;

// ── Fusteria ──

export type WindowUnit = { rest: Pose; layer: 1 | 3; scaleY: number; order: number };

export function buildWindows(): WindowUnit[] {
  const units: WindowUnit[] = [];
  WALLS.forEach((wall, wallIndex) => {
    const wallMatrix = new Matrix4().makeRotationY(wall.rotY).multiply(new Matrix4().makeTranslation(0, layerBase(wall.layer), wall.offset));
    wall.openings.forEach((opening, index) => {
      const local = new Matrix4().makeTranslation(opening.u, opening.v + opening.h / 2, -T * 0.42);
      const rest = poseOf(wallMatrix.clone().multiply(local));
      // «normal» aquí és la direcció de fora del mur: per on entra la finestra.
      rest.normal.set(0, 0, 1).applyQuaternion(rest.quaternion);
      units.push({ rest, layer: wall.layer, scaleY: opening.h / 1.2, order: (wallIndex * 3 + index) / (WALLS.length * 3) });
    });
  });
  return units;
}

// ── Instal·lacions sobre el forjat ──

const SLAB_Y = H1 + 0.1;

function tube(points: [number, number, number][], radius: number, segments: number) {
  const curve = new CatmullRomCurve3(
    points.map(([x, y, z]) => new Vector3(x, SLAB_Y + radius + y, z)),
    false,
    'catmullrom',
    0.08,
  );
  return new TubeGeometry(curve, segments, radius, 6, false);
}

export const PIPE_RADIAL = 6;
export type Pipe = { geometry: TubeGeometry; segments: number; color: string; delay: number };

/** Terra radiant en serpentí, aigua i electricitat. Cada tub es dibuixa allargant-ne el tram pintat. */
export function buildPipes(): Pipe[] {
  const innerX = W / 2 - T - 0.35;
  const innerZ = D / 2 - T - 0.35;

  const serpentine: [number, number, number][] = [];
  const runs = 9;
  const left = -innerX;
  const right = 1.1;
  for (let run = 0; run < runs; run++) {
    const z = -innerZ + (run / (runs - 1)) * (innerZ * 2);
    const [a, b] = run % 2 === 0 ? [left, right] : [right, left];
    serpentine.push([a, 0, z], [b, 0, z]);
  }

  const water: [number, number, number][] = [
    [innerX, 0.9, -innerZ],
    [innerX, 0, -innerZ],
    [innerX, 0, -0.6],
    [2.2, 0, -0.6],
    [2.2, 0, 1.4],
    [2.2, 0.8, 1.4],
  ];

  const power: [number, number, number][] = [
    [1.7, 1.1, innerZ],
    [1.7, 0, innerZ],
    [innerX - 0.25, 0, innerZ],
    [innerX - 0.25, 0, -innerZ + 0.4],
    [1.7, 0, -innerZ + 0.4],
    [1.7, 1.1, -innerZ + 0.4],
  ];

  return [
    { geometry: tube(serpentine, 0.055, 520), segments: 520, color: '#d8552a', delay: 0 },
    { geometry: tube(water, 0.07, 160), segments: 160, color: '#2f86c2', delay: 0.25 },
    { geometry: tube(power, 0.05, 180), segments: 180, color: '#e2b23c', delay: 0.4 },
  ];
}

export const BEAMS = 8;

/** Punts on s'enganxen les etiquetes de l'anatomia: [x, y, z, capa]. */
export const LABEL_ANCHORS: readonly (readonly [number, number, number, Layer])[] = [
  [W / 2 + 0.3, 0.05, D / 2 + 0.3, 0],
  [W / 2, H1 * 0.55, D / 2, 1],
  [W / 2 - T, H1 - 0.05, D / 2 - T, 2],
  [W / 2 - T - 0.5, H1 + 0.18, -1.2, 2],
  [W / 2 + OVERHANG * 0.6, EAVES + 0.1, ROOF_D / 2, 4],
];
