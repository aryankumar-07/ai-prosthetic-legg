import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { PROSTHETIC_SENSORS } from '../data/prostheticSensors';
import { createProstheticModel, type ProstheticModelRig } from './prostheticModel';
import { createProstheticTextures } from './textures';
import {
  ZOOM_MAX_DISTANCE,
  ZOOM_MIN_DISTANCE,
  computeZoomedCameraPosition,
  getPresetCameraPose,
  ndcToViewportPixels,
  type ProjectedPoint2D,
  type VisualMode,
} from '../utils/viewerState';

export interface StudioSceneCallbacks {
  onReady: () => void;
  onError: (message: string) => void;
  onHotspotsProjected: (positions: Record<string, ProjectedPoint2D>) => void;
  onUserInteraction?: () => void;
}

export interface StudioSceneController {
  setCameraPose: (position: [number, number, number], target: [number, number, number]) => void;
  zoom: (direction: 'in' | 'out') => void;
  setAutoRotate: (enabled: boolean) => void;
  setVisualState: (
    mode: VisualMode,
    activeSensorId: string | null,
    hoveredSensorId: string | null,
  ) => void;
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

export function mountStudioScene(
  container: HTMLElement,
  callbacks: StudioSceneCallbacks,
): StudioSceneController {
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
    callbacks.onError('WebGL rendering is unavailable in this browser.');
    return {
      setCameraPose: () => {},
      zoom: () => {},
      setAutoRotate: () => {},
      setVisualState: () => {},
      dispose: () => {},
    };
  }

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.16;
  renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = !isSoftwareGl;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.style.display = 'block';
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  renderer.domElement.style.touchAction = 'none';

  const initialWidth = Math.max(container.clientWidth, 320);
  const initialHeight = Math.max(container.clientHeight, 320);
  renderer.setSize(initialWidth, initialHeight, false);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const bgColor = new THREE.Color(0x0b0d10);
  scene.background = bgColor;
  scene.fog = new THREE.FogExp2(0x0b0d10, 0.042);

  // Studio environment reflections (mandatory on all devices)
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const envTex = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;
  pmremGenerator.dispose();

  // Camera setup
  const initialPose = getPresetCameraPose('threeQuarter');
  const camera = new THREE.PerspectiveCamera(38, initialWidth / initialHeight, 0.1, 40);
  camera.position.set(...initialPose.position);

  // OrbitControls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(...initialPose.target);
  controls.enableDamping = !isSoftwareGl;
  controls.dampingFactor = 0.065;
  controls.enablePan = false;
  controls.minDistance = ZOOM_MIN_DISTANCE;
  controls.maxDistance = ZOOM_MAX_DISTANCE;
  controls.minPolarAngle = 0.18;
  controls.maxPolarAngle = Math.PI * 0.54;
  controls.rotateSpeed = 0.72;
  controls.zoomSpeed = 0.85;
  controls.autoRotate = false;
  controls.autoRotateSpeed = 0.55;
  controls.update();

  // Three-point warm/cool studio lighting
  const hemiLight = new THREE.HemisphereLight(0xbbe8f2, 0x12151c, 0.9);
  scene.add(hemiLight);

