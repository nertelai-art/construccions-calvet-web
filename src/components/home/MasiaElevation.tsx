import styles from './MasiaElevation.module.css';

// Alçat de la masia de l'escena 3D (9,00 × 7,30 m), a escala 1 m = 44 px. És una il·lustració,
// no el plànol de cap obra real. Cada traç porta `pathLength={1}` perquè el CSS el pugui dibuixar.

const WALLS = [
  'M16 372H544', // terreny
  'M82 372V139L280 51L478 139V372', // murs i testera
  'M56 139.5L280 40L504 139.5', // coberta
  'M56 139.5L60 149L82 139',
  'M504 139.5L500 149L478 139',
  'M387 58h32v-5h-32z', // barret de la xemeneia
  'M392 89.7V58M414 58V99.5',
];

const OPENINGS = [
  'M245 372V304A35 35 0 0 1 315 304V372', // portal
  'M232 372V304A48 48 0 0 1 328 304V372', // dovelles
  'M310.3 286.5L321.6 280M297.5 273.7L304 262.4M280 269V256M262.5 273.7L256 262.4M249.7 286.5L238.4 280',
  'M280 269V372',
  'M142.5 280h37v44h-37zM161 280v44M138 326h46', // finestres de planta baixa
  'M380.5 280h37v44h-37zM399 280v44M376 326h46',
  'M142.5 163h37v53h-37zM161 163v53M142.5 186h37M138 218h46', // finestres del pis
  'M380.5 163h37v53h-37zM399 163v53M380.5 186h37M376 218h46',
  'M261.5 163h37v86h-37zM280 163v86M261.5 190h37', // balconera
  'M250 249h60M250 231h60M250 231v18M310 231v18M262 231v18M274 231v18M286 231v18M298 231v18',
  'M293 106a13 13 0 1 1-26 0a13 13 0 0 1 26 0z', // òcul
];

const GROUND = [
  'M82 249H478', // forjat
  'M40 372l-9 11M70 372l-9 11M100 372l-9 11M130 372l-9 11M160 372l-9 11M190 372l-9 11M220 372l-9 11M340 372l-9 11M370 372l-9 11M400 372l-9 11M430 372l-9 11M460 372l-9 11M490 372l-9 11M520 372l-9 11',
  'M34 372V350M34 352C22 330 26 268 34 236C42 268 46 330 34 352Z', // xiprers
  'M57 372V358M57 359C49 343 52 300 57 280C62 300 65 343 57 359Z',
];

const DIMENSIONS = [
  'M82 404H478M82 396v16M478 396v16',
  'M506 372V139M499 372h14M499 249h14M499 139h14',
  'M536 372V51M529 372h14M529 51h14',
  'M290 51H529',
];

export function MasiaElevation({ label, animated = true, className }: { label?: string; animated?: boolean; className?: string }) {
  let index = 0;
  const draw = (paths: string[], tone: string) =>
    paths.map((d) => (
      <path key={d} d={d} pathLength={1} className={`${styles.stroke} ${tone}`} style={{ '--i': index++ } as React.CSSProperties} />
    ));

  return (
    <svg
      viewBox="0 0 560 440"
      className={`${styles.drawing} ${className ?? ''}`}
      data-animated={animated || undefined}
      role="img"
      aria-label="Alçat a línia de la façana d'una masia amb portal d'arc, cinc finestres i coberta a dues aigües"
    >
      {draw(GROUND, styles.light ?? '')}
      {draw(WALLS, styles.heavy ?? '')}
      {draw(OPENINGS, '')}
      {draw(DIMENSIONS, styles.dimension ?? '')}
      <g className={styles.notes} aria-hidden="true">
        <text x="280" y="398" textAnchor="middle">
          9,00
        </text>
        <text x="500" y="314" textAnchor="middle" transform="rotate(-90 500 314)">
          2,80
        </text>
        <text x="500" y="198" textAnchor="middle" transform="rotate(-90 500 198)">
          2,50
        </text>
        <text x="530" y="214" textAnchor="middle" transform="rotate(-90 530 214)">
          7,30
        </text>
        {label && (
          <text x="16" y="432" className={styles.caption}>
            {label}
          </text>
        )}
      </g>
    </svg>
  );
}
