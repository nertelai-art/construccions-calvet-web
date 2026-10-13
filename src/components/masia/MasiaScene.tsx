'use client';

import { PerformanceMonitor } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from 'react';
import {
  BoxGeometry,
  Color,
  DoubleSide,
  MathUtils,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
  Quaternion,
  Vector3,
  type DirectionalLight,
  type Group,
  type HemisphereLight,
  type InstancedMesh,
  type Mesh,
  type PerspectiveCamera,
  type PointLight,
} from 'three';
import {
  BEAMS,
  D,
  EAVES,
  H1,
  LABEL_ANCHORS,
  OCULUS,
  PIPE_RADIAL,
  RIDGE,
  RIDGE_CAPS,
  RISE,
  ROOF_D,
  SLOPE_LEN,
  T,
  TILE_STEP_X,
  TILE_STEP_Z,
  W,
  WALLS,
  buildPipes,
  buildRafters,
  buildTiles,
  buildWindows,
  doorGeometry,
  frameGeometry,
  layerBase,
  rafterGeometry,
  slopeMatrix,
  tileGeometry,
  wallGeometry,
  windowFrameGeometry,
} from './masia-geometry';
import { BEATS, LAYER_LIFT, cameraAt, clamp01, duskAt, easeInOut, easeOutBack, easeOutBounce, easeOutCubic, explodeAt, raftersAreNew, segment } from './masia-phases';
import { radialFade, stoneTexture } from './masia-textures';

export type MasiaSceneProps = {
  progress: RefObject<number>;
  reducedMotion: boolean;
  /** Llista d'etiquetes HTML: l'escena només n'escriu la posició i l'opacitat. */
  labelsRef: RefObject<HTMLElement | null>;
};

const FOV = 30;
const SMOOTHING = 5;
const MAX_DELTA = 1 / 30; // una pausa de pestanya no ha de fer saltar l'animació

const WALL_OLD = new Color('#b9b0a2');
const WALL_NEW = new Color('#ffffff');
const WOOD_OLD = new Color('#57473a');
const WOOD_NEW = new Color('#c99b68');
const SUN_DAY = new Color('#fff0d9');
const SUN_DUSK = new Color('#8ea2cc');

// Temporals reutilitzats: zero objectes nous per fotograma.
const dummy = new Object3D();
const spin = new Quaternion();
const point = new Vector3();
const X_AXIS = new Vector3(1, 0, 0);
const tint = new Color();

const hidden = () => {
  dummy.position.set(0, -50, 0);
  dummy.quaternion.identity();
  dummy.scale.setScalar(0);
};

function useSceneAssets() {
  const assets = useMemo(() => {
    const stone = stoneTexture();
    const fade = radialFade();
    const pipes = buildPipes();
    return {
      textures: [stone, fade],
      fade,
      tiles: buildTiles(),
      rafters: buildRafters(),
      windows: buildWindows(),
      pipes,
      geometry: {
        walls: WALLS.map(wallGeometry),
        tile: tileGeometry(TILE_STEP_X + 0.14, TILE_STEP_Z * 0.53),
        rafter: rafterGeometry(),
        board: new BoxGeometry(SLOPE_LEN, 0.06, ROOF_D).translate(SLOPE_LEN / 2, 0, 0),
        frame: windowFrameGeometry(),
        pane: new PlaneGeometry(0.8, 1.14),
        door: doorGeometry(),
        footing: frameGeometry(W + 0.7, D + 0.7, W - 2 * T - 0.7, D - 2 * T - 0.7, 0.5),
        coping: frameGeometry(3.5, 5.7, 2.7, 4.9, 0.14),
        beam: new BoxGeometry(W - 2 * T + 0.3, 0.24, 0.18),
      },
      material: {
        wall: new MeshStandardMaterial({ map: stone, color: WALL_OLD.clone(), roughness: 1 }),
        rafter: new MeshStandardMaterial({ color: WOOD_OLD.clone(), roughness: 0.9 }),
        tileOld: new MeshStandardMaterial({ roughness: 1, side: DoubleSide }),
        tileNew: new MeshStandardMaterial({ roughness: 0.85, side: DoubleSide }),
        pane: new MeshStandardMaterial({ color: '#27333b', roughness: 0.25, emissive: '#ffb45e', emissiveIntensity: 0 }),
        joinery: new MeshStandardMaterial({ color: '#5d4330', roughness: 0.8 }),
        water: new MeshStandardMaterial({ color: '#2e9fc0', roughness: 0.18, emissive: '#1f86a8', emissiveIntensity: 0, transparent: true, opacity: 0 }),
      },
    };
  }, []);

  useEffect(
    () => () => {
      assets.textures.forEach((texture) => texture.dispose());
      Object.values(assets.material).forEach((material) => material.dispose());
      Object.values(assets.geometry)
        .flat()
        .forEach((geometry) => geometry.dispose());
      assets.pipes.forEach((pipe) => pipe.geometry.dispose());
    },
    [assets],
  );
  return assets;
}

