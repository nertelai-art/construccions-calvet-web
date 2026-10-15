# Calvet Sala Construccions — web

Web de **Calvet Sala Construccions** (Construccions i Reformes Calvet Sala SL), constructors de
Torroella de Montgrí. Substitueix el web antic, construccions-calvet.com (ASP.NET).
Afina les regles de casa de `~/.claude/CLAUDE.md`; el que no surt aquí, ve d'allà.

## Què és

Una portada llarga amb **una sola acció**: demanar pressupost. Next.js 16 (App Router), React 19,
TypeScript, CSS Modules. Sense Tailwind i sense llibreria d'animació: `three` només per a l'escena de
la masia.

```bash
pnpm dev          # next dev --webpack (el SWC natiu està bloquejat en aquesta màquina)
pnpm check        # typecheck + lint + tests
pnpm build:local  # build de producció amb webpack; a CI és `pnpm build`
```

Previsualització: `.claude/launch.json` (`calvet-dev`, `calvet-prod`).

## Branques i desplegament

- `developer` és la branca d'integració i la branca per defecte. Les branques de feina en surten i hi
  tornen per PR, amb merge commit.
- `main` és producció. **Hi arriba només quan l'usuari ho diu, cada vegada**, per PR des de
  `developer`. Es va crear el 13-10-2026 des de `developer`, a mà, perquè no es pot obrir una PR cap a
  una branca que no existeix; no s'hi torna a pujar res a mà.
- Vercel: projecte `construccions-calvet-web` (equip `nertelai-7298s-projects`), connectat al
  repositori, amb `main` com a branca de producció. Cada commit a `main` desplega a producció.
- **Producció és pública**: https://construccions-calvet-web.vercel.app s'obre sense sessió de Vercel.
  Encara no hi ha domini propi. Quan hi arribi el kit de demo, només amb enllaç personal (vegeu
  «Demo per a leads»).
- **Les previsualitzacions surten de fer push a una branca**, mai de `vercel deploy`, i demanen sessió
  de Vercel (o un enllaç compartit).
- `vercel.json` porta una porta: un build de producció que no vingui de `main` es cancel·la sol.
  Només actua en desplegaments disparats per Git, no en els de la CLI.
- **El primer desplegament d'un projecte nou és de producció encara que es demani previsualització.**
  Va passar aquí el 13-10-2026 amb `vercel deploy --target preview`; va fallar a la instal·lació i no
  es va publicar res, però va ser per sort. En un projecte nou, el primer desplegament ha de venir
  d'un push a una branca que no sigui la de producció.
- Vercel no deixa posar com a branca de producció una branca que no existeix: en un projecte nou,
  fins que no es crea `main`, la branca de producció és la per defecte.
- Node 22 a tot arreu: `engines` el fixa per a Vercel, i `@types/node` hi va a joc.

## Demo per a leads (`src/demo-kit`)

- **El web és una demo per a un lead**: un cop desplegat, només s'hi entra amb un enllaç personal, i
  qui no en porta veu la pàgina de bloqueig de Nertel. Els enllaços es fan amb
  `pnpm demo:link "Nom del lead" --days 15`, que llegeix el secret de `.env.local` (el mateix que a
  Vercel; no es puja mai).
- El codi ve del kit comú de les demos (`../nertel-demo-kit`, skill `demo-leads`). **No s'edita
  aquí**: es canvia al kit i es torna a copiar, perquè totes les demos siguin iguals.
- Vercel: `DEMO_SECRET` i `DEMO_SITE` (la porta), i `NEXT_PUBLIC_POSTHOG_KEY` i
  `NEXT_PUBLIC_POSTHOG_HOST` (el seguiment de les visites dels leads amb PostHog). Sense
  `DEMO_SECRET` el web és obert.
- **Quan el web passi a ser el del client** es treu el kit: `src/proxy.ts`, `DemoTracker` i
  `DemoBadge` del layout arrel, la carpeta `src/demo-kit`, `posthog-js`, l'script `demo:link` i les
  variables. I es revisa l'avís de galetes.

## Com està muntat

- `src/content/` — **tot el text i les dades del negoci**. `business.ts` (adreça, telèfon, horari,
  dades registrals) i `home.ts` (textos de la portada i fotos). Cap text de client dins dels components.
- `src/components/home/` — una secció per fitxer, amb el seu `.module.css`.
- `src/components/masia/` — l'escena 3D guiada pel scroll («Anatomia d'una obra»):
  - `masia-phases.ts` (+ prova): la coreografia, pura. És l'única font de veritat dels temps;
    la llegeixen l'escena i l'HTML.
  - `masia-geometry.ts`, `masia-textures.ts`: mides, peces i textures per codi.
  - `MasiaScene.tsx`: el `<Canvas>`. **L'únic lloc on entra three.js** (regla d'ESLint).
  - `MasiaShowcase.tsx`: la secció HTML, sticky, que carrega l'escena en diferit.
