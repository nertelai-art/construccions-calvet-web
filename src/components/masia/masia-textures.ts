import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three';
import { seededRandom } from '@/lib/random';

// Textures dibuixades en un canvas: res a descarregar, i sempre iguals (atzar amb llavor).

function canvasTexture(size: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  try {
    if (ctx) draw(ctx);
  } catch (error) {
    console.error('[masia] no s’ha pogut dibuixar una textura', error);
  }
  texture.needsUpdate = true;
  return texture;
}

/** Metres que representa la textura de pedra: els murs la repeteixen a aquesta escala. */
export const STONE_METRES = 3.2;

const STONE_TONES = [
  [214, 199, 172],
  [201, 184, 155],
  [224, 211, 186],
  [190, 174, 148],
  [231, 220, 198],
  [208, 186, 150],
] as const;

/** Paredat de pedra irregular amb morter de calç, que encaixa en repetir-se. */
export function stoneTexture() {
  const size = 512;
  const texture = canvasTexture(size, (ctx) => {
    const random = seededRandom(1147);
    ctx.fillStyle = '#b9aa8f';
    ctx.fillRect(0, 0, size, size);

    const stone = (x: number, y: number, w: number, h: number) => {
      const tone = STONE_TONES[Math.floor(random() * STONE_TONES.length)]!;
      const shade = 0.88 + random() * 0.2;
      ctx.fillStyle = `rgb(${Math.round(tone[0] * shade)}, ${Math.round(tone[1] * shade)}, ${Math.round(tone[2] * shade)})`;
      const j = () => (random() - 0.5) * 7;
      const r = Math.min(w, h) * 0.3;
      ctx.beginPath();
      ctx.moveTo(x + r + j(), y + j());
      ctx.lineTo(x + w - r + j(), y + j());
      ctx.quadraticCurveTo(x + w, y, x + w + j(), y + r + j());
      ctx.lineTo(x + w + j(), y + h - r + j());
      ctx.quadraticCurveTo(x + w, y + h, x + w - r + j(), y + h + j());
      ctx.lineTo(x + r + j(), y + h + j());
      ctx.quadraticCurveTo(x, y + h, x + j(), y + h - r + j());
      ctx.lineTo(x + j(), y + r + j());
      ctx.quadraticCurveTo(x, y, x + r + j(), y + j());
      ctx.fill();
      ctx.strokeStyle = 'rgba(92, 76, 56, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    // Filades d'alçada desigual, com en un paredat de debò; la suma fa exactament l'alçada del canvas.
    const heights: number[] = [];
    let total = 0;
    while (total < size - 30) {
      const h = 26 + random() * 30;
      heights.push(h);
      total += h;
    }
    const stretch = size / total;
    let y = 0;
    for (const rawHeight of heights) {
      const rowHeight = rawHeight * stretch;
      let x = -random() * 60;
      while (x < size) {
        const w = rowHeight * (0.9 + random() * 1.5);
        stone(x + 3, y + 3, w - 6, rowHeight - 6);
        // La pedra que surt per la dreta es repeteix a l'esquerra: la textura no té costura.
        if (x + w > size) stone(x + 3 - size, y + 3, w - 6, rowHeight - 6);
        x += w;
      }
      y += rowHeight;
    }
  });
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.set(1 / STONE_METRES, 1 / STONE_METRES);
  texture.anisotropy = 4;
  return texture;
}

/** Màscara rodona per al terra: s'esvaeix cap a fora i no deixa línia d'horitzó. */
export function radialFade() {
  const size = 256;
  return canvasTexture(size, (ctx) => {
    const gradient = ctx.createRadialGradient(size / 2, size / 2, size * 0.2, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, '#fff');
    gradient.addColorStop(0.62, '#bbb');
    gradient.addColorStop(1, '#000');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  });
}
