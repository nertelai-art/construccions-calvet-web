import { BEATS, STEPS, cameraAt, duskAt, explodeAt, raftersAreNew, segment, stepAt } from './masia-phases';

const samples = Array.from({ length: 401 }, (_, index) => index / 400);

describe('coreografia de la masia', () => {
  it('els passos cobreixen tot el recorregut sense forats ni solapaments', () => {
    expect(STEPS[0][0]).toBe(0);
    expect(STEPS.at(-1)![1]).toBe(1);
    for (let index = 1; index < STEPS.length; index++) expect(STEPS[index]![0]).toBe(STEPS[index - 1]![1]);
  });

  it('el pas actiu no retrocedeix mai en avançar', () => {
    let previous = 0;
    for (const p of samples) {
      const step = stepAt(p);
      expect(step).toBeGreaterThanOrEqual(previous);
      previous = step;
    }
    expect(stepAt(0)).toBe(0);
    expect(stepAt(1)).toBe(STEPS.length - 1);
  });

  it('la casa comença i acaba tancada, i només s’obre al pas de les instal·lacions', () => {
    expect(explodeAt(0)).toBe(0);
    expect(explodeAt(1)).toBe(0);
    for (const p of samples) if (stepAt(p) !== 3) expect(explodeAt(p)).toBe(0);
    expect(explodeAt(0.55)).toBe(1);
  });

  it('les teules velles han marxat abans que entrin bigues noves', () => {
    expect(BEATS.tilesOff[1]).toBeLessThanOrEqual(BEATS.raftersOn[0]);
    expect(BEATS.raftersOff[1]).toBeLessThanOrEqual(BEATS.raftersOn[0]);
  });

  it('les bigues canvien de color quan no se’n veu cap', () => {
    const swap = samples.find(raftersAreNew)!;
    expect(segment(swap, BEATS.raftersOff)).toBe(1);
    expect(segment(swap, BEATS.raftersOn)).toBe(0);
  });

  it('la teula nova no cau fins que la casa s’ha tornat a tancar i hi ha tauler a sota', () => {
    expect(BEATS.tilesOn[0]).toBeGreaterThanOrEqual(BEATS.collapse[1]);
    expect(BEATS.tilesOn[0]).toBeGreaterThan(BEATS.boards[0]);
    expect(BEATS.ridge[0]).toBeGreaterThan(BEATS.tilesOn[0]);
  });

  it('no es fa fosc fins a l’últim pas, i acaba fosc del tot', () => {
    for (const p of samples) if (stepAt(p) < 5) expect(duskAt(p)).toBe(0);
    expect(duskAt(1)).toBe(1);
  });

  it('la càmera es mou sense salts', () => {
    let previous = cameraAt(0);
    for (const p of samples.slice(1)) {
      const pose = cameraAt(p);
      expect(Math.abs(pose.azimuth - previous.azimuth)).toBeLessThan(0.06);
      expect(Math.abs(pose.fit - previous.fit)).toBeLessThan(1.8);
      expect(Math.abs(pose.targetY - previous.targetY)).toBeLessThan(0.6);
      previous = pose;
    }
  });

  it('el mateix progrés dona sempre la mateixa posa', () => {
    expect(cameraAt(0.37)).toEqual(cameraAt(0.37));
  });
});
