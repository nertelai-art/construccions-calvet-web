import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // three.js pesa ~250 kB: només hi pot entrar l'escena, que es carrega en diferit.
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/components/masia/MasiaScene.tsx', 'src/components/masia/masia-textures.ts', 'src/components/masia/masia-geometry.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [{ name: 'three', message: "three.js només s'importa des de l'escena (src/components/masia)." }],
          patterns: [{ group: ['@react-three/*'], message: "three.js només s'importa des de l'escena (src/components/masia)." }],
        },
      ],
    },
  },
  {
    // La lògica pura (fases, model del pressupost, atzar) no depèn del framework.
    files: ['src/lib/**', 'src/components/masia/masia-phases.ts', 'src/components/quote/quote-model.ts'],
    ignores: ['src/lib/scroll-scene.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [{ group: ['react', 'react-dom', 'next', 'next/*', 'three', '@react-three/*'], message: 'Aquest mòdul ha de ser TypeScript pur.' }] },
      ],
    },
  },
  globalIgnores(['.next/**', 'out/**', 'next-env.d.ts', 'coverage/**']),
]);