  const keyLight = new THREE.DirectionalLight(0xfff5e8, 2.35);
  keyLight.position.set(3.4, 5.2, 3.8);
  if (!isSoftwareGl) {
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 14;
    keyLight.shadow.camera.left = -2.2;
    keyLight.shadow.camera.right = 2.2;
    keyLight.shadow.camera.top = 3.8;
    keyLight.shadow.camera.bottom = -0.8;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
  }
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xd6e4f0, 0.78);
  fillLight.position.set(-3.5, 2.4, 2.2);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0x22d3ee, 1.45);
  rimLight.position.set(-2.6, 3.6, -3.5);
  scene.add(rimLight);

  // Textures & Multi-Part Prosthetic Model
  const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
  const textures = createProstheticTextures(maxAnisotropy);
  const prostheticRig: ProstheticModelRig = createProstheticModel(textures, isSoftwareGl);
  scene.add(prostheticRig.root);

  // Grounded Studio Plinth & Contact Shadow
  const plinthGroup = new THREE.Group();
  const plinthGeo = new THREE.CylinderGeometry(1.18, 1.24, 0.04, 64);
  const plinthMat = new THREE.MeshStandardMaterial({
    color: 0x11151c,
    metalness: 0.45,
    roughness: 0.48,
  });
  const plinthMesh = new THREE.Mesh(plinthGeo, plinthMat);
  plinthMesh.position.set(0, -0.022, 0.08);
  plinthMesh.receiveShadow = !isSoftwareGl;
  plinthGroup.add(plinthMesh);

  const plinthRingGeo = new THREE.RingGeometry(1.12, 1.135, 64);
  const plinthRingMat = new THREE.MeshBasicMaterial({
    color: 0x14b8a6,
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide,
  });
  const plinthRing = new THREE.Mesh(plinthRingGeo, plinthRingMat);
  plinthRing.rotation.x = -Math.PI / 2;
  plinthRing.position.set(0, 0.002, 0.08);
  plinthGroup.add(plinthRing);

  const shadowGeo = new THREE.PlaneGeometry(1.4, 1.65);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: textures.contactShadow,
    transparent: true,
    opacity: 0.72,
    depthWrite: false,
  });
  const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.set(0, 0.004, 0.14);
  plinthGroup.add(shadowPlane);

  scene.add(plinthGroup);

  if (!isSoftwareGl) {
    renderer.compile(scene, camera);
  }

  // Reusable pre-allocated math objects (zero GC in loop)
  const _projVec = new THREE.Vector3();
  const _desiredCamPos = new THREE.Vector3(...initialPose.position);
  const _desiredTarget = new THREE.Vector3(...initialPose.target);
  let transitionActive = false;
  let autoRotateDesired = !isSoftwareGl;
  controls.autoRotate = autoRotateDesired;

  let frameId = 0;
  let continuousLoopActive = false;
  let renderBusy = false;
  let renderDirty = false;
  let lastTimestamp = performance.now();

  const emitProjectedHotspots = () => {
    const w = renderer.domElement.clientWidth || container.clientWidth;
    const h = renderer.domElement.clientHeight || container.clientHeight;
    if (w <= 0 || h <= 0) return;

    const projected: Record<string, ProjectedPoint2D> = {};
    for (const sensor of PROSTHETIC_SENSORS) {
      _projVec.set(sensor.anchor[0], sensor.anchor[1], sensor.anchor[2]);
      _projVec.project(camera);
      projected[sensor.id] = ndcToViewportPixels(_projVec.x, _projVec.y, _projVec.z, w, h, 26);
    }
    callbacks.onHotspotsProjected(projected);
  };

  function afterDraw(cb: () => void) {
    const gl = renderer.getContext() as WebGL2RenderingContext;
    if (!gl || typeof gl.fenceSync !== 'function') {
      frameId = window.setTimeout(cb, 80);
      return;
    }
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      if (disposed) {
        if (sync) gl.deleteSync(sync);
        return;
      }
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        frameId = window.setTimeout(cb, 80);
      }
    };
    frameId = window.setTimeout(poll, 5);
  }

  const advanceCameraAndRender = (dt: number) => {
    if (transitionActive) {
      const lambda = 7.5;
      camera.position.x = THREE.MathUtils.damp(camera.position.x, _desiredCamPos.x, lambda, dt);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, _desiredCamPos.y, lambda, dt);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, _desiredCamPos.z, lambda, dt);
      controls.target.x = THREE.MathUtils.damp(controls.target.x, _desiredTarget.x, lambda, dt);
      controls.target.y = THREE.MathUtils.damp(controls.target.y, _desiredTarget.y, lambda, dt);
      controls.target.z = THREE.MathUtils.damp(controls.target.z, _desiredTarget.z, lambda, dt);

      const posDist = camera.position.distanceTo(_desiredCamPos);
      const tgtDist = controls.target.distanceTo(_desiredTarget);
      if (posDist < 0.01 && tgtDist < 0.008) {
        camera.position.copy(_desiredCamPos);
        controls.target.copy(_desiredTarget);
        transitionActive = false;
      }
    }

    // Subtle rim light breathing on GPU
    if (!isSoftwareGl && autoRotateDesired) {
      const t = performance.now() * 0.0005;
      rimLight.position.x = -2.6 + Math.sin(t) * 0.45;
    }

    controls.update();
    renderer.render(scene, camera);
    emitProjectedHotspots();
  };

  function requestRender() {
    if (disposed || continuousLoopActive) return;
    if (renderBusy) {
      renderDirty = true;
      return;
    }
    renderBusy = true;
    frameId = requestAnimationFrame((now) => {
      if (disposed) return;
      const dt = Math.min((now - lastTimestamp) / 1000, 0.08);
      lastTimestamp = now;
      renderDirty = false;

      advanceCameraAndRender(dt);

      const done = () => {
        renderBusy = false;
        if (transitionActive) {
          // On software GL during transition, jump smoothly in ~3 steps or finish cleanly
          if (isSoftwareGl) {
            camera.position.copy(_desiredCamPos);
            controls.target.copy(_desiredTarget);
            transitionActive = false;
            renderDirty = true;
          } else {
            renderDirty = true;
          }
        }
        if (renderDirty && !disposed) {
          requestRender();
        }
      };

      if (isSoftwareGl) afterDraw(done);
      else done();
    });
  }

  function startGpuLoop() {
    if (continuousLoopActive || isSoftwareGl || disposed) return;
    continuousLoopActive = true;
    const tick = (now: number) => {
      if (disposed || !continuousLoopActive) return;
      const dt = Math.min((now - lastTimestamp) / 1000, 0.08);
      lastTimestamp = now;
      advanceCameraAndRender(dt);
      frameId = requestAnimationFrame(tick);
    };
    lastTimestamp = performance.now();
    frameId = requestAnimationFrame(tick);
  }

  function stopGpuLoop() {
    continuousLoopActive = false;
  }

  // Stop scripted transitions & notify parent when user manually interacts
  const onControlStart = () => {
    transitionActive = false;
    if (autoRotateDesired) {
      autoRotateDesired = false;
      controls.autoRotate = false;
      stopGpuLoop();
      callbacks.onUserInteraction?.();
    }
    requestRender();
  };

  const onControlChange = () => {
    if (!continuousLoopActive) {
      requestRender();
    }
  };

  controls.addEventListener('start', onControlStart);
  controls.addEventListener('change', onControlChange);

  // Resize observer
  const handleResize = () => {
    if (disposed) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (width <= 0 || height <= 0) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    requestRender();
  };

  const resizeObserver = new ResizeObserver(handleResize);
  resizeObserver.observe(container);
  window.addEventListener('resize', handleResize);

  // WebGL context loss/restored handling
  const onContextLost = (e: Event) => {
    e.preventDefault();
    stopGpuLoop();
    cancelAnimationFrame(frameId);
    clearTimeout(frameId);
    callbacks.onError('3D graphics context was interrupted. Reload to restore.');
  };
  const onContextRestored = () => {
    requestRender();
  };
  renderer.domElement.addEventListener('webglcontextlost', onContextLost);
  renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);

  // Initial draw & startup
  if (!isSoftwareGl && autoRotateDesired) {
    startGpuLoop();
  } else {
    requestRender();
  }
  callbacks.onReady();

  return {
    setCameraPose: (position, target) => {
      _desiredCamPos.set(position[0], position[1], position[2]);
      _desiredTarget.set(target[0], target[1], target[2]);
      if (isSoftwareGl) {
        camera.position.copy(_desiredCamPos);
        controls.target.copy(_desiredTarget);
        transitionActive = false;
        requestRender();
      } else {
        transitionActive = true;
        requestRender();
      }
    },
    zoom: (direction) => {
      const nextPos = computeZoomedCameraPosition(
        [camera.position.x, camera.position.y, camera.position.z],
        [controls.target.x, controls.target.y, controls.target.z],
        direction,
      );
      _desiredCamPos.set(nextPos[0], nextPos[1], nextPos[2]);
      _desiredTarget.copy(controls.target);
      if (isSoftwareGl) {
        camera.position.copy(_desiredCamPos);
        transitionActive = false;
        requestRender();
      } else {
        transitionActive = true;
        requestRender();
      }
    },
    setAutoRotate: (enabled) => {
      autoRotateDesired = enabled && !isSoftwareGl;
      controls.autoRotate = autoRotateDesired;
      if (autoRotateDesired) {
        startGpuLoop();
      } else {
        stopGpuLoop();
        requestRender();
      }
    },
    setVisualState: (mode, activeSensorId, hoveredSensorId) => {
      prostheticRig.setVisualState(mode, activeSensorId, hoveredSensorId);
      requestRender();
    },
    dispose: () => {
      disposed = true;
      stopGpuLoop();
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      controls.removeEventListener('start', onControlStart);
      controls.removeEventListener('change', onControlChange);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);
      controls.dispose();
      prostheticRig.dispose();
      textures.dispose();
      plinthGeo.dispose();
      plinthMat.dispose();
      plinthRingGeo.dispose();
      plinthRingMat.dispose();
      shadowGeo.dispose();
      shadowMat.dispose();
      envTex.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    },
  };
}
