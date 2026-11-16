import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  computeActivityPose,
  type ActivityId,
  type ProstheticVariant,
  type TerrainCondition,
} from './activityKinematics';
import {
  createConventionalProstheticModel,
  type ConventionalModelRig,
} from './conventionalProstheticModel';
import { createProstheticModel, type ProstheticModelRig } from './prostheticModel';
import { createProstheticTextures } from './textures';
import {
  ZOOM_MAX_DISTANCE,
  ZOOM_MIN_DISTANCE,
  computeZoomedCameraPosition,
  getPresetCameraPose,
} from '../utils/viewerState';

export interface ComparisonViewportCallbacks {
  onReady: () => void;
  onError: (message: string) => void;
  onCameraSync?: (position: [number, number, number], target: [number, number, number]) => void;
  onSimulationTick?: (phase: number, elapsedSec: number) => void;
}

export interface ComparisonViewportState {
  activityId: ActivityId;
  terrainCondition: TerrainCondition;
  isPlaying: boolean;
  slowMotion: boolean;
  socketXray: boolean;
  blindHotspot: boolean;
  highlightedSensors: string[];
  maintenanceSeparation: number;
  inViewport: boolean;
}

export interface ComparisonViewportController {
  updateState: (next: Partial<ComparisonViewportState>) => void;
  setPhaseImmediate: (phase: number) => void;
  setCameraPose: (position: [number, number, number], target: [number, number, number]) => void;
  applyExternalCamera: (position: [number, number, number], target: [number, number, number]) => void;
  zoom: (direction: 'in' | 'out') => void;
  dispose: () => void;
}

