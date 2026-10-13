import type { ReactNode } from 'react';

/** Capçalera de secció: número de full, rètol i titular. */
export function SectionHead({ index, kicker, title, id, children }: { index: string; kicker: string; title: string; id: string; children?: ReactNode }) {
  return (
    <div className="sectionHead" data-reveal>
      <p className="kicker">
        <b>{index}</b> {kicker}
      </p>
      <h2 id={id} className="display">
        {title}
      </h2>
      {children}
    </div>
  );
}