/** Compila els shaders en segon pla abans del primer pintat, perquè no bloquegi la pàgina. */
function useCompileGate() {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);
  const invalidate = useThree((state) => state.invalidate);
  const setFrameloop = useThree((state) => state.setFrameloop);

  useEffect(() => {
    let done = false;
    const started = performance.now();
    const finish = () => {
      if (done) return;
      done = true;
      performance.measure('scene-compile:masia', { start: started, end: performance.now() });
      setFrameloop('demand');
      invalidate();
    };
    setFrameloop('never');
    gl.compileAsync(scene, camera).then(finish, finish);
    // Si la compilació no acaba (controlador antic, context perdut), pintem igualment.
    const timeout = window.setTimeout(finish, 4000);
    return () => {
      done = true;
      window.clearTimeout(timeout);
    };
  }, [gl, scene, camera, invalidate, setFrameloop]);
}

function Masia({ progress, reducedMotion, labelsRef }: MasiaSceneProps) {
  const assets = useSceneAssets();
  const { tiles, rafters, windows, pipes, geometry, material } = assets;
  const invalidate = useThree((state) => state.invalidate);
  const camera = useThree((state) => state.camera) as PerspectiveCamera;
  const size = useThree((state) => state.size);
  useCompileGate();

  const smooth = useRef(reducedMotion ? 1 : (progress.current ?? 0));
  // Els materials que canvien amb el progrés es toquen a través de la malla que els porta.
  const wallProbe = useRef<Mesh>(null);
  const lowWalls = useRef<Group>(null);
  const floor = useRef<Group>(null);
  const highWalls = useRef<Group>(null);
  const roofFrame = useRef<Group>(null);
  const oldTiles = useRef<InstancedMesh>(null);
  const newTiles = useRef<InstancedMesh>(null);
  const caps = useRef<InstancedMesh>(null);
  const rafterMesh = useRef<InstancedMesh>(null);
  const frames = useRef<InstancedMesh>(null);
  const panes = useRef<InstancedMesh>(null);
  const boardA = useRef<Mesh>(null);
  const boardB = useRef<Mesh>(null);
  const door = useRef<Mesh>(null);
  const oculus = useRef<Mesh>(null);
  const pipeA = useRef<Mesh>(null);
  const pipeB = useRef<Mesh>(null);
  const pipeC = useRef<Mesh>(null);
  const cypressA = useRef<Group>(null);
  const cypressB = useRef<Group>(null);
  const cypressC = useRef<Group>(null);
  const olive = useRef<Group>(null);
  const path = useRef<Group>(null);
  const pool = useRef<Group>(null);
  const water = useRef<Mesh>(null);
  const sky = useRef<HemisphereLight>(null);
  const sun = useRef<DirectionalLight>(null);
  const lamp = useRef<PointLight>(null);

  const slopes = useMemo(() => [slopeMatrix(1), slopeMatrix(-1)], []);

  // Colors per instància, abans del primer pintat: afegir-los després recompilaria el shader.
  useLayoutEffect(() => {
    tiles.forEach((tile, index) => {
      const mossy = tile.moss > 0.72;
      tint.setHSL(mossy ? 0.17 : 0.05 + tile.tone * 0.04, mossy ? 0.16 : 0.3, 0.13 + tile.tone * 0.1);
      oldTiles.current?.setColorAt(index, tint);
      tint.setHSL(0.042 + tile.tone * 0.022, 0.6, 0.4 + tile.moss * 0.13);
      newTiles.current?.setColorAt(index, tint);
    });
    for (let index = 0; index < RIDGE_CAPS; index++) {
      tint.setHSL(0.05, 0.58, 0.4 + ((index * 7) % 5) * 0.025);
      caps.current?.setColorAt(index, tint);
    }
    for (const mesh of [oldTiles.current, newTiles.current, caps.current]) if (mesh?.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [tiles]);

  // Pintem només quan hi ha scroll (frameloop="demand").
  useEffect(() => {
    const onScroll = () => invalidate();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [invalidate]);

  // Escriptori: la masia a la dreta del text. Mòbil: centrada, una mica amunt. Es desplaça el frustum.
  useLayoutEffect(() => {
    const wide = size.width / size.height > 1.15;
    camera.setViewOffset(size.width, size.height, wide ? -size.width * 0.16 : 0, wide ? 0 : size.height * 0.03, size.width, size.height);
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, size, invalidate]);

  useFrame((_, rawDelta) => {
    const target = reducedMotion ? 1 : (progress.current ?? 0);
    smooth.current = MathUtils.damp(smooth.current, target, SMOOTHING, Math.min(rawDelta, MAX_DELTA));
    if (Math.abs(smooth.current - target) < 0.0004) smooth.current = target;
    else invalidate(); // encara s'assenta: demanem un altre fotograma
    const p = smooth.current;

    // ── Càmera: òrbita entre punts clau, a la distància que fa cabre l'escena ──
    const pose = cameraAt(p);
    const aspect = size.width / size.height;
    const radius = pose.fit / 2 / (Math.tan(MathUtils.degToRad(FOV / 2)) * Math.min(aspect, 1.4));
    const flat = Math.cos(pose.elevation) * radius;
    camera.position.set(Math.sin(pose.azimuth) * flat, pose.targetY + Math.sin(pose.elevation) * radius, Math.cos(pose.azimuth) * flat);
    camera.lookAt(0, pose.targetY, 0);

    // ── Anatomia: les capes se separen en vertical ──
    const open = explodeAt(p);
    if (lowWalls.current) lowWalls.current.position.y = LAYER_LIFT[1] * open;
    if (floor.current) floor.current.position.y = LAYER_LIFT[2] * open;
    if (highWalls.current) highWalls.current.position.y = LAYER_LIFT[3] * open;
    if (roofFrame.current) roofFrame.current.position.y = LAYER_LIFT[4] * open;

    // ── Enderroc: les teules velles s'enlairen i marxen ──
    const removal = segment(p, BEATS.tilesOff);
    const oldMesh = oldTiles.current;
    if (oldMesh) {
      tiles.forEach((tile, index) => {
        const k = clamp01((removal - tile.leave) / 0.2);
        if (tile.missing || k >= 1) {
          hidden();
        } else {
          dummy.position.copy(tile.worn.position).addScaledVector(tile.worn.normal, k * 0.8);
          dummy.position.x += tile.drift.x * k;
          dummy.position.y += 9 * k * k + 1.5 * k;
          dummy.position.z += tile.drift.z * k;
          spin.setFromAxisAngle(tile.axis, tile.spin * k * k);
          dummy.quaternion.copy(tile.worn.quaternion).premultiply(spin);
          dummy.scale.setScalar(1 - k * k * k);
        }
        dummy.updateMatrix();
        oldMesh.setMatrixAt(index, dummy.matrix);
      });
      oldMesh.instanceMatrix.needsUpdate = true;
    }

    // ── Estructura: surten les bigues velles, cauen les noves i s'assenten ──
    const fresh = raftersAreNew(p);
    const raftersOut = segment(p, BEATS.raftersOff);
    const raftersIn = segment(p, BEATS.raftersOn);
    const rafterMeshCurrent = rafterMesh.current;
    if (rafterMeshCurrent) {
      (rafterMeshCurrent.material as MeshStandardMaterial).color.copy(fresh ? WOOD_NEW : WOOD_OLD);
      rafters.forEach((rafter, index) => {
        dummy.position.copy(rafter.rest.position);
        dummy.quaternion.copy(rafter.rest.quaternion);
        dummy.scale.setScalar(1);
        if (fresh) {
          const k = clamp01((raftersIn - rafter.order * 0.7) / 0.3);
          if (k <= 0) hidden();
          else dummy.position.y += (1 - easeOutBounce(k)) * 5 + LAYER_LIFT[4] * open;
        } else {
          const k = clamp01((raftersOut - rafter.order * 0.7) / 0.3);
          if (k >= 1) {
            hidden();
          } else if (k > 0) {
            dummy.position.x += rafter.drift.x * k;
            dummy.position.y += 7 * k * k + k;
            dummy.position.z += rafter.drift.z * k;
            spin.setFromAxisAngle(rafter.axis, rafter.spin * k * k);
            dummy.quaternion.premultiply(spin);
            dummy.scale.setScalar(1 - k * k * k);
          }
        }
        dummy.updateMatrix();
        rafterMeshCurrent.setMatrixAt(index, dummy.matrix);
      });
      rafterMeshCurrent.instanceMatrix.needsUpdate = true;
    }

    // ── Instal·lacions: cada tub es dibuixa allargant el tram pintat ──
    const piping = segment(p, BEATS.pipes);
    [pipeA.current, pipeB.current, pipeC.current].forEach((mesh, index) => {
      const pipe = pipes[index];
      if (!mesh || !pipe) return;
      const k = easeInOut(clamp01((piping - pipe.delay) / 0.6));
      mesh.visible = k > 0;
      mesh.geometry.setDrawRange(0, Math.floor(k * pipe.segments) * PIPE_RADIAL * 6);
    });

    // ── Coberta: el tauler es desplega del carener al ràfec i hi cau la teula nova ──
    const boarding = easeInOut(segment(p, BEATS.boards));
    for (const mesh of [boardA.current, boardB.current]) {
      if (!mesh) continue;
      mesh.visible = boarding > 0.001;
      mesh.scale.x = Math.max(boarding, 0.001);
    }

    const tiling = segment(p, BEATS.tilesOn);
    const newMesh = newTiles.current;
    if (newMesh) {
      tiles.forEach((tile, index) => {
        const k = clamp01((tiling - tile.arrive) / 0.24);
        if (k <= 0) {
          hidden();
        } else {
          const fall = 1 - easeOutBounce(k);
          dummy.position.copy(tile.rest.position);
          dummy.position.y += fall * 6;
          spin.setFromAxisAngle(X_AXIS, tile.wobble * fall);
          dummy.quaternion.copy(tile.rest.quaternion).multiply(spin);
          dummy.scale.setScalar(1);
        }
        dummy.updateMatrix();
        newMesh.setMatrixAt(index, dummy.matrix);
      });
      newMesh.instanceMatrix.needsUpdate = true;
    }

    const capping = segment(p, BEATS.ridge);
    const capMesh = caps.current;
    if (capMesh) {
      for (let index = 0; index < RIDGE_CAPS; index++) {
        const k = clamp01((capping - (index / RIDGE_CAPS) * 0.7) / 0.3);
        if (k <= 0) {
          hidden();
        } else {
          dummy.position.set(0, RIDGE + 0.3 + (1 - easeOutBounce(k)) * 4, -ROOF_D / 2 + (index + 0.5) * (ROOF_D / RIDGE_CAPS));
          dummy.rotation.set(0, Math.PI / 2, 0);
          dummy.scale.setScalar(1.25);
        }
        dummy.updateMatrix();
        capMesh.setMatrixAt(index, dummy.matrix);
      }
      capMesh.instanceMatrix.needsUpdate = true;
    }

    // ── Fusteria: finestres i porta entren des de fora ──
    const joining = segment(p, BEATS.joinery);
    const frameMesh = frames.current;
    const paneMesh = panes.current;
    if (frameMesh && paneMesh) {
      windows.forEach((unit, index) => {
        const k = easeOutCubic(clamp01((joining - unit.order * 0.7) / 0.3));
        if (k <= 0) {
          hidden();
        } else {
          dummy.position.copy(unit.rest.position).addScaledVector(unit.rest.normal, (1 - k) * 2.6);
          dummy.position.y += LAYER_LIFT[unit.layer] * open;
          dummy.quaternion.copy(unit.rest.quaternion);
          dummy.scale.set(1, unit.scaleY, 1);
        }
        dummy.updateMatrix();
        frameMesh.setMatrixAt(index, dummy.matrix);
        paneMesh.setMatrixAt(index, dummy.matrix);
      });
      frameMesh.instanceMatrix.needsUpdate = true;
      paneMesh.instanceMatrix.needsUpdate = true;
    }
    const doorIn = easeOutCubic(clamp01((joining - 0.1) / 0.35));
    if (door.current) {
      door.current.visible = doorIn > 0;
      door.current.position.z = D / 2 - T * 0.45 + (1 - doorIn) * 3;
    }
    if (oculus.current) {
      const k = easeOutBack(clamp01((joining - 0.6) / 0.3));
      oculus.current.visible = k > 0;
      oculus.current.scale.setScalar(Math.max(k, 0.001));
    }

    // ── Claus en mà: la pedra neta, el jardí, la piscina i el capvespre ──
    if (wallProbe.current) (wallProbe.current.material as MeshStandardMaterial).color.lerpColors(WALL_OLD, WALL_NEW, easeInOut(segment(p, BEATS.clean)));

    const garden = segment(p, BEATS.garden);
    [cypressA.current, cypressB.current, cypressC.current, olive.current, path.current, pool.current].forEach((group, index) => {
      if (!group) return;
      const k = easeOutBack(clamp01((garden - index * 0.1) / 0.4));
      group.visible = k > 0;
      group.scale.setScalar(Math.max(k, 0.001));
    });
    const waterMaterial = water.current?.material as MeshStandardMaterial | undefined;
    if (water.current && waterMaterial) {
      waterMaterial.opacity = clamp01((garden - 0.55) / 0.4);
      water.current.visible = waterMaterial.opacity > 0;
    }

    const dusk = duskAt(p);
    if (sky.current) sky.current.intensity = MathUtils.lerp(1.15, 0.34, dusk);
    if (sun.current) {
      sun.current.intensity = MathUtils.lerp(2.3, 0.32, dusk);
      sun.current.color.lerpColors(SUN_DAY, SUN_DUSK, dusk);
    }
    if (lamp.current) lamp.current.intensity = dusk * 26;
    if (panes.current) (panes.current.material as MeshStandardMaterial).emissiveIntensity = dusk * 2.1;
    if (waterMaterial) waterMaterial.emissiveIntensity = dusk * 0.9;

    // ── Etiquetes de l'anatomia: es projecten a pantalla i s'escriuen al DOM ──
    const list = labelsRef.current;
    if (list) {
      const items = list.children;
      const visible = open > 0.02;
      list.style.visibility = visible ? 'visible' : 'hidden';
      if (visible) {
        camera.updateMatrixWorld();
        for (let index = 0; index < LABEL_ANCHORS.length; index++) {
          const anchor = LABEL_ANCHORS[index]!;
          const item = items[index] as HTMLElement | undefined;
          if (!item) continue;
          point.set(anchor[0], anchor[1] + LAYER_LIFT[anchor[3]] * open, anchor[2]).project(camera);
          const x = (point.x * 0.5 + 0.5) * size.width;
          const y = (-point.y * 0.5 + 0.5) * size.height;
          item.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
          item.style.opacity = clamp01((open - 0.55 - index * 0.05) / 0.25).toFixed(3);
        }
      }
    }
  });

  return (
    <group>
      <hemisphereLight ref={sky} args={['#fff5e3', '#c8b598', 1.15]} />
      <directionalLight
        ref={sun}
        position={[9, 14, 10]}
        intensity={2.3}
        color={SUN_DAY}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0008}
        shadow-normalBias={0.03}
        shadow-camera-left={-13}
        shadow-camera-right={13}
        shadow-camera-top={15}
        shadow-camera-bottom={-9}
        shadow-camera-far={50}
      />
      {/* Fanal de l'entrada: sempre hi és (treure o posar un llum recompilaria els shaders), a zero fins al capvespre. */}
      <pointLight ref={lamp} position={[0, 3.3, D / 2 + 1.3]} color="#ffb061" intensity={0} distance={15} decay={2} />

      {/* Terra: s'esvaeix cap als costats perquè no hi hagi una línia d'horitzó dura */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <circleGeometry args={[17, 64]} />
        <meshStandardMaterial color="#e6decd" roughness={1} alphaMap={assets.fade} transparent depthWrite={false} />
      </mesh>

      {/* Capa 0 — fonaments i solera */}
      <mesh geometry={geometry.footing} position={[0, -0.44, 0]} receiveShadow castShadow>
        <meshStandardMaterial color="#a9a498" roughness={1} />
      </mesh>
      <mesh position={[0, 0.04, 0]} receiveShadow>
        <boxGeometry args={[W - 2 * T, 0.06, D - 2 * T]} />
        <meshStandardMaterial color="#a58a72" roughness={0.95} />
      </mesh>

      {/* Capa 1 — murs de planta baixa */}
      <group ref={lowWalls}>
        {WALLS.map((wall, index) =>
          wall.layer === 1 ? (
            <group key={wall.id} rotation-y={wall.rotY}>
              <mesh ref={index === 0 ? wallProbe : undefined} geometry={geometry.walls[index]} material={material.wall} position={[0, layerBase(wall.layer), wall.offset]} castShadow receiveShadow />
            </group>
          ) : null,
        )}
        <mesh ref={door} geometry={geometry.door} material={material.joinery} position={[0, 0, D / 2 - T * 0.45]} visible={false} castShadow />
      </group>

      {/* Capa 2 — forjat de bigues, amb les instal·lacions a sobre */}
      <group ref={floor}>
        {Array.from({ length: BEAMS }, (_, index) => (
          <mesh key={index} geometry={geometry.beam} position={[0, H1 - 0.12, -D / 2 + T + 0.3 + (index / (BEAMS - 1)) * (D - 2 * T - 0.6)]} castShadow>
            <meshStandardMaterial color="#b98d5e" roughness={0.9} />
          </mesh>
        ))}
        <mesh position={[0, H1 + 0.05, 0]} receiveShadow castShadow>
          <boxGeometry args={[W - 2 * T - 0.02, 0.1, D - 2 * T - 0.02]} />
          <meshStandardMaterial color="#ddd5c6" roughness={1} />
        </mesh>
        {pipes.map((pipe, index) => (
          <mesh key={pipe.color} ref={index === 0 ? pipeA : index === 1 ? pipeB : pipeC} geometry={pipe.geometry} visible={false}>
            <meshStandardMaterial color={pipe.color} roughness={0.5} />
          </mesh>
        ))}
      </group>

      {/* Capa 3 — murs del pis i testeres */}
      <group ref={highWalls}>
        {WALLS.map((wall, index) =>
          wall.layer === 3 ? (
            <group key={wall.id} rotation-y={wall.rotY}>
              <mesh geometry={geometry.walls[index]} material={material.wall} position={[0, layerBase(wall.layer), wall.offset]} castShadow receiveShadow />
            </group>
          ) : null,
        )}
        <mesh ref={oculus} material={material.pane} position={[0, H1 + OCULUS.v, D / 2 - T * 0.4]} visible={false}>
          <circleGeometry args={[OCULUS.radius, 24]} />
        </mesh>
      </group>

      {/* Capa 4 — biga carenera i xemeneia (els cabirons van per instàncies) */}
      <group ref={roofFrame}>
        <mesh position={[0, RIDGE - 0.12, 0]} material={material.rafter} castShadow>
          <boxGeometry args={[0.22, 0.26, ROOF_D - 0.3]} />
        </mesh>
        <mesh position={[2.3, EAVES + RISE * 0.72, -1.3]} castShadow>
          <boxGeometry args={[0.75, 2.3, 0.75]} />
          <meshStandardMaterial color="#d6cab4" roughness={1} />
        </mesh>
        <mesh position={[2.3, EAVES + RISE * 0.72 + 1.2, -1.3]} castShadow>
          <boxGeometry args={[0.98, 0.12, 0.98]} />
          <meshStandardMaterial color="#b9623c" roughness={0.9} />
        </mesh>
      </group>

      {/* Tauler de coberta: creix des del carener */}
      {slopes.map((slope, index) => (
        <group key={index} matrixAutoUpdate={false} matrix={slope}>
          <mesh ref={index === 0 ? boardA : boardB} geometry={geometry.board} position={[0, 0.2, 0]} visible={false} castShadow receiveShadow>
            <meshStandardMaterial color="#b0704c" roughness={0.95} />
          </mesh>
        </group>
      ))}

      {/* Peces repetides: un sol draw call per tipus. Sense retall per frustum, que les instàncies volen lluny. */}
      <instancedMesh ref={rafterMesh} args={[geometry.rafter, material.rafter, rafters.length]} frustumCulled={false} castShadow />
      <instancedMesh ref={oldTiles} args={[geometry.tile, material.tileOld, tiles.length]} frustumCulled={false} castShadow receiveShadow />
      <instancedMesh ref={newTiles} args={[geometry.tile, material.tileNew, tiles.length]} frustumCulled={false} castShadow receiveShadow />
      <instancedMesh ref={caps} args={[geometry.tile, material.tileNew, RIDGE_CAPS]} frustumCulled={false} castShadow />
      <instancedMesh ref={frames} args={[geometry.frame, material.joinery, windows.length]} frustumCulled={false} />
      <instancedMesh ref={panes} args={[geometry.pane, material.pane, windows.length]} frustumCulled={false} />

      {/* Jardí */}
      {(
        [
          [cypressA, -6.3, 1.4, 1],
          [cypressB, -7.4, 3.1, 0.8],
          [cypressC, 6.4, -3.9, 0.92],
        ] as const
      ).map(([ref, x, z, scale]) => (
        <group key={x} position={[x, 0, z]}>
          <group ref={ref} visible={false}>
            <mesh position={[0, 0.3, 0]} castShadow>
              <cylinderGeometry args={[0.08, 0.1, 0.6, 6]} />
              <meshStandardMaterial color="#6a5544" roughness={1} />
            </mesh>
            <mesh position={[0, 0.5 + 1.9 * scale, 0]} scale={[1, scale, 1]} castShadow>
              <coneGeometry args={[0.52, 3.8, 10]} />
              <meshStandardMaterial color="#47573f" roughness={1} flatShading />
            </mesh>
          </group>
        </group>
      ))}
      <group position={[-4.4, 0, 6.3]}>
        <group ref={olive} visible={false}>
          <mesh position={[0, 0.6, 0]} castShadow>
            <cylinderGeometry args={[0.13, 0.2, 1.2, 6]} />
            <meshStandardMaterial color="#6a5544" roughness={1} />
          </mesh>
          <mesh position={[0, 1.75, 0]} scale={[1.25, 0.9, 1.1]} castShadow>
            <icosahedronGeometry args={[1, 1]} />
            <meshStandardMaterial color="#8c9872" roughness={1} flatShading />
          </mesh>
        </group>
      </group>
      <group position={[0, 0, D / 2]}>
        <group ref={path} visible={false}>
          {[1.1, 2.2, 3.3, 4.4, 5.5].map((z, index) => (
            <mesh key={z} position={[(index % 2 ? 0.14 : -0.1) * (index + 1) * 0.5, 0.03, z]} receiveShadow>
              <boxGeometry args={[1.3, 0.06, 0.8]} />
              <meshStandardMaterial color="#cbc1ad" roughness={1} />
            </mesh>
          ))}
        </group>
      </group>
      <group position={[7.6, 0, 1.4]}>
        <group ref={pool} visible={false}>
          <mesh geometry={geometry.coping} receiveShadow castShadow>
            <meshStandardMaterial color="#ece5d6" roughness={0.9} />
          </mesh>
          <mesh ref={water} material={material.water} rotation-x={-Math.PI / 2} position={[0, 0.09, 0]} visible={false}>
            <planeGeometry args={[2.7, 4.9]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

export default function MasiaScene(props: MasiaSceneProps) {
  const [dpr, setDpr] = useState(1.5);
  return (
    <Canvas
      frameloop="demand"
      dpr={dpr}
      shadows="percentage"
      camera={{ position: [18, 9, 20], fov: FOV, near: 1, far: 400 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      resize={{ scroll: false, debounce: { scroll: 0, resize: 150 } }}
      aria-hidden="true"
    >
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.5)} flipflops={3} onFallback={() => setDpr(1)} />
      <Masia {...props} />
    </Canvas>
  );
}