- `src/components/quote/` — pressupost guiat. `quote-model.ts` (+ prova) valida i fa el resum.
- `src/lib/` — `scroll-scene.ts` i `random.ts`, copiats de la skill `scroll-3d-scenes`.

## Regles pròpies

- **El contingut és real o no hi és.** Tot el que afirma la portada surt del web antic del client.
  Res de xifres, anys d'ofici, noms de pobles ni ressenyes inventats. El que falta va a la llista de sota.
- **Les fotos del client fan 800 px com a màxim.** Van sempre emmarcades, mai a sang. No serveixen
  per a `scroll-video` ni per a capçaleres a pantalla completa fins que arribin els originals.
- **La masia és una il·lustració**, no cap obra real: no se li posa nom de lloc ni de client.
- L'escena segueix les regles de `scroll-3d-scenes`: `frameloop="demand"`, progrés en una ref, zero
  objectes nous per fotograma, res de `setState` al scroll. Els materials que canvien es toquen a
  través de la malla (`mesh.material`), que és el que accepta `react-hooks/immutability`.
- Sense mapa d'entorn: l'escena no té reflexos i així s'estalvia el PMREM.
- Colors i tipografies són variables a `src/app/globals.css`. El taronja `--teula` (#c2521f) és el de
  la marca del client.

## Verificació visual

`node scripts/shoot.mjs <url> <prefix> <ample>x<alt> <pas>…` fa captures amb Chrome sense finestra
(CDP, sense dependències) i llista errors de consola i peticions fallides. Serveix quan el panell del
navegador està amagat i `requestAnimationFrame` queda congelat. Passos: `top`, `p:0.55` (progrés dins
la masia), `id:serveis`, `click:<selector>`, `drag:<selector>|0.5|0.2`, `key:Escape`, `type:text`,
`js:<expressió>`, `shot:<nom>`. Variables: `REDUCED=1` (moviment reduït), `NOWEBGL=1` (sense WebGL).

## Versions

TypeScript 6 i ESLint 9 són a posta: `typescript-eslint` 8 no accepta TypeScript 7 i
`eslint-plugin-react` 7 no arriba a ESLint 10 (mirat el 13-10-2026). Quan ho facin, es puja en una
branca pròpia. `@types/node` va a 22 perquè és el Node que s'executa.

`three` 0.186 avisa a la consola que `THREE.Clock` està obsolet: l'avís ve de dins de
`@react-three/fiber` 9.8 i no es pot treure des d'aquí.

## Pendent de confirmar amb el client

- **Horari** de l'exposició (dl–dv 9–13 i 16–19): ve de directoris i de Google, no del seu web.
- **Peus de foto** de l'abans i després i de la galeria: descriuen el que es veu; falten poble i any.
- **Textos**: són un esborrany escrit a partir del seu web. Els passos de l'anatomia descriuen un
  procés raonable però no validat per ells.
- **Logotip**: el símbol (`src/components/ui/Logo.tsx` i `src/app/icon.svg`) està redibuixat a partir
  d'un JPG de 180 × 130 px del web antic, i el nom va compost amb la tipografia del web, no amb la
  del seu rètol. Quan arribi el vector oficial, el substitueix.
- **Material**: fotos originals, foto de l'equip, llista d'obres per municipi.

## Pendent abans de donar-lo per publicat

El web ja és a producció i és públic a l'adreça de Vercel, però encara no s'ha ensenyat ni validat.

- **Indexació**: no porta `noindex`. Decidir si se n'hi posa fins que el client validi els textos.
- **Domini propi** i, amb ell, `NEXT_PUBLIC_SITE_URL`. Sense la variable, l'enllaç canònic és el
  domini de producció de Vercel (`src/lib/site-url.ts`).
- **Enviament del pressupost**: no hi ha proveïdor. Ara la sol·licitud surt per `mailto:`. Quan n'hi
  hagi, va darrere d'una frontera pròpia i s'hi afegeix el consentiment de privacitat.
- Avís legal, privacitat i galetes (el web antic en té; cal revisar-los, no copiar-los).
- `og:image`, `sitemap.xml` i `robots.txt`.
- Castellà, anglès i francès (el web antic els té). Pàgines de servei i galeria completa.
- Lighthouse i un iPhone de veritat: l'escena només s'ha mirat en Chrome d'escriptori i a mida de mòbil.