function detectSoftwareWebGL(): boolean {
  try {
    const probeCanvas = document.createElement('canvas');
    const gl = probeCanvas.getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

export function mountComparisonViewport(
  container: HTMLElement,
  variant: ProstheticVariant,
  initialState: ComparisonViewportState,
  callbacks: ComparisonViewportCallbacks,
): ComparisonViewportController {
  const isSoftwareGl = detectSoftwareWebGL();
  let disposed = false;

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
  } catch {
    callbacks.onError('WebGL rendering is unavailable.');
    return {
      updateState: () => {},
      setPhaseImmediate: () => {},
      setCameraPose: () => {},
      applyExternalCamera: () => {},
      zoom: () => {},
      dispose: () => {},
    };
  }

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.14;
  renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = !isSoftwareGl;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.style.display = 'block';
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  renderer.domElement.style.touchAction = 'none';

  const initialWidth = Math.max(container.clientWidth, 280);
  const initialHeight = Math.max(container.clientHeight, 280);
  renderer.setSize(initialWidth, initialHeight, false);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b0e13);
  scene.fog = new THREE.FogExp2(0x0b0e13, 0.04);

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const envTex = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;
  pmremGenerator.dispose();

  // Default side-ish 3/4 framing positioned slightly lower so foot stays comfortably above bottom caption overlay
  const camera = new THREE.PerspectiveCamera(38, initialWidth / initialHeight, 0.1, 40);
  camera.position.set(4.55, 2.05, 4.55);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0.0, 1.24, 0.08);
  controls.enableDamping = !isSoftwareGl;
  controls.dampingFactor = 0.07;
  controls.enablePan = false;
  controls.minDistance = ZOOM_MIN_DISTANCE;
  controls.maxDistance = ZOOM_MAX_DISTANCE;
  controls.minPolarAngle = 0.2;
  controls.maxPolarAngle = Math.PI * 0.56;
  controls.rotateSpeed = 0.72;
  controls.zoomSpeed = 0.85;
  controls.update();

  // Lighting matching Panel 01 studio consistency
  const hemiLight = new THREE.HemisphereLight(0xbce8f2, 0x14171f, 0.92);
  scene.add(hemiLight);

  const keyLight = new THREE.DirectionalLight(0xfff5e8, 2.3);
  keyLight.position.set(3.4, 5.2, 3.8);
  if (!isSoftwareGl) {
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 14;
    keyLight.shadow.camera.left = -2.4;
    keyLight.shadow.camera.right = 2.4;
    keyLight.shadow.camera.top = 3.8;
    keyLight.shadow.camera.bottom = -0.8;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
  }
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xd6e4f0, 0.75);
  fillLight.position.set(-3.4, 2.4, 2.2);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(
    variant === 'nexlimb' ? 0x22d3ee : 0x94a3b8,
    variant === 'nexlimb' ? 1.45 : 0.85,
  );
  rimLight.position.set(-2.6, 3.6, -3.5);
  scene.add(rimLight);

  const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
  const textures = createProstheticTextures(maxAnisotropy);

  // Build Variant Model
  let nexlimbRig: ProstheticModelRig | null = null;
  let conventionalRig: ConventionalModelRig | null = null;

  if (variant === 'nexlimb') {
    nexlimbRig = createProstheticModel(textures, isSoftwareGl);
    scene.add(nexlimbRig.root);
  } else {
    conventionalRig = createConventionalProstheticModel(textures, isSoftwareGl);
    scene.add(conventionalRig.root);
  }

  // ============================================================================
  // DYNAMIC 3D ACTIVITY ENVIRONMENTS (Track, Stairs, Uneven Blocks, Chair, Pad)
  // ============================================================================
  const envGeoList: THREE.BufferGeometry[] = [];
  const envMatList: THREE.Material[] = [];
  const trackEnvGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    envGeoList.push(g);
    return g;
  };
  const trackEnvMat = <T extends THREE.Material>(m: T): T => {
    envMatList.push(m);
    return m;
  };

  const trackFloorMat = trackEnvMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: textures.walkwayGridAlbedo,
      roughness: 0.72,
      metalness: 0.18,
    }),
  );
  const darkMetalMat = trackEnvMat(
    new THREE.MeshStandardMaterial({
      color: 0x161b24,
      roughness: 0.55,
      metalness: 0.38,
    }),
  );
  const edgeAccentMat = trackEnvMat(
    new THREE.MeshBasicMaterial({
      color: variant === 'nexlimb' ? 0x14b8a6 : 0x64748b,
      transparent: true,
      opacity: 0.45,
    }),
  );

  // 1. Moving Treadmill Walkway (Walking & Incline)
  const walkingEnv = new THREE.Group();
  const trackSlab = new THREE.Mesh(
    trackEnvGeo(new THREE.BoxGeometry(1.4, 0.06, 2.8)),
    trackFloorMat,
  );
  trackSlab.position.set(0, -0.032, 0.12);
  trackSlab.receiveShadow = !isSoftwareGl;
  walkingEnv.add(trackSlab);
  scene.add(walkingEnv);

  // 2. Stepped Staircase Group (Climbing & Descending)
  const stairsEnv = new THREE.Group();
  for (let i = -1; i <= 2; i++) {
    const stepMesh = new THREE.Mesh(
      trackEnvGeo(new THREE.BoxGeometry(1.35, 0.24, 0.52)),
      darkMetalMat,
    );
    stepMesh.position.set(0, i * 0.22 - 0.12, i * 0.52 + 0.08);
    stepMesh.receiveShadow = !isSoftwareGl;
    stairsEnv.add(stepMesh);

    const nosing = new THREE.Mesh(
      trackEnvGeo(new THREE.BoxGeometry(1.36, 0.018, 0.03)),
      edgeAccentMat,
    );
    nosing.position.set(0, i * 0.22 - 0.005, i * 0.52 - 0.165);
    stairsEnv.add(nosing);
  }
  scene.add(stairsEnv);

  // 3. Uneven Surface Slabs (Uneven Terrain)
  const unevenEnv = new THREE.Group();
  const basePlate = new THREE.Mesh(
    trackEnvGeo(new THREE.BoxGeometry(1.6, 0.05, 2.6)),
    darkMetalMat,
  );
  basePlate.position.set(0, -0.035, 0.12);
  unevenEnv.add(basePlate);

  const stoneMat = trackEnvMat(
    new THREE.MeshStandardMaterial({
      color: 0x262d38,
      roughness: 0.85,
      metalness: 0.1,
    }),
  );
  const blockSpecs: Array<[number, number, number, number, number]> = [
    [-0.22, -0.01, -0.5, 0.12, -0.1],
    [0.18, 0.01, -0.08, -0.14, 0.08],
    [-0.14, 0.02, 0.36, 0.1, 0.12],
    [0.2, 0.0, 0.78, -0.09, -0.11],
  ];
  blockSpecs.forEach(([bx, by, bz, rx, rz]) => {
    const slab = new THREE.Mesh(trackEnvGeo(new THREE.BoxGeometry(0.58, 0.08, 0.42)), stoneMat);
    slab.position.set(bx, by, bz);
    slab.rotation.set(rx, 0, rz);
    slab.receiveShadow = !isSoftwareGl;
    unevenEnv.add(slab);
  });
  scene.add(unevenEnv);

  // 4. Stationary Balance Pad (Standing)
  const standingEnv = new THREE.Group();
  const padMesh = new THREE.Mesh(
    trackEnvGeo(new THREE.CylinderGeometry(1.02, 1.08, 0.045, 48)),
    darkMetalMat,
  );
  padMesh.position.set(0, -0.024, 0.08);
  padMesh.receiveShadow = !isSoftwareGl;
  standingEnv.add(padMesh);
  const padRing = new THREE.Mesh(
    trackEnvGeo(new THREE.RingGeometry(0.95, 0.97, 48)),
    edgeAccentMat,
  );
  padRing.rotation.x = -Math.PI / 2;
  padRing.position.set(0, 0.002, 0.08);
  standingEnv.add(padRing);
  scene.add(standingEnv);

  // 5. Studio Clinic Chair (Sitting & Standing Up)
  const sittingEnv = new THREE.Group();
  const chairFloor = new THREE.Mesh(
    trackEnvGeo(new THREE.CylinderGeometry(1.15, 1.2, 0.04, 48)),
    darkMetalMat,
  );
  chairFloor.position.set(0, -0.022, -0.2);
  chairFloor.receiveShadow = !isSoftwareGl;
  sittingEnv.add(chairFloor);

  const chairSeat = new THREE.Mesh(
    trackEnvGeo(new THREE.BoxGeometry(0.95, 0.09, 0.85)),
    stoneMat,
  );
  chairSeat.position.set(0, 1.62, -0.58);
  sittingEnv.add(chairSeat);

  const chairBack = new THREE.Mesh(
    trackEnvGeo(new THREE.BoxGeometry(0.95, 0.88, 0.09)),
    stoneMat,
  );
  chairBack.position.set(0, 2.1, -0.96);
  chairBack.rotation.x = -0.08;
  sittingEnv.add(chairBack);

  [-0.4, 0.4].forEach((lx) => {
    [-0.22, -0.92].forEach((lz) => {
      const leg = new THREE.Mesh(
        trackEnvGeo(new THREE.CylinderGeometry(0.028, 0.028, 1.62, 12)),
        darkMetalMat,
      );
      leg.position.set(lx, 0.81, lz);
      sittingEnv.add(leg);
    });
  });
  scene.add(sittingEnv);

  // Ground contact shadow
  const shadowPlane = new THREE.Mesh(
    trackEnvGeo(new THREE.PlaneGeometry(1.4, 1.65)),
    trackEnvMat(
      new THREE.MeshBasicMaterial({
        map: textures.contactShadow,
        transparent: true,
        opacity: 0.68,
        depthWrite: false,
      }),
    ),
  );
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.set(0, 0.005, 0.14);
  scene.add(shadowPlane);

  if (!isSoftwareGl) {
    renderer.compile(scene, camera);
  }

  // Mutable simulation state
  const state: ComparisonViewportState = { ...initialState };
  let simPhase = 0.08;
  let elapsedSec = 0;
  let lastTimestamp = performance.now();
  let lastUiNotifyMs = 0;
  let suppressCameraSync = false;
  let frameId = 0;

  const _desiredCamPos = new THREE.Vector3().copy(camera.position);
  const _desiredTarget = new THREE.Vector3().copy(controls.target);
  let camTransitionActive = false;

  const syncEnvironmentVisibility = () => {
    const act = state.activityId;
    const isUneven = act === 'uneven-terrain' || state.terrainCondition === 'uneven';
    walkingEnv.visible = (act === 'walking' && !isUneven);
    walkingEnv.rotation.x = state.terrainCondition === 'incline' ? -0.11 : 0;
    stairsEnv.visible = act === 'climbing-stairs' || act === 'descending-stairs';
    stairsEnv.rotation.y = act === 'descending-stairs' ? Math.PI : 0;
    unevenEnv.visible = isUneven;
    standingEnv.visible = act === 'standing';
    sittingEnv.visible = act === 'sitting';
  };

  const applyVisualSettings = () => {
    if (nexlimbRig) {
      nexlimbRig.setVisualState(
        state.socketXray ? 'xray' : 'standard',
        null,
        null,
        state.highlightedSensors,
      );
      nexlimbRig.setMaintenanceSeparation?.(state.maintenanceSeparation);
    }
    if (conventionalRig) {
      conventionalRig.setSocketVisibility(state.socketXray, state.blindHotspot);
    }
    syncEnvironmentVisibility();
  };

  applyVisualSettings();

  const updateSimulationStep = (dt: number) => {
    const safeDt = Number.isFinite(dt) && dt > 0 ? dt : 0;
    if (state.isPlaying && safeDt > 0) {
      const speedScale = state.slowMotion ? 0.4 : 1.0;
      const cycleHz = state.activityId === 'standing' ? 0.35 : state.activityId === 'sitting' ? 0.25 : 0.72;
      const rawPhase = simPhase + safeDt * cycleHz * speedScale;
      simPhase = ((rawPhase % 1) + 1) % 1;
      elapsedSec = Math.max(0, elapsedSec + safeDt * speedScale);
      textures.walkwayGridAlbedo.offset.y =
        (((textures.walkwayGridAlbedo.offset.y - safeDt * 1.45 * speedScale) % 1) + 1) % 1;
    }

    const pose = computeActivityPose(
      state.activityId,
      simPhase,
      variant,
      state.terrainCondition,
    );

    if (nexlimbRig) {
      nexlimbRig.setArticulation?.(pose);
      nexlimbRig.updateSignalPulses?.(
        elapsedSec,
        state.highlightedSensors,
        state.isPlaying || state.highlightedSensors.length > 0,
      );
    }
    if (conventionalRig) {
      conventionalRig.setArticulation(pose);
    }

    if (camTransitionActive) {
      const lambda = 8;
      camera.position.x = THREE.MathUtils.damp(camera.position.x, _desiredCamPos.x, lambda, safeDt);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, _desiredCamPos.y, lambda, safeDt);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, _desiredCamPos.z, lambda, safeDt);
      controls.target.x = THREE.MathUtils.damp(controls.target.x, _desiredTarget.x, lambda, safeDt);
      controls.target.y = THREE.MathUtils.damp(controls.target.y, _desiredTarget.y, lambda, safeDt);
      controls.target.z = THREE.MathUtils.damp(controls.target.z, _desiredTarget.z, lambda, safeDt);

      if (camera.position.distanceTo(_desiredCamPos) < 0.01) {
        camera.position.copy(_desiredCamPos);
        controls.target.copy(_desiredTarget);
        camTransitionActive = false;
      }
    }

    controls.update();
    renderer.render(scene, camera);

    const nowMs = performance.now();
    if (nowMs - lastUiNotifyMs >= 100) {
      lastUiNotifyMs = nowMs;
      callbacks.onSimulationTick?.(simPhase, elapsedSec);
    }
  };

  function afterDraw(cb: () => void) {
    const gl = renderer.getContext() as WebGL2RenderingContext;
    if (!gl || typeof gl.fenceSync !== 'function') {
      frameId = window.setTimeout(cb, 85);
      return;
    }
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      if (disposed) {
        if (sync) gl.deleteSync(sync);
        return;
      }
      const syncState = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (syncState === gl.UNSIGNALED) {
        frameId = window.setTimeout(poll, 6);
      } else {
        if (sync) gl.deleteSync(sync);
        frameId = window.setTimeout(cb, 85);
      }
    };
    frameId = window.setTimeout(poll, 6);
  }

  let loopRunning = false;

  const tick = (now: number) => {
    if (disposed || !loopRunning) return;
    const dt = Math.max(0, Math.min((now - lastTimestamp) / 1000, 0.09));
    lastTimestamp = now;
    try {
      updateSimulationStep(dt);
    } catch {
      loopRunning = false;
      return;
    }

    if (!state.inViewport || (!state.isPlaying && !camTransitionActive)) {
      loopRunning = false;
      return;
    }

    if (isSoftwareGl) {
      afterDraw(() => {
        if (!disposed && loopRunning) {
          frameId = requestAnimationFrame(tick);
        }
      });
    } else {
      frameId = requestAnimationFrame(tick);
    }
  };

  const ensureLoopActive = () => {
    if (disposed) return;
    if (!state.inViewport) {
      loopRunning = false;
      return;
    }
    if (!loopRunning) {
      loopRunning = true;
      lastTimestamp = performance.now();
      frameId = requestAnimationFrame(tick);
    }
  };

  const drawSingleFrame = () => {
    if (disposed) return;
    updateSimulationStep(0);
  };

  // Camera sync listeners
  const onControlStart = () => {
    camTransitionActive = false;
  };
  const onControlChange = () => {
    if (!suppressCameraSync) {
      callbacks.onCameraSync?.(
        [camera.position.x, camera.position.y, camera.position.z],
        [controls.target.x, controls.target.y, controls.target.z],
      );
    }
    if (!loopRunning) {
      drawSingleFrame();
    }
  };

  controls.addEventListener('start', onControlStart);
  controls.addEventListener('change', onControlChange);

  const handleResize = () => {
    if (disposed) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (width <= 0 || height <= 0) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    drawSingleFrame();
  };

  const resizeObserver = new ResizeObserver(handleResize);
  resizeObserver.observe(container);
  window.addEventListener('resize', handleResize);

  const onContextLost = (e: Event) => {
    e.preventDefault();
    loopRunning = false;
    cancelAnimationFrame(frameId);
    clearTimeout(frameId);
    callbacks.onError('3D simulation context interrupted.');
  };
  const onContextRestored = () => {
    drawSingleFrame();
    ensureLoopActive();
  };
  renderer.domElement.addEventListener('webglcontextlost', onContextLost);
  renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);

  // Initial draw & startup
  drawSingleFrame();
  if (state.inViewport && state.isPlaying) {
    ensureLoopActive();
  }
  callbacks.onReady();

  return {
    updateState: (next) => {
      Object.assign(state, next);
      applyVisualSettings();
      if (state.inViewport && (state.isPlaying || camTransitionActive)) {
        ensureLoopActive();
      } else {
        drawSingleFrame();
      }
    },
    setPhaseImmediate: (phase) => {
      simPhase = phase;
      drawSingleFrame();
      callbacks.onSimulationTick?.(simPhase, elapsedSec);
    },
    setCameraPose: (position, target) => {
      _desiredCamPos.set(...position);
      _desiredTarget.set(...target);
      if (isSoftwareGl) {
        camera.position.copy(_desiredCamPos);
        controls.target.copy(_desiredTarget);
        camTransitionActive = false;
        drawSingleFrame();
      } else {
        camTransitionActive = true;
        ensureLoopActive();
      }
    },
    applyExternalCamera: (position, target) => {
      suppressCameraSync = true;
      const prevDamping = controls.enableDamping;
      controls.enableDamping = false;
      camera.position.set(...position);
      controls.target.set(...target);
      controls.update();
      controls.enableDamping = prevDamping;
      suppressCameraSync = false;
      if (!loopRunning) {
        drawSingleFrame();
      }
    },
    zoom: (direction) => {
      const nextPos = computeZoomedCameraPosition(
        [camera.position.x, camera.position.y, camera.position.z],
        [controls.target.x, controls.target.y, controls.target.z],
        direction,
      );
      _desiredCamPos.set(...nextPos);
      _desiredTarget.copy(controls.target);
      if (isSoftwareGl) {
        camera.position.copy(_desiredCamPos);
        camTransitionActive = false;
        drawSingleFrame();
      } else {
        camTransitionActive = true;
        ensureLoopActive();
      }
    },
    dispose: () => {
      disposed = true;
      loopRunning = false;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      controls.removeEventListener('start', onControlStart);
      controls.removeEventListener('change', onControlChange);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);
      controls.dispose();
      nexlimbRig?.dispose();
      conventionalRig?.dispose();
      textures.dispose();
      envGeoList.forEach((g) => g.dispose());
      envMatList.forEach((m) => m.dispose());
      envTex.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    },
  };
}

export function getComparisonCameraPreset(preset: 'front' | 'side' | 'threeQuarter'): {
  position: [number, number, number];
  target: [number, number, number];
} {
  if (preset === 'side') {
    return { position: [5.95, 1.75, 0.08], target: [0.0, 1.24, 0.08] };
  }
  if (preset === 'front') {
    return { position: [0.0, 1.72, 6.1], target: [0.0, 1.24, 0.06] };
  }
  const base = getPresetCameraPose('threeQuarter');
  return {
    position: [4.55, 2.05, 4.55],
    target: [base.target[0], 1.24, 0.08],
  };
}
