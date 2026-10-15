import type { NextFetchEvent, NextRequest } from 'next/server';
import { demoGate } from '@/demo-kit/gate';

// La web és una demo per a un lead: només s'hi entra amb un enllaç personal (vegeu `src/demo-kit`).
export function proxy(request: NextRequest, event: NextFetchEvent) {
  return demoGate(request, event);
}

// Literal: Next el llegeix sense executar el fitxer. És el `demoMatcher` del kit.
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|icon\\.svg|apple-icon|robots\\.txt|opengraph-image|twitter-image).*)'],
};
