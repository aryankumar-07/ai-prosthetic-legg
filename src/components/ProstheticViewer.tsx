import { useEffect, useRef, useState } from 'react';
import { PROSTHETIC_SENSORS } from '../data/prostheticSensors';
import { mountStudioScene, type StudioSceneController } from '../three/studioScene';
import {
  getPresetCameraPose,
  getSensorById,
  type CameraViewMode,
  type ProjectedPoint2D,
  type VisualMode,
} from '../utils/viewerState';
import { ComponentInfoPanel } from './ComponentInfoPanel';
import { SensorHotspots } from './SensorHotspots';
import { ViewerControls } from './ViewerControls';

interface ProstheticViewerProps {
  viewMode: CameraViewMode;
  visualMode: VisualMode;
  autoRotate: boolean;
  activeSensorId: string | null;
  cameraNonce: number;
  onChangeViewMode: (mode: CameraViewMode) => void;
  onChangeVisualMode: (mode: VisualMode) => void;
  onToggleAutoRotate: (next?: boolean) => void;
  onSelectSensor: (sensorId: string | null) => void;
  onStepSensor: (direction: 1 | -1) => void;
  onResetCamera: () => void;
}

export function ProstheticViewer({
  viewMode,
  visualMode,
  autoRotate,
  activeSensorId,
  cameraNonce,
  onChangeViewMode,
  onChangeVisualMode,
  onToggleAutoRotate,
  onSelectSensor,
  onStepSensor,
  onResetCamera,
}: ProstheticViewerProps) {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<StudioSceneController | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [webGLError, setWebGLError] = useState<string | null>(null);
  const [hoveredSensorId, setHoveredSensorId] = useState<string | null>(null);
  const [controlsCollapsed, setControlsCollapsed] = useState(false);
  const [projectedPositions, setProjectedPositions] = useState<
    Record<string, ProjectedPoint2D>
  >({});

  // Keep latest callbacks in refs so mount useEffect stays single-run
  const onToggleAutoRotateRef = useRef(onToggleAutoRotate);
  onToggleAutoRotateRef.current = onToggleAutoRotate;

  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    const controller = mountStudioScene(container, {
      onReady: () => {
        setIsLoading(false);
      },
      onError: (msg) => {
        setWebGLError(msg);
        setIsLoading(false);
      },
      onHotspotsProjected: (positions) => {
        setProjectedPositions(positions);
      },
      onUserInteraction: () => {
        onToggleAutoRotateRef.current(false);
      },
    });

    controllerRef.current = controller;

    return () => {
      controller.dispose();
      controllerRef.current = null;
    };
  }, []);

  // Sync visual mode & active/hovered sensor highlights
  useEffect(() => {
    controllerRef.current?.setVisualState(visualMode, activeSensorId, hoveredSensorId);
  }, [visualMode, activeSensorId, hoveredSensorId]);

  // Sync auto-rotate flag
  useEffect(() => {
    controllerRef.current?.setAutoRotate(autoRotate);
  }, [autoRotate]);

  // Sync preset camera view changes
  useEffect(() => {
    if (activeSensorId) return;
    const pose = getPresetCameraPose(viewMode);
    controllerRef.current?.setCameraPose(pose.position, pose.target);
  }, [viewMode, cameraNonce, activeSensorId]);

  // Focus camera smoothly when a hotspot is clicked
  useEffect(() => {
    const sensor = getSensorById(activeSensorId);
    if (!sensor) return;
    controllerRef.current?.setCameraPose(sensor.focusCameraPos, sensor.focusTarget);
  }, [activeSensorId]);

  const activeSensor = getSensorById(activeSensorId);
  const activeSensorIndex = activeSensor
    ? PROSTHETIC_SENSORS.findIndex((s) => s.id === activeSensor.id)
    : -1;

  return (
    <div className="flex h-full w-full flex-col gap-3">
      <div
        data-testid="prosthetic-viewer"
        data-view-mode={viewMode}
        data-visual-mode={visualMode}
        data-active-sensor={activeSensorId ?? 'none'}
        className="relative h-[430px] w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0B0D10] sm:h-[520px] lg:h-full lg:min-h-[520px]"
      >
        {/* Dedicated Empty Mount Container for WebGLRenderer */}
        <div
          ref={canvasMountRef}
          className="h-full w-full cursor-grab active:cursor-grabbing"
          aria-label="Interactive 3D NEXLIMB prosthetic leg model"
        />

        {/* Subtle top-left viewer instruction micro-hint */}
        {!isLoading && !webGLError && (
          <div className="pointer-events-none absolute left-4 top-3.5 z-10 flex items-center gap-2 text-[11px] text-[#7D8797]">
            <span>Drag to rotate</span>
            <span aria-hidden="true">·</span>
            <span>Scroll to zoom</span>
            <span aria-hidden="true">·</span>
            <span className="hidden sm:inline">Select pins to inspect</span>
            <span className="sm:hidden">Tap pins</span>
          </div>
        )}

        {/* 3D-Projected Interactive Sensor Hotspots */}
        {!isLoading && !webGLError && (
          <SensorHotspots
            projectedPositions={projectedPositions}
            activeSensorId={activeSensorId}
            hoveredSensorId={hoveredSensorId}
            visualMode={visualMode}
            onSelectSensor={(id) => onSelectSensor(id)}
            onHoverSensor={setHoveredSensorId}
          />
        )}

        {/* Selected Component Information Panel (Desktop/Tablet floating corner) */}
        {activeSensor && !isLoading && !webGLError && (
          <div className="pointer-events-auto hidden sm:block sm:absolute sm:right-4 sm:top-4 sm:z-20">
            <ComponentInfoPanel
              sensor={activeSensor}
              currentIndex={activeSensorIndex}
              totalCount={PROSTHETIC_SENSORS.length}
              onClose={() => onSelectSensor(null)}
              onStep={onStepSensor}
            />
          </div>
        )}

        {/* Floating Collapsible 3D Controls */}
        {!isLoading && !webGLError && (
          <ViewerControls
            viewMode={viewMode}
            visualMode={visualMode}
            autoRotate={autoRotate}
            collapsed={controlsCollapsed}
            onToggleCollapse={() => setControlsCollapsed((prev) => !prev)}
            onToggleAutoRotate={() => onToggleAutoRotate()}
            onZoomIn={() => controllerRef.current?.zoom('in')}
            onZoomOut={() => controllerRef.current?.zoom('out')}
            onResetCamera={onResetCamera}
            onSelectViewMode={(mode) => {
              onSelectSensor(null);
              onChangeViewMode(mode);
            }}
            onSelectVisualMode={onChangeVisualMode}
          />
        )}

        {/* Initialization Loading State */}
        {isLoading && (
          <div
            role="status"
            aria-live="polite"
            className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#0B0D10] p-6 text-center"
          >
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/15 border-t-teal-400" />
            <p className="mt-3 font-display text-sm font-medium text-[#E2E8F0]">
              Initializing 3D Engineering Viewport
            </p>
            <p className="mt-1 text-xs text-[#7D8797]">
              Building procedural carbon-fiber &amp; titanium materials
            </p>
          </div>
        )}

        {/* Graceful WebGL Fallback */}
        {webGLError && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#0E1218] p-6 text-center">
            <img
              src="/assets/aistudio/9e279189-2aec-4607-9dfc-013d9a792839_5509f33e.png"
              alt="NEXLIMB smart prosthetic leg prototype reference"
              referrerPolicy="no-referrer"
              className="max-h-[280px] w-auto rounded-lg object-contain opacity-90"
            />
            <p className="mt-4 font-display text-sm font-medium text-[#F3F5F8]">
              Interactive 3D Fallback View
            </p>
            <p className="mt-1 max-w-sm text-xs text-[#8E98A8]">{webGLError}</p>
          </div>
        )}
      </div>

      {/* Selected Component Information Panel (Mobile stacked cleanly below 3D canvas) */}
      {activeSensor && !isLoading && !webGLError && (
        <div className="sm:hidden">
          <ComponentInfoPanel
            sensor={activeSensor}
            currentIndex={activeSensorIndex}
            totalCount={PROSTHETIC_SENSORS.length}
            onClose={() => onSelectSensor(null)}
            onStep={onStepSensor}
          />
        </div>
      )}
    </div>
  );
}
