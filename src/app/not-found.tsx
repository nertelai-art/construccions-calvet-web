import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/site/Footer';
import { Header } from '@/components/site/Header';
import { Arrow } from '@/components/ui/Arrow';

export const metadata: Metadata = { title: 'Pàgina no trobada' };

export default function NotFound() {
  return (
    <>
      <Header home={false} />
      <main id="contingut" className="container section" style={{ display: 'grid', gap: 22, justifyItems: 'start', minHeight: '60svh', alignContent: 'center' }}>
        <p className="kicker">
          <b>404</b> Pàgina no trobada
        </p>
        <h1 className="display">Aquesta paret no hi és.</h1>
        <p className="lead">L’adreça que has obert no existeix o ha canviat de lloc. Torna a la portada i hi trobaràs tot el que fem.</p>
        <Link className="btn btnPrimary" href="/">
          Torna a la portada
          <Arrow />
        </Link>
      </main>
      <Footer home={false} />
    </>
  );
}
