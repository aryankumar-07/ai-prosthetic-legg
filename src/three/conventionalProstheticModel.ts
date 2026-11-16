import * as THREE from 'three';
import { buildThickSocketGeometry } from './prostheticModel';
import { ProstheticTextureSet } from './textures';
import type { ActivityPose } from './activityKinematics';

export interface ConventionalModelRig {
  root: THREE.Group;
  setArticulation: (pose: ActivityPose) => void;
  setSocketVisibility: (xray: boolean, blindPressureHotspot: boolean) => void;
  dispose: () => void;
}

/**
 * Builds a realistic bulky, skin-toned conventional passive mechanical prosthetic leg
 * inspired directly by the user-provided thermoplastic socket + steel pylon + SACH foot references.
 */
export function createConventionalProstheticModel(
  textures: ProstheticTextureSet,
  isSoftwareGl: boolean,
): ConventionalModelRig {
  const root = new THREE.Group();
  root.name = 'Conventional_Passive_Prosthetic';

  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];

  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    geometries.push(g);
    return g;
  };
  const trackMat = <T extends THREE.Material>(m: T): T => {
    materials.push(m);
    return m;
  };

  // --- Bulky Conventional Materials (Matte/Satin Skin-Tone Resin, Cast Aluminum, Steel Pipe, Tan Rubber) ---
  const thermoplasticSkinMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: textures.thermoplasticSkinAlbedo,
      roughnessMap: textures.thermoplasticSkinRoughness,
      roughness: 0.56,
      metalness: 0.03,
    }),
  );

  const foamCuffMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: textures.foamCuffAlbedo,
      roughness: 0.94,
      metalness: 0.0,
    }),
  );

  const brownStrapMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x875f3c,
      roughness: 0.82,
      metalness: 0.04,
    }),
  );

  const castAluminumMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xa2a9b2,
      bumpMap: textures.brushedMetalBump,
      bumpScale: 0.005,
      metalness: 0.78,
      roughness: 0.38,
    }),
  );

  const steelPipeMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xb4bcc4,
      bumpMap: textures.brushedMetalBump,
      bumpScale: 0.004,
      metalness: 0.85,
      roughness: 0.32,
    }),
  );

  const blackClampMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x1b1e23,
      metalness: 0.12,
      roughness: 0.72,
    }),
  );

  const sachRubberFootMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xc8956d,
      roughnessMap: textures.thermoplasticSkinRoughness,
      roughness: 0.74,
      metalness: 0.02,
    }),
  );

  // Subtle unmonitored pressure zone indicator inside opaque socket (only visible in X-Ray scenario preview)
  const unmonitoredZoneMat = trackMat(
    new THREE.MeshBasicMaterial({
      color: 0xd97706,
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
    }),
  );

  // ============================================================================
  // KINEMATIC HIERARCHY MATCHING NEXLIMB EXACTLY
  // ============================================================================
  const hipPivot = new THREE.Group();
  hipPivot.position.set(0, 2.85, 0);
  root.add(hipPivot);

  const upperAssembly = new THREE.Group();
  upperAssembly.position.set(0, -2.85, 0);
  hipPivot.add(upperAssembly);

  // ============================================================================
  // 1. BULKY SKIN-TONED MOLDED THERMOPLASTIC SOCKET & FOAM CUFF (y: 2.15 -> 3.24)
  // ============================================================================
  const socketGroup = new THREE.Group();

  // Wider, thicker, clumsier silhouette than NEXLIMB's carbon shell
  const outerShellGeo = trackGeo(
    buildThickSocketGeometry({
      yBottom: 2.14,
      yTop: 3.16,
      radialSegments: 40,
      heightSegments: 20,
      wallThickness: 0.036,
      rxBottom: 0.165,
      rzBottom: 0.165,
      rxTop: 0.345,
      rzTop: 0.335,
      brimDipFront: 0.06,
      brimRiseBack: 0.085,
      posteriorOffsetZ: -0.025,
    }),
  );
  const outerShell = new THREE.Mesh(outerShellGeo, thermoplasticSkinMat);
  outerShell.renderOrder = 2;
  socketGroup.add(outerShell);

  // Thick protruding beige/off-white foam liner cuff (Image 3 & 4)
  const foamGeo = trackGeo(
    buildThickSocketGeometry({
      yBottom: 2.26,
      yTop: 3.23,
      radialSegments: 36,
      heightSegments: 14,
      wallThickness: 0.032,
      rxBottom: 0.132,
      rzBottom: 0.132,
      rxTop: 0.315,
      rzTop: 0.308,
      brimDipFront: 0.045,
      brimRiseBack: 0.07,
      posteriorOffsetZ: -0.024,
    }),
  );
  const foamCuff = new THREE.Mesh(foamGeo, foamCuffMat);
  foamCuff.renderOrder = 1;
  socketGroup.add(foamCuff);

  // Unmonitored internal irritation/pressure zone (revealed softly only when comparing internal socket visibility)
  const blindZoneMesh = new THREE.Mesh(
    trackGeo(new THREE.SphereGeometry(0.11, 16, 16)),
    unmonitoredZoneMat,
  );
  blindZoneMesh.position.set(0.06, 2.72, 0.19);
  blindZoneMesh.scale.set(1.1, 1.35, 0.55);
  socketGroup.add(blindZoneMesh);

  // Crude thermoforming vertical mold seam ridge on lateral wall
  const seamGeo = trackGeo(new THREE.CylinderGeometry(0.012, 0.008, 0.92, 8));
  const seamMesh = new THREE.Mesh(seamGeo, thermoplasticSkinMat);
  seamMesh.position.set(-0.245, 2.66, 0.01);
  seamMesh.rotation.z = 0.16;
  socketGroup.add(seamMesh);

  // Distal cup & coarse threaded steel adapter stud
  const distalCap = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.155, 0.115, 0.08, 24)),
    thermoplasticSkinMat,
  );
  distalCap.position.set(0, 2.13, 0);
  socketGroup.add(distalCap);

  const blackCollar = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.105, 0.105, 0.055, 24)),
    blackClampMat,
  );
  blackCollar.position.set(0, 2.085, 0);
  socketGroup.add(blackCollar);

  // Brown/tan elastic knee retention strap (Image 2)
  const strapBand = new THREE.Mesh(
    trackGeo(new THREE.TorusGeometry(0.18, 0.018, 8, 28)),
    brownStrapMat,
  );
  strapBand.rotation.x = Math.PI / 2;
  strapBand.position.set(0, 2.06, -0.03);
  strapBand.scale.set(0.95, 1.15, 1);
  socketGroup.add(strapBand);

  upperAssembly.add(socketGroup);

  // ============================================================================
  // 2. EXPOSED CLUNKY CAST-ALUMINUM MECHANICAL HINGE (y: 1.88 -> 2.12, Image 2)
  // ============================================================================
  const kneeBlockGroup = new THREE.Group();
  kneeBlockGroup.position.set(0, 2.0, 0);

  // Boxy cast-metal mechanical bracket & axle housing
  const upperBracket = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.175, 0.075, 0.165)),
    castAluminumMat,
  );
  upperBracket.position.set(0, 0.05, 0.01);
  kneeBlockGroup.add(upperBracket);

  const centralCylinder = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.068, 0.068, 0.19, 20)),
    castAluminumMat,
  );
  centralCylinder.rotation.z = Math.PI / 2;
  kneeBlockGroup.add(centralCylinder);

  // Protruding black rubber lock / bumper knob & large hex nut (Image 2)
  const knobStem = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.032, 0.032, 0.07, 14)),
    blackClampMat,
  );
  knobStem.rotation.z = Math.PI / 2;
  knobStem.position.set(-0.115, 0, 0);
  kneeBlockGroup.add(knobStem);

  const backStopper = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.095, 0.065, 0.09)),
    blackClampMat,
  );
  backStopper.position.set(0, -0.01, -0.105);
  kneeBlockGroup.add(backStopper);

  upperAssembly.add(kneeBlockGroup);

  // Knee Pivot centered identically at (0, 2.00, 0)
  const kneePivot = new THREE.Group();
  kneePivot.position.set(0, 2.0, 0);
  upperAssembly.add(kneePivot);

  // ============================================================================
  // 3. BASIC STEEL/ALUMINUM PYLON TUBE & BLACK CLAMP BANDS (y: 0.62 -> 1.92)
  // ============================================================================
  const pylonGroup = new THREE.Group();
  pylonGroup.position.set(0, -2.0, 0);

  // Lower hinge yoke block
  const lowerBracket = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.135, 0.18, 0.12)),
    castAluminumMat,
  );
  lowerBracket.position.set(0, 1.88, 0);
  pylonGroup.add(lowerBracket);

  // Simple exposed cylindrical pylon pipe extending cleanly into ankle adapter (Images 1 & 4)
  const pylonPipe = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.052, 0.052, 1.36, 24)),
    steelPipeMat,
  );
  pylonPipe.position.set(0, 1.15, -0.015);
  pylonGroup.add(pylonPipe);

  // Upper & lower chunky black plastic clamp collars with pinch screws (Images 1 & 4)
  [1.76, 0.72].forEach((cy) => {
    const clamp = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.072, 0.072, 0.09, 20)),
      blackClampMat,
    );
    clamp.position.set(0, cy, -0.015);
    pylonGroup.add(clamp);

    const pinchBolt = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.014, 0.014, 0.04, 10)),
      castAluminumMat,
    );
    pinchBolt.rotation.z = Math.PI / 2;
    pinchBolt.position.set(0.068, cy, 0.015);
    pylonGroup.add(pinchBolt);
  });

  // Lower steel ankle pyramid adapter collar seated directly onto the SACH foot top (zero gap)
  const ankleCollar = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.068, 0.098, 0.22, 20)),
    castAluminumMat,
  );
  ankleCollar.position.set(0, 0.49, -0.02);
  pylonGroup.add(ankleCollar);

  kneePivot.add(pylonGroup);

  // ============================================================================
  // 4. ANKLE PIVOT & CHUNKY TAN RUBBER SACH FOOT (y: 0.00 -> 0.54, Images 2, 3, 4)
  // ============================================================================
  const anklePivot = new THREE.Group();
  anklePivot.position.set(0, 0.54 - 2.0, -0.02);
  kneePivot.add(anklePivot);

  const footGroup = new THREE.Group();
  footGroup.position.set(0, -0.54, 0.02);

  // Chunky upper ankle rubber cuff where pylon inserts flush (Images 2 & 4)
  const sachAnkleCup = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.116, 0.132, 0.28, 24)),
    sachRubberFootMat,
  );
  sachAnkleCup.position.set(0, 0.28, -0.04);
  footGroup.add(sachAnkleCup);

  // Black rubber trim ring seating onto the SACH ankle collar (Image 4)
  const sachTrimRing = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.118, 0.118, 0.032, 24)),
    blackClampMat,
  );
  sachTrimRing.position.set(0, 0.415, -0.04);
  footGroup.add(sachTrimRing);

  // Solid monolithic tan SACH foot block (no spring blades, no arch cutout)
  const footShape = new THREE.Shape();
  footShape.moveTo(-0.22, 0.0);
  footShape.lineTo(0.46, 0.0);
  footShape.quadraticCurveTo(0.54, 0.02, 0.53, 0.08);
  footShape.quadraticCurveTo(0.44, 0.13, 0.24, 0.15);
  footShape.quadraticCurveTo(0.08, 0.2, -0.04, 0.23);
  footShape.lineTo(-0.19, 0.2);
  footShape.quadraticCurveTo(-0.26, 0.1, -0.22, 0.0);

  const sachBodyGeo = trackGeo(
    new THREE.ExtrudeGeometry(footShape, {
      depth: 0.23,
      bevelEnabled: true,
      bevelThickness: 0.022,
      bevelSize: 0.02,
      bevelSegments: 2,
      curveSegments: 14,
    }),
  );
  sachBodyGeo.center();
  const sachBody = new THREE.Mesh(sachBodyGeo, sachRubberFootMat);
  sachBody.rotation.y = -Math.PI / 2;
  sachBody.position.set(0, 0.12, 0.14);
  footGroup.add(sachBody);

  // Five static sculpted rubber toes on the forefoot (Images 2, 3, 4)
  [-0.085, -0.042, 0.0, 0.042, 0.082].forEach((tx, idx) => {
    const toeLen = idx === 0 ? 0.11 : 0.105 - idx * 0.008;
    const toeMesh = new THREE.Mesh(
      trackGeo(new THREE.CapsuleGeometry(0.021, toeLen, 4, 8)),
      sachRubberFootMat,
    );
    toeMesh.rotation.x = Math.PI / 2;
    toeMesh.position.set(tx, 0.036, 0.49 - idx * 0.01);
    footGroup.add(toeMesh);
  });

  anklePivot.add(footGroup);

  root.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      child.castShadow = !isSoftwareGl;
      child.receiveShadow = !isSoftwareGl;
    }
  });

  const setArticulation = (pose: ActivityPose) => {
    // Conventional exhibits subtle mechanical impact jolt vertically during stiff heel strikes
    root.position.set(0, pose.rootY - pose.impactJolt * 0.65, pose.rootZ);
    hipPivot.rotation.set(pose.hipPitch, 0, 0);
    kneePivot.rotation.set(pose.kneeFlexion, 0, pose.impactJolt * 0.45);
    anklePivot.rotation.set(pose.ankleDorsi, 0, pose.ankleRoll);
  };

  const setSocketVisibility = (xray: boolean, blindPressureHotspot: boolean) => {
    if (xray) {
      thermoplasticSkinMat.transparent = true;
      thermoplasticSkinMat.opacity = 0.28;
      thermoplasticSkinMat.depthWrite = false;
      foamCuffMat.transparent = true;
      foamCuffMat.opacity = 0.22;
      foamCuffMat.depthWrite = false;
      unmonitoredZoneMat.opacity = blindPressureHotspot ? 0.58 : 0.25;
    } else {
      thermoplasticSkinMat.transparent = false;
      thermoplasticSkinMat.opacity = 1;
      thermoplasticSkinMat.depthWrite = true;
      foamCuffMat.transparent = false;
      foamCuffMat.opacity = 1;
      foamCuffMat.depthWrite = true;
      unmonitoredZoneMat.opacity = 0;
    }
    thermoplasticSkinMat.needsUpdate = true;
    foamCuffMat.needsUpdate = true;
  };

  return {
    root,
    setArticulation,
    setSocketVisibility,
    dispose: () => {
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
    },
  };
}
