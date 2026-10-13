/**
 * Símbol de Calvet Sala: la «C» que és un edifici amb sis finestres, i les inicials «cs».
 * Està redibuixat a partir de l'únic fitxer que hi ha (un JPG de 180 × 130 px del web antic) fins que
 * arribi el vector del client. La «c» pren el color del text: fosca sobre clar, blanca sobre fosc.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 549 424" className={className} aria-hidden="true">
      <path
        fill="var(--teula)"
        d="M95 0H285Q349 0 349 64V127H265V61Q265 47 251 47H99Q85 47 85 61V368Q85 382 99 382H251Q265 382 265 368V322H349V360Q349 424 285 424H95Q0 424 0 329V95Q0 0 95 0Z"
      />
      <g fill="var(--teula)">
        <circle cx="135" cy="109" r="27" />
        <circle cx="207" cy="109" r="27" />
        <circle cx="135" cy="212" r="27" />
        <circle cx="207" cy="212" r="27" />
        <circle cx="135" cy="315" r="27" />
        <circle cx="207" cy="315" r="27" />
      </g>
      <g fill="none" strokeWidth="28">
        <path stroke="currentColor" d="M414 191H318Q303 191 303 206V268Q303 283 318 283H414" />
        <path stroke="var(--teula)" d="M549 191H458Q443 191 443 206V222Q443 237 458 237H520Q535 237 535 252V268Q535 283 520 283H429" />
      </g>
    </svg>
  );
}
