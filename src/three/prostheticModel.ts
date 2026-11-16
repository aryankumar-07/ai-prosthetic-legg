import * as THREE from 'three';
import { ProstheticTextureSet } from './textures';
import type { VisualMode } from '../utils/viewerState';
import type { ActivityPose } from './activityKinematics';

export interface ProstheticModelRig {
  root: THREE.Group;
  setVisualState: (
    mode: VisualMode,
    activeSensorId: string | null,
    hoveredSensorId: string | null,
    highlightedSensorIds?: string[] | null,
  ) => void;
  setArticulation?: (pose: ActivityPose) => void;
  setMaintenanceSeparation?: (amount01: number) => void;
  updateSignalPulses?: (elapsedSec: number, activeSensors: string[], enabled: boolean) => void;
  dispose: () => void;
}

interface ShellMaterialEntry {
  material: THREE.MeshPhysicalMaterial | THREE.MeshStandardMaterial;
  baseColor: THREE.Color;
  baseRoughness: number;
  xrayOpacity: number;
  sensorDimOpacity: number;
}

interface SensorHighlightEntry {
  material: THREE.MeshStandardMaterial;
  baseEmissive: THREE.Color;
  baseEmissiveIntensity: number;
  highlightColor: THREE.Color;
}

/**
 * Builds a closed, thick-walled anatomical socket shell or liner geometry
 * with an organic calf taper, posterior flare, and patellar anterior dip.
 */
export function buildThickSocketGeometry(options: {
  yBottom: number;
  yTop: number;
  radialSegments: number;
  heightSegments: number;
  wallThickness: number;
  rxBottom: number;
  rzBottom: number;
  rxTop: number;
  rzTop: number;
  brimDipFront: number;
  brimRiseBack: number;
  posteriorOffsetZ: number;
}): THREE.BufferGeometry {
  const {
    yBottom,
    yTop,
    radialSegments,
    heightSegments,
    wallThickness,
    rxBottom,
    rzBottom,
    rxTop,
    rzTop,
    brimDipFront,
    brimRiseBack,
    posteriorOffsetZ,
  } = options;

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const ringStride = radialSegments + 1;

  // Profile generator for outer (offset = 0) and inner (offset = -wallThickness)
  const addProfileRings = (radialOffset: number, flipNormal: boolean) => {
    const startVertexOffset = positions.length / 3;
    for (let iy = 0; iy <= heightSegments; iy++) {
      const v = iy / heightSegments;
      // Smooth anatomical curve (slight calf swell around v=0.65)
      const curve = Math.pow(v, 0.78) + 0.08 * Math.sin(v * Math.PI);
      const rx = THREE.MathUtils.lerp(rxBottom, rxTop, curve) + radialOffset;
      const rz = THREE.MathUtils.lerp(rzBottom, rzTop, curve) + radialOffset;
      const centerZ = posteriorOffsetZ * Math.sin(v * Math.PI * 0.85);

      for (let ix = 0; ix <= radialSegments; ix++) {
        const u = ix / radialSegments;
        const theta = u * Math.PI * 2;
        const sinT = Math.sin(theta);
        const cosT = Math.cos(theta);

        // cosT = +1 is +Z (anterior), cosT = -1 is -Z (posterior)
        const x = sinT * rx;
        const z = cosT * rz + centerZ;

        // Top brim contour: dips in front (+Z), rises laterally & posteriorly (-Z)
        const brimWave =
          v > 0.35
            ? ((v - 0.35) / 0.65) *
              (-brimDipFront * Math.max(0, cosT) +
                brimRiseBack * Math.max(0, -cosT) +
                0.045 * Math.pow(Math.abs(sinT), 1.5))
            : 0;

        const y = THREE.MathUtils.lerp(yBottom, yTop, v) + brimWave;

        positions.push(x, y, z);
        uvs.push(u, v);
      }
    }

    for (let iy = 0; iy < heightSegments; iy++) {
      for (let ix = 0; ix < radialSegments; ix++) {
        const a = startVertexOffset + iy * ringStride + ix;
        const b = a + 1;
        const c = a + ringStride;
        const d = c + 1;
        if (!flipNormal) {
          indices.push(a, b, d, a, d, c);
        } else {
          indices.push(a, d, b, a, c, d);
        }
      }
    }
    return startVertexOffset;
  };

  const outerStart = addProfileRings(0, false);
  const innerStart = addProfileRings(-wallThickness, true);

  // Stitch top rim cap
  const outerTopOffset = outerStart + heightSegments * ringStride;
  const innerTopOffset = innerStart + heightSegments * ringStride;
  for (let ix = 0; ix < radialSegments; ix++) {
    const o0 = outerTopOffset + ix;
    const o1 = outerTopOffset + ix + 1;
    const i0 = innerTopOffset + ix;
    const i1 = innerTopOffset + ix + 1;
    indices.push(o0, o1, i1, o0, i1, i0);
  }

  // Stitch bottom rim cap
  for (let ix = 0; ix < radialSegments; ix++) {
    const o0 = outerStart + ix;
    const o1 = outerStart + ix + 1;
    const i0 = innerStart + ix;
    const i1 = innerStart + ix + 1;
    indices.push(o0, i1, o1, o0, i0, i1);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Builds a curved clevis arm using beveled ExtrudeGeometry
 */
function buildClevisArmGeometry(
  height: number,
  topWidth: number,
  bottomWidth: number,
  thickness: number,
): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(-bottomWidth / 2, -height / 2);
  shape.lineTo(bottomWidth / 2, -height / 2);
  shape.quadraticCurveTo(topWidth * 0.62, 0, topWidth / 2, height / 2);
  shape.absarc(0, height / 2, topWidth / 2, 0, Math.PI, false);
  shape.quadraticCurveTo(-topWidth * 0.62, 0, -bottomWidth / 2, -height / 2);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: 0.008,
    bevelSize: 0.008,
    bevelSegments: 2,
    curveSegments: 16,
  });
  geo.center();
  return geo;
}

