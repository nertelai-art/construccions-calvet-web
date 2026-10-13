import Link from 'next/link';
import type { ComponentProps } from 'react';

/**
 * Enllaç a una secció de la portada (`#serveis`). A la portada és una àncora normal; des de
 * qualsevol altra pàgina (la 404) porta a la portada i a la secció.
 */
export function SectionLink({ href, home, ...props }: Omit<ComponentProps<'a'>, 'href'> & { href: `#${string}`; home: boolean }) {
  return home ? <a href={href} {...props} /> : <Link href={`/${href}`} {...props} />;
}