export function createProstheticModel(
  textures: ProstheticTextureSet,
  isSoftwareGl: boolean,
): ProstheticModelRig {
  const root = new THREE.Group();
  root.name = 'NEXLIMB_Prosthetic_Prototype';

  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const shellMaterials: ShellMaterialEntry[] = [];
  const sensorMaterials: Record<string, SensorHighlightEntry[]> = {};

  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    geometries.push(g);
    return g;
  };
  const trackMat = <T extends THREE.Material>(m: T): T => {
    materials.push(m);
    return m;
  };
  const trackShell = <T extends THREE.MeshPhysicalMaterial | THREE.MeshStandardMaterial>(
    m: T,
    xrayOpacity = 0.22,
    sensorDimOpacity = 0.72,
  ): T => {
    trackMat(m);
    shellMaterials.push({
      material: m,
      baseColor: m.color.clone(),
      baseRoughness: m.roughness,
      xrayOpacity,
      sensorDimOpacity,
    });
    return m;
  };
  const trackSensor = (
    sensorId: string,
    mat: THREE.MeshStandardMaterial,
    highlightHex = 0x14b8a6,
  ): THREE.MeshStandardMaterial => {
    trackMat(mat);
    if (!sensorMaterials[sensorId]) {
      sensorMaterials[sensorId] = [];
    }
    sensorMaterials[sensorId].push({
      material: mat,
      baseEmissive: mat.emissive.clone(),
      baseEmissiveIntensity: mat.emissiveIntensity,
      highlightColor: new THREE.Color(highlightHex),
    });
    return mat;
  };

  // --- Shared Industrial Materials ---
  const carbonShellMat = trackShell(
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      map: textures.carbonAlbedo,
      bumpMap: textures.carbonBump,
      bumpScale: 0.008,
      roughnessMap: textures.carbonRoughness,
      roughness: 0.34,
      metalness: 0.12,
      clearcoat: isSoftwareGl ? 0.25 : 0.65,
      clearcoatRoughness: 0.22,
    }),
    0.2,
    0.66,
  );

  const carbonFrameMat = trackShell(
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      map: textures.carbonAlbedo,
      bumpMap: textures.carbonBump,
      bumpScale: 0.007,
      roughness: 0.32,
      metalness: 0.14,
      clearcoat: isSoftwareGl ? 0.2 : 0.55,
      clearcoatRoughness: 0.24,
    }),
    0.26,
    0.85,
  );

  const brushedTitaniumMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0xb7c0ca,
      metalness: 0.92,
      roughness: 0.24,
      bumpMap: textures.brushedMetalBump,
      bumpScale: 0.004,
      anisotropy: isSoftwareGl ? 0 : 0.7,
    }),
  );

  const darkAnodizedMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x1a1e24,
      metalness: 0.72,
      roughness: 0.36,
    }),
  );

  const mattePolymerMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x16191e,
      metalness: 0.08,
      roughness: 0.76,
    }),
  );

  const linerFabricMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xd0d4da,
      map: textures.linerAlbedo,
      bumpMap: textures.linerBump,
      bumpScale: 0.006,
      metalness: 0.02,
      roughness: 0.88,
    }),
  );

  const linerDarkInnerMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x2a2e35,
      bumpMap: textures.linerBump,
      bumpScale: 0.006,
      roughness: 0.92,
      metalness: 0.02,
    }),
  );

  const tealAccentMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x14b8a6,
      emissive: new THREE.Color(0x0d9488),
      emissiveIntensity: 0.85,
      metalness: 0.35,
      roughness: 0.22,
    }),
  );

  const stainlessMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xd4dbe3,
      metalness: 0.95,
      roughness: 0.16,
    }),
  );

  const copperTraceMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xc98a3b,
      metalness: 0.82,
      roughness: 0.28,
    }),
  );

  const setShadows = (obj: THREE.Object3D, cast = true, receive = true) => {
    obj.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = cast && !isSoftwareGl;
        child.receiveShadow = receive && !isSoftwareGl;
      }
    });
  };

  // ============================================================================
  // 1. SCULPTED CARBON-FIBER SOCKET & GREY COMFORT LINER (y: 2.15 -> 3.24)
  // ============================================================================
  const socketGroup = new THREE.Group();

  const outerSocketGeo = trackGeo(
    buildThickSocketGeometry({
      yBottom: 2.18,
      yTop: 3.12,
      radialSegments: 48,
      heightSegments: 22,
      wallThickness: 0.024,
      rxBottom: 0.135,
      rzBottom: 0.135,
      rxTop: 0.31,
      rzTop: 0.305,
      brimDipFront: 0.09,
      brimRiseBack: 0.08,
      posteriorOffsetZ: -0.028,
    }),
  );
  const outerSocketMesh = new THREE.Mesh(outerSocketGeo, carbonShellMat);
  outerSocketMesh.renderOrder = 3;
  socketGroup.add(outerSocketMesh);

  // Inner padded grey liner rising above carbon brim
  const linerGeo = trackGeo(
    buildThickSocketGeometry({
      yBottom: 2.24,
      yTop: 3.2,
      radialSegments: 44,
      heightSegments: 18,
      wallThickness: 0.028,
      rxBottom: 0.112,
      rzBottom: 0.112,
      rxTop: 0.285,
      rzTop: 0.28,
      brimDipFront: 0.075,
      brimRiseBack: 0.09,
      posteriorOffsetZ: -0.026,
    }),
  );
  const linerMesh = new THREE.Mesh(linerGeo, linerFabricMat);
  linerMesh.renderOrder = 1;
  socketGroup.add(linerMesh);

  // Dark inner cuff lining near top posterior wall
  const innerCuffGeo = trackGeo(
    new THREE.CylinderGeometry(0.252, 0.22, 0.24, 36, 1, true, Math.PI * 0.35, Math.PI * 1.3),
  );
  const innerCuffMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x20242a,
      bumpMap: textures.linerBump,
      bumpScale: 0.005,
      roughness: 0.92,
      side: THREE.DoubleSide,
    }),
  );
  const innerCuff = new THREE.Mesh(innerCuffGeo, innerCuffMat);
  innerCuff.position.set(0, 3.06, -0.03);
  socketGroup.add(innerCuff);

  // Anterior socket collar lip trim
  const collarTrimGeo = trackGeo(new THREE.TorusGeometry(0.285, 0.016, 10, 42));
  const collarTrim = new THREE.Mesh(collarTrimGeo, mattePolymerMat);
  collarTrim.rotation.x = Math.PI / 2 - 0.14;
  collarTrim.position.set(0, 3.08, -0.02);
  collarTrim.scale.set(1.06, 1.02, 1);
  socketGroup.add(collarTrim);

  // Front vertical socket telemetry pod with teal LED slit (Image 1)
  const podGroup = new THREE.Group();
  podGroup.position.set(0, 2.58, 0.235);
  podGroup.rotation.x = -0.18;

  const podShellMat = trackShell(
    new THREE.MeshStandardMaterial({
      color: 0x16191f,
      metalness: 0.25,
      roughness: 0.52,
    }),
    0.32,
    0.8,
  );
  const podBodyGeo = trackGeo(new THREE.BoxGeometry(0.11, 0.34, 0.055));
  const podBody = new THREE.Mesh(podBodyGeo, podShellMat);
  podGroup.add(podBody);

  const podSlitGeo = trackGeo(new THREE.BoxGeometry(0.014, 0.075, 0.01));
  const podSlit = new THREE.Mesh(podSlitGeo, tealAccentMat);
  podSlit.position.set(0, -0.02, 0.027);
  podGroup.add(podSlit);

  // Top & bottom socket pod fasteners
  const screwGeo = trackGeo(new THREE.CylinderGeometry(0.012, 0.012, 0.016, 12));
  [-0.14, 0.14].forEach((sy) => {
    const bolt = new THREE.Mesh(screwGeo, stainlessMat);
    bolt.rotation.x = Math.PI / 2;
    bolt.position.set(0, sy, 0.026);
    podGroup.add(bolt);
  });
  socketGroup.add(podGroup);

  // Side ventilation mesh windows (left & right, Image 1)
  const ventMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: textures.ventMeshAlbedo,
      alphaMap: textures.ventMeshAlpha,
      transparent: true,
      roughness: 0.85,
      metalness: 0.15,
    }),
  );
  [-1, 1].forEach((side) => {
    [2.56, 2.71].forEach((vy, idx) => {
      const ventGeo = trackGeo(new THREE.BoxGeometry(0.02, 0.095, 0.15 - idx * 0.015));
      const ventMesh = new THREE.Mesh(ventGeo, ventMat);
      ventMesh.position.set(side * 0.232, vy, 0.035);
      ventMesh.rotation.z = side * -0.17;
      socketGroup.add(ventMesh);
    });
  });

  // Posterior socket strap & retention buckle
  const strapGeo = trackGeo(
    new THREE.CylinderGeometry(0.295, 0.295, 0.075, 32, 1, true, Math.PI * 0.65, Math.PI * 0.7),
  );
  const strap = new THREE.Mesh(strapGeo, mattePolymerMat);
  strap.position.set(0, 2.98, -0.03);
  socketGroup.add(strap);

  const buckleGeo = trackGeo(new THREE.BoxGeometry(0.08, 0.09, 0.035));
  const buckle = new THREE.Mesh(buckleGeo, darkAnodizedMat);
  buckle.position.set(0, 2.98, -0.32);
  socketGroup.add(buckle);

  // --- SENSOR S-03: 6 Internal Socket Pressure FSR Pads + Flex Traces ---
  const socketFsrMat = trackSensor(
    'socket-pressure',
    new THREE.MeshStandardMaterial({
      color: 0xd9a843,
      metalness: 0.78,
      roughness: 0.28,
      emissive: new THREE.Color(0x000000),
      emissiveIntensity: 0,
    }),
    0x22d3ee,
  );
  const fsrPadGeo = trackGeo(new THREE.CylinderGeometry(0.028, 0.028, 0.007, 18));
  const socketPadCoords: Array<[number, number, number, number, number]> = [
    [-0.14, 2.74, 0.15, 0.55, -0.2],
    [0.14, 2.74, 0.15, -0.55, 0.2],
    [-0.18, 2.54, 0.05, 1.15, -0.18],
    [0.18, 2.54, 0.05, -1.15, 0.18],
    [-0.12, 2.86, -0.15, 2.4, 0.15],
    [0.12, 2.86, -0.15, -2.4, -0.15],
  ];
  socketPadCoords.forEach(([px, py, pz, ry, rz]) => {
    const pad = new THREE.Mesh(fsrPadGeo, socketFsrMat);
    pad.position.set(px, py, pz);
    pad.rotation.set(Math.PI / 2, ry, rz);
    socketGroup.add(pad);

    // Copper flex trace leading down toward base connector
    const traceCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(px, py, pz),
      new THREE.Vector3(px * 0.85, py - 0.18, pz * 0.85),
      new THREE.Vector3(px * 0.55, 2.26, pz * 0.55),
    ]);
    const traceGeo = trackGeo(new THREE.TubeGeometry(traceCurve, 10, 0.0035, 6, false));
    const traceMesh = new THREE.Mesh(traceGeo, copperTraceMat);
    socketGroup.add(traceMesh);
  });

  // --- SENSOR S-04: DS18B20 Temperature Sensor Probe (Medial Socket Wall) ---
  const tempSensorMat = trackSensor(
    'temperature',
    new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      metalness: 0.45,
      roughness: 0.32,
      emissive: new THREE.Color(0x000000),
      emissiveIntensity: 0,
    }),
    0x22d3ee,
  );
  const tempProbeGroup = new THREE.Group();
  tempProbeGroup.position.set(-0.22, 2.72, 0.06);
  tempProbeGroup.rotation.set(0, -Math.PI / 2.2, 0.16);
  const tempBoard = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.055, 0.04, 0.012)),
    tempSensorMat,
  );
  const tempCap = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.012, 0.012, 0.025, 14)),
    stainlessMat,
  );
  tempCap.position.set(0, 0.022, 0.004);
  tempProbeGroup.add(tempBoard, tempCap);
  socketGroup.add(tempProbeGroup);

  // --- SENSOR S-05: SI7021 Perforated Humidity Module (Lateral Vent Bay, Image 4) ---
  const humiditySensorMat = trackSensor(
    'humidity',
    new THREE.MeshStandardMaterial({
      color: 0x1e6091,
      metalness: 0.25,
      roughness: 0.35,
      emissive: new THREE.Color(0x000000),
      emissiveIntensity: 0,
    }),
    0x22d3ee,
  );
  const humidityWhiteCapMat = trackSensor(
    'humidity',
    new THREE.MeshStandardMaterial({
      color: 0xe6edf5,
      metalness: 0.08,
      roughness: 0.45,
      emissive: new THREE.Color(0x000000),
      emissiveIntensity: 0,
    }),
    0x22d3ee,
  );
  const humidityGroup = new THREE.Group();
  humidityGroup.position.set(0.245, 2.54, 0.04);
  humidityGroup.rotation.set(0, Math.PI / 2, -0.16);
  const humBoard = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.075, 0.068, 0.014)),
    humiditySensorMat,
  );
  const humGrille = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.036, 0.036, 0.014)),
    humidityWhiteCapMat,
  );
  humGrille.position.set(-0.01, 0, 0.012);
  humidityGroup.add(humBoard, humGrille);
  socketGroup.add(humidityGroup);

  // Distal socket pyramid/titanium base adapter
  const socketAdapter = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.115, 0.082, 0.075, 28)),
    brushedTitaniumMat,
  );
  socketAdapter.position.set(0, 2.15, 0);
  socketGroup.add(socketAdapter);

  // Articulated Kinematic Hierarchy (at rest angles = 0, world coordinates match Panel 01 identically)
  const hipPivot = new THREE.Group();
  hipPivot.position.set(0, 2.85, 0);
  root.add(hipPivot);

  const upperAssembly = new THREE.Group();
  upperAssembly.position.set(0, -2.85, 0);
  upperAssembly.add(socketGroup);
  hipPivot.add(upperAssembly);

  // ============================================================================
  // 2. KNEE / UPPER ROTARY CLEVIS & AS5600 JOINT-ANGLE SENSOR (y: 1.88 -> 2.14)
  // ============================================================================
  const kneeGroup = new THREE.Group();
  kneeGroup.position.set(0, 2.0, 0);

  // Upper titanium clevis arms
  const clevisArmGeo = trackGeo(buildClevisArmGeometry(0.18, 0.13, 0.095, 0.028));
  [-0.082, 0.082].forEach((ax) => {
    const arm = new THREE.Mesh(clevisArmGeo, brushedTitaniumMat);
    arm.position.set(ax, 0.04, 0);
    arm.rotation.y = Math.PI / 2;
    kneeGroup.add(arm);
  });

  // Central anodized rotary barrel
  const kneeBarrel = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.068, 0.068, 0.145, 28)),
    darkAnodizedMat,
  );
  kneeBarrel.rotation.z = Math.PI / 2;
  kneeGroup.add(kneeBarrel);

  // Stainless pivot axle caps
  [-0.098, 0.098].forEach((cx) => {
    const cap = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.036, 0.036, 0.022, 20)),
      stainlessMat,
    );
    cap.rotation.z = Math.PI / 2;
    cap.position.set(cx, 0, 0);
    kneeGroup.add(cap);
  });

  // --- SENSOR S-06: AS5600 Circular Magnetic Encoder Ring (Image 4 mid-right) ---
  const encoderMat = trackSensor(
    'joint-angle',
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: textures.encoderPcbAlbedo,
      metalness: 0.25,
      roughness: 0.35,
      emissive: new THREE.Color(0x000000),
      emissiveIntensity: 0,
    }),
    0x22d3ee,
  );
  const encoderRing = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.062, 0.062, 0.012, 28)),
    encoderMat,
  );
  encoderRing.rotation.z = Math.PI / 2;
  encoderRing.position.set(0.095, 0, 0);
  kneeGroup.add(encoderRing);

  // Lower titanium bridge mating to shin frame
  const lowerKneeBridge = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.065, 0.085, 0.11, 24)),
    brushedTitaniumMat,
  );
  lowerKneeBridge.position.set(0, -0.095, 0);
  kneeGroup.add(lowerKneeBridge);

  upperAssembly.add(kneeGroup);

  // Articulated Knee Flexion Pivot centered at (0, 2.00, 0) in model space
  const kneePivot = new THREE.Group();
  kneePivot.position.set(0, 2.0, 0);
  upperAssembly.add(kneePivot);

  // ============================================================================
  // 3. FENESTRATED CARBON SHIN FRAME & ELECTRONICS BAY (y: 0.66 -> 1.88)
  // ============================================================================
  const shinGroup = new THREE.Group();
  shinGroup.position.set(0, -2.0, 0);

  // Upper and lower shin carbon structural collars
  const upperShinCollar = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.112, 0.125, 0.12, 32)),
    carbonFrameMat,
  );
  upperShinCollar.position.set(0, 1.8, 0);
  shinGroup.add(upperShinCollar);

  const lowerShinCollar = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.105, 0.082, 0.14, 32)),
    carbonFrameMat,
  );
  lowerShinCollar.position.set(0, 0.72, 0);
  shinGroup.add(lowerShinCollar);

  // Twin sculpted lateral carbon-fiber exoskeleton spars (left & right) leaving open front/side bays
  [-1, 1].forEach((side) => {
    const sparCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.072, 0.72, 0.01),
      new THREE.Vector3(side * 0.108, 1.05, 0.015),
      new THREE.Vector3(side * 0.126, 1.42, -0.01),
      new THREE.Vector3(side * 0.105, 1.78, 0.0),
    ]);
    const sparGeo = trackGeo(new THREE.TubeGeometry(sparCurve, 24, 0.032, 12, false));
    const spar = new THREE.Mesh(sparGeo, carbonFrameMat);
    spar.scale.set(0.72, 1, 1.45);
    shinGroup.add(spar);
  });

  // Posterior spine strut
  const spineCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.72, -0.07),
    new THREE.Vector3(0, 1.15, -0.105),
    new THREE.Vector3(0, 1.55, -0.095),
    new THREE.Vector3(0, 1.82, -0.065),
  ]);
  const spineGeo = trackGeo(new THREE.TubeGeometry(spineCurve, 24, 0.036, 12, false));
  const spineMesh = new THREE.Mesh(spineGeo, carbonFrameMat);
  spineMesh.scale.set(1.4, 1, 0.75);
  shinGroup.add(spineMesh);

  // Mid-bay transverse carbon rib separating controller & battery
  const midRib = new THREE.Mesh(
    trackGeo(new THREE.TorusGeometry(0.106, 0.018, 10, 28)),
    carbonFrameMat,
  );
  midRib.rotation.x = Math.PI / 2;
  midRib.position.set(0, 1.05, 0);
  midRib.scale.set(1.05, 0.92, 1);
  shinGroup.add(midRib);

  // Internal machined mounting rail
  const innerRail = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.065, 0.96, 0.028)),
    darkAnodizedMat,
  );
  innerRail.position.set(0, 1.26, -0.035);
  shinGroup.add(innerRail);

  // --- SENSOR S-01: Blue 9-DOF IMU Breakout Module (Upper Shin Bay, Image 4) ---
  const imuMat = trackSensor(
    'imu-motion',
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: textures.imuPcbAlbedo,
      metalness: 0.25,
      roughness: 0.36,
      emissive: new THREE.Color(0x000000),
      emissiveIntensity: 0,
    }),
    0x22d3ee,
  );
  const imuGroup = new THREE.Group();
  imuGroup.position.set(0.03, 1.56, 0.045);
  imuGroup.rotation.set(-0.08, 0.24, 0);
  const imuBoard = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.082, 0.082, 0.014)),
    imuMat,
  );
  const imuChip = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.03, 0.03, 0.008)),
    mattePolymerMat,
  );
  imuChip.position.set(0, 0, 0.009);
  imuGroup.add(imuBoard, imuChip);
  shinGroup.add(imuGroup);

  // --- SENSOR M-07: Main Green Controller PCB (Mid Shin Bay, Image 1 & Image 4) ---
  const controllerMat = trackSensor(
    'controller-module',
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: textures.controllerPcbAlbedo,
      metalness: 0.25,
      roughness: 0.34,
      emissive: new THREE.Color(0x000000),
      emissiveIntensity: 0,
    }),
    0x22d3ee,
  );
  const controllerGroup = new THREE.Group();
  controllerGroup.position.set(0, 1.27, 0.035);
  controllerGroup.rotation.y = 0.14;

  const pcbMesh = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.118, 0.24, 0.016)),
    controllerMat,
  );
  controllerGroup.add(pcbMesh);

  // Raised 3D SoC chip & heat-spreader shield on PCB
  const socChip = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.048, 0.048, 0.012)),
    mattePolymerMat,
  );
  socChip.position.set(0, 0.025, 0.012);
  controllerGroup.add(socChip);

  const pcbLed = new THREE.Mesh(
    trackGeo(new THREE.SphereGeometry(0.007, 10, 10)),
    tealAccentMat,
  );
  pcbLed.position.set(0.032, -0.02, 0.012);
  controllerGroup.add(pcbLed);

  // Multi-wire internal harness routing from controller up to socket & down to ankle
  [
    { color: 0xd97706, x: -0.025 },
    { color: 0x2563eb, x: -0.005 },
    { color: 0xdc2626, x: 0.015 },
  ].forEach(({ color, x }) => {
    const wireCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(x, 1.38, 0.03),
      new THREE.Vector3(x * 1.4, 1.62, 0.01),
      new THREE.Vector3(x, 1.92, -0.01),
    ]);
    const wireMat = trackMat(
      new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.1 }),
    );
    shinGroup.add(
      new THREE.Mesh(trackGeo(new THREE.TubeGeometry(wireCurve, 14, 0.0045, 6, false)), wireMat),
    );
  });

  shinGroup.add(controllerGroup);

  // --- SENSOR M-08: Replaceable Snap-In Battery Module (Lower Shin Bay, Image 1 & 2) ---
  const batteryMat = trackSensor(
    'battery-module',
    new THREE.MeshStandardMaterial({
      color: 0x1d2128,
      metalness: 0.18,
      roughness: 0.56,
      emissive: new THREE.Color(0x000000),
      emissiveIntensity: 0,
    }),
    0x14b8a6,
  );
  const batteryGroup = new THREE.Group();
  batteryGroup.position.set(0, 0.88, 0.038);

  const batteryBody = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.115, 0.21, 0.088)),
    batteryMat,
  );
  batteryGroup.add(batteryBody);

  // Chamfered battery latch collar & gold pogo-pin dock backing
  const batteryDock = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.125, 0.225, 0.024)),
    darkAnodizedMat,
  );
  batteryDock.position.set(0, 0, -0.048);
  batteryGroup.add(batteryDock);

  // 3 vertical charge indicator LED bars (Image 1)
  const ledGreenMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x34d399,
      emissive: new THREE.Color(0x10b981),
      emissiveIntensity: 1.1,
      roughness: 0.2,
    }),
  );
  [-0.028, 0, 0.028].forEach((ly) => {
    const led = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.016, 0.014, 0.008)), ledGreenMat);
    led.position.set(0, ly, 0.046);
    batteryGroup.add(led);
  });
  shinGroup.add(batteryGroup);

  kneePivot.add(shinGroup);

  // ============================================================================
  // 4. ANKLE ROTARY CLEVIS WITH TEAL ACCENT RING (y: 0.42 -> 0.66)
  // ============================================================================
  const anklePivot = new THREE.Group();
  anklePivot.position.set(0, 0.54 - 2.0, -0.02);
  kneePivot.add(anklePivot);

  const ankleGroup = new THREE.Group();
  ankleGroup.position.set(0, 0, 0);

  // Titanium upper ankle yoke
  const ankleArmGeo = trackGeo(buildClevisArmGeometry(0.17, 0.12, 0.088, 0.026));
  [-0.075, 0.075].forEach((ax) => {
    const arm = new THREE.Mesh(ankleArmGeo, brushedTitaniumMat);
    arm.position.set(ax, 0.04, 0);
    arm.rotation.y = Math.PI / 2;
    ankleGroup.add(arm);
  });

  // Ankle rotary drum
  const ankleDrum = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.064, 0.064, 0.135, 28)),
    darkAnodizedMat,
  );
  ankleDrum.rotation.z = Math.PI / 2;
  ankleGroup.add(ankleDrum);

  // Signature electric teal ring around the ankle rotary housing (Image 1)
  const ankleTealRing = new THREE.Mesh(
    trackGeo(new THREE.TorusGeometry(0.065, 0.006, 10, 32)),
    tealAccentMat,
  );
  ankleTealRing.rotation.y = Math.PI / 2;
  ankleTealRing.position.set(0.056, 0, 0);
  ankleGroup.add(ankleTealRing);

  // Lateral stainless bearing caps
  [-0.088, 0.088].forEach((cx) => {
    const cap = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.038, 0.038, 0.024, 20)),
      stainlessMat,
    );
    cap.rotation.z = Math.PI / 2;
    cap.position.set(cx, 0, 0);
    ankleGroup.add(cap);
  });

  // Ankle lower pyramid receiver
  const ankleBase = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.062, 0.078, 0.095, 24)),
    brushedTitaniumMat,
  );
  ankleBase.position.set(0, -0.09, 0);
  ankleGroup.add(ankleBase);

  anklePivot.add(ankleGroup);

  // ============================================================================
  // 5. ARTICULATED MULTI-BLADE CARBON FOOT & PLANTAR FSRs (y: 0.00 -> 0.44)
  // ============================================================================
  const footGroup = new THREE.Group();
  footGroup.position.set(0, -0.54, 0.02);

  // Contoured matte elastomer heel & outsole base resting flush at y = 0.00
  const soleBaseGeo = trackGeo(new THREE.BoxGeometry(0.24, 0.046, 0.78));
  const soleBase = new THREE.Mesh(soleBaseGeo, mattePolymerMat);
  soleBase.position.set(0, 0.023, 0.14);
  footGroup.add(soleBase);

  // Rounded heel cup & toe bumper for clean silhouette
  const heelCup = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.115, 0.12, 0.125, 24)),
    mattePolymerMat,
  );
  heelCup.position.set(0, 0.063, -0.17);
  heelCup.scale.set(1, 1, 1.15);
  footGroup.add(heelCup);

  // --- SENSOR S-02: 5-Zone Plantar Foot Pressure FSR Insole (Image 4 bottom-left) ---
  const footFsrMat = trackSensor(
    'foot-pressure',
    new THREE.MeshStandardMaterial({
      color: 0xd9a843,
      metalness: 0.78,
      roughness: 0.28,
      emissive: new THREE.Color(0x000000),
      emissiveIntensity: 0,
    }),
    0x22d3ee,
  );
  const plantarPadGeo = trackGeo(new THREE.CylinderGeometry(0.036, 0.036, 0.008, 18));
  const plantarCoords: Array<[number, number]> = [
    [0.0, -0.15], // Heel strike
    [0.02, 0.06], // Midfoot
    [-0.065, 0.28], // Medial metatarsal
    [0.055, 0.29], // Lateral metatarsal
    [-0.015, 0.44], // Toe-off hallux
  ];
  plantarCoords.forEach(([px, pz]) => {
    const pad = new THREE.Mesh(plantarPadGeo, footFsrMat);
    pad.position.set(px, 0.052, pz);
    footGroup.add(pad);
  });

  // Copper flex insole trace connecting plantar FSRs
  const insoleCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.052, -0.15),
    new THREE.Vector3(0.02, 0.052, 0.06),
    new THREE.Vector3(0.055, 0.052, 0.29),
    new THREE.Vector3(-0.015, 0.052, 0.44),
  ]);
  footGroup.add(
    new THREE.Mesh(trackGeo(new THREE.TubeGeometry(insoleCurve, 18, 0.004, 6, false)), copperTraceMat),
  );

  // Upper sculpted composite arch bridge (translucent in X-Ray to expose plantar FSRs)
  const archShape = new THREE.Shape();
  archShape.moveTo(-0.22, 0.06);
  archShape.quadraticCurveTo(-0.1, 0.28, 0.02, 0.34);
  archShape.quadraticCurveTo(0.14, 0.2, 0.24, 0.08);
  archShape.lineTo(0.18, 0.05);
  archShape.quadraticCurveTo(0.02, 0.16, -0.16, 0.04);
  archShape.closePath();

  const archBridgeGeo = trackGeo(
    new THREE.ExtrudeGeometry(archShape, {
      depth: 0.2,
      bevelEnabled: true,
      bevelThickness: 0.012,
      bevelSize: 0.01,
      bevelSegments: 2,
    }),
  );
  archBridgeGeo.center();
  const archBridge = new THREE.Mesh(archBridgeGeo, carbonShellMat);
  archBridge.rotation.y = Math.PI / 2;
  archBridge.position.set(0, 0.2, 0.02);
  archBridge.renderOrder = 3;
  footGroup.add(archBridge);

  // 4 Segmented Longitudinal Carbon-Fiber Forefoot Spring Blades (Image 1)
  const forefootBlades: THREE.Mesh[] = [];
  const bladeXOffsets = [-0.086, -0.029, 0.029, 0.086];
  bladeXOffsets.forEach((bx) => {
    const bladeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(bx, 0.14, 0.14),
      new THREE.Vector3(bx, 0.09, 0.32),
      new THREE.Vector3(bx, 0.055, 0.52),
    ]);
    const bladeGeo = trackGeo(new THREE.TubeGeometry(bladeCurve, 14, 0.018, 8, false));
    const blade = new THREE.Mesh(bladeGeo, carbonShellMat);
    blade.scale.set(1.25, 0.55, 1);
    blade.renderOrder = 3;
    forefootBlades.push(blade);
    footGroup.add(blade);
  });

  // Lateral brushed-titanium linkage brackets with dual hex bolts (Image 1)
  const linkShape = new THREE.Shape();
  linkShape.moveTo(-0.11, -0.05);
  linkShape.lineTo(0.09, -0.08);
  linkShape.quadraticCurveTo(0.12, -0.04, 0.08, 0.04);
  linkShape.lineTo(-0.04, 0.11);
  linkShape.quadraticCurveTo(-0.12, 0.06, -0.11, -0.05);
  const linkGeo = trackGeo(
    new THREE.ExtrudeGeometry(linkShape, {
      depth: 0.022,
      bevelEnabled: true,
      bevelThickness: 0.005,
      bevelSize: 0.005,
      bevelSegments: 2,
    }),
  );
  linkGeo.center();

  [-0.118, 0.118].forEach((lx) => {
    const linkBracket = new THREE.Mesh(linkGeo, brushedTitaniumMat);
    linkBracket.rotation.y = Math.PI / 2;
    linkBracket.position.set(lx, 0.25, -0.06);
    footGroup.add(linkBracket);

    // Dual socket-head bolts on linkage
    [-0.04, 0.05].forEach((bz, idx) => {
      const bolt = new THREE.Mesh(
        trackGeo(new THREE.CylinderGeometry(0.013, 0.013, 0.026, 12)),
        stainlessMat,
      );
      bolt.rotation.z = Math.PI / 2;
      bolt.position.set(lx + Math.sign(lx) * 0.006, 0.25 - idx * 0.03, -0.06 + bz);
      footGroup.add(bolt);
    });
  });

  // Internal stainless steel arch shock strut (Image 1)
  const strut = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.014, 0.014, 0.28, 12)),
    stainlessMat,
  );
  strut.position.set(0, 0.12, 0.02);
  strut.rotation.x = Math.PI / 2 - 0.36;
  footGroup.add(strut);

  anklePivot.add(footGroup);

  setShadows(root, true, true);

  // ============================================================================
  // ANIMATED 3D SIGNAL BUS PULSES (Hidden in Panel 01, active in Panel 02 live sim)
  // ============================================================================
  const signalBusGroup = new THREE.Group();
  signalBusGroup.visible = false;
  shinGroup.add(signalBusGroup);

  const pulseSphereGeo = trackGeo(new THREE.SphereGeometry(0.016, 10, 10));
  const signalPaths: Array<{
    sensorId: string;
    curve: THREE.CatmullRomCurve3;
    bead: THREE.Mesh;
    mat: THREE.MeshBasicMaterial;
  }> = [
    {
      sensorId: 'foot-pressure',
      curve: new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.04, 0.56, 0.05),
        new THREE.Vector3(0.05, 0.92, 0.04),
        new THREE.Vector3(0.02, 1.24, 0.05),
      ]),
      bead: new THREE.Mesh(pulseSphereGeo),
      mat: trackMat(new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.95 })),
    },
    {
      sensorId: 'joint-angle',
      curve: new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.09, 2.0, 0.01),
        new THREE.Vector3(0.05, 1.65, 0.04),
        new THREE.Vector3(0.01, 1.32, 0.05),
      ]),
      bead: new THREE.Mesh(pulseSphereGeo),
      mat: trackMat(new THREE.MeshBasicMaterial({ color: 0x14b8a6, transparent: true, opacity: 0.95 })),
    },
    {
      sensorId: 'socket-pressure',
      curve: new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.0, 2.52, 0.19),
        new THREE.Vector3(0.0, 2.02, 0.05),
        new THREE.Vector3(0.0, 1.34, 0.055),
      ]),
      bead: new THREE.Mesh(pulseSphereGeo),
      mat: trackMat(new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.95 })),
    },
    {
      sensorId: 'imu-motion',
      curve: new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.03, 1.56, 0.06),
        new THREE.Vector3(0.02, 1.42, 0.055),
        new THREE.Vector3(0.0, 1.29, 0.05),
      ]),
      bead: new THREE.Mesh(pulseSphereGeo),
      mat: trackMat(new THREE.MeshBasicMaterial({ color: 0x2dd4bf, transparent: true, opacity: 0.95 })),
    },
  ];

  const signalLineMat = trackMat(
    new THREE.MeshBasicMaterial({
      color: 0x14b8a6,
      transparent: true,
      opacity: 0.35,
    }),
  );

  for (const sp of signalPaths) {
    const tubeGeo = trackGeo(new THREE.TubeGeometry(sp.curve, 16, 0.0038, 6, false));
    const tubeMesh = new THREE.Mesh(tubeGeo, signalLineMat);
    signalBusGroup.add(tubeMesh);

    sp.bead.material = sp.mat;
    signalBusGroup.add(sp.bead);
  }

  const _pulsePos = new THREE.Vector3();

  // ============================================================================
  // VISUAL STATE CONTROLLER (Standard, X-Ray, Sensor Highlight + Active Focus)
  // ============================================================================
  const setVisualState = (
    mode: VisualMode,
    activeSensorId: string | null,
    hoveredSensorId: string | null,
    highlightedSensorIds: string[] | null = null,
  ) => {
    // 1. Update exterior shells for Standard vs X-Ray vs Sensor Highlight
    for (const entry of shellMaterials) {
      const { material, baseColor, baseRoughness, xrayOpacity, sensorDimOpacity } = entry;
      if (mode === 'xray') {
        material.transparent = true;
        material.opacity = xrayOpacity;
        material.depthWrite = false;
        material.color.setHex(0x8be9f5);
        material.roughness = 0.25;
      } else if (mode === 'sensors') {
        material.transparent = true;
        material.opacity = sensorDimOpacity;
        material.depthWrite = true;
        material.color.copy(baseColor).multiplyScalar(0.55);
        material.roughness = Math.min(0.85, baseRoughness + 0.25);
      } else {
        material.transparent = false;
        material.opacity = 1;
        material.depthWrite = true;
        material.color.copy(baseColor);
        material.roughness = baseRoughness;
      }
      material.needsUpdate = true;
    }

    // 2. Update sensor highlights
    for (const [sensorId, entries] of Object.entries(sensorMaterials)) {
      const isSelected = activeSensorId === sensorId;
      const isHovered = hoveredSensorId === sensorId;
      const isGroupHighlighted = highlightedSensorIds?.includes(sensorId) ?? false;
      const highlightAll = mode === 'sensors';

      for (const item of entries) {
        if (isSelected || isGroupHighlighted) {
          item.material.emissive.copy(item.highlightColor);
          item.material.emissiveIntensity = isSelected ? 1.45 : 1.25;
        } else if (isHovered) {
          item.material.emissive.copy(item.highlightColor);
          item.material.emissiveIntensity = 1.05;
        } else if (highlightAll) {
          item.material.emissive.copy(item.highlightColor);
          item.material.emissiveIntensity = 0.72;
        } else {
          item.material.emissive.copy(item.baseEmissive);
          item.material.emissiveIntensity = item.baseEmissiveIntensity;
        }
      }
    }
  };

  const setArticulation = (pose: ActivityPose) => {
    root.position.set(0, pose.rootY, pose.rootZ);
    hipPivot.rotation.set(pose.hipPitch, 0, 0);
    kneePivot.rotation.set(pose.kneeFlexion, 0, 0);
    anklePivot.rotation.set(pose.ankleDorsi, 0, pose.ankleRoll);

    // Subtle forefoot blade upward flex during terminal stance
    for (const blade of forefootBlades) {
      blade.rotation.x = -pose.footToeBend * 0.25;
      blade.position.y = pose.footToeBend * 0.04;
    }
  };

  const setMaintenanceSeparation = (amount01: number) => {
    const clamped = Math.max(0, Math.min(1, amount01));
    // Slide front telemetry / socket pressure pod smoothly forward from mounting recess
    podGroup.position.set(0, 2.58 + clamped * 0.06, 0.235 + clamped * 0.34);
    podGroup.rotation.x = -0.18 - clamped * 0.08;
  };

  const updateSignalPulses = (
    elapsedSec: number,
    activeSensors: string[],
    enabled: boolean,
  ) => {
    signalBusGroup.visible = enabled;
    if (!enabled) return;

    signalPaths.forEach((sp, idx) => {
      const active = activeSensors.includes(sp.sensorId);
      sp.bead.visible = active;
      if (active) {
        const rawT = elapsedSec * 0.95 + idx * 0.27;
        const wrappedT = ((rawT % 1) + 1) % 1;
        const t = Number.isFinite(wrappedT) ? Math.min(0.9999, Math.max(0, wrappedT)) : 0;
        sp.curve.getPoint(t, _pulsePos);
        sp.bead.position.copy(_pulsePos);
        const pulseScale = 0.85 + 0.35 * Math.sin(elapsedSec * 7 + idx);
        sp.bead.scale.setScalar(pulseScale);
      }
    });
  };

  return {
    root,
    setVisualState,
    setArticulation,
    setMaintenanceSeparation,
    updateSignalPulses,
    dispose: () => {
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
    },
  };
}
