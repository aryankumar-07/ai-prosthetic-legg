import { useEffect, useRef, useState } from 'react';
import {
  Gauge,
  Link2,
  Link2Off,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { PANEL02_ACTIVITIES } from '../../data/panel02Data';
import type { ActivityId, TerrainCondition } from '../../three/activityKinematics';
import {
  getComparisonCameraPreset,
  mountComparisonViewport,
  type ComparisonViewportController,
} from '../../three/comparisonScene';

interface ProstheticComparisonViewerProps {
  activityId: ActivityId;
  terrainCondition: TerrainCondition;
  isPlaying: boolean;
  slowMotion: boolean;
  socketXray: boolean;
  blindHotspot: boolean;
  highlightedSensors: string[];
  maintenanceSeparation: number;
  inViewport: boolean;
  onSelectActivity: (id: ActivityId) => void;
  onTogglePlay: () => void;
  onReplay: () => void;
  onToggleSlowMotion: () => void;
  onResetSimulation: () => void;
  onPhaseTick: (phase: number, elapsedSec: number) => void;
  registerPhaseJump: (fn: (phase: number) => void) => void;
}

export function ProstheticComparisonViewer({
  activityId,
  terrainCondition,
  isPlaying,
  slowMotion,
  socketXray,
  blindHotspot,
  highlightedSensors,
  maintenanceSeparation,
  inViewport,
  onSelectActivity,
  onTogglePlay,
  onReplay,
  onToggleSlowMotion,
  onResetSimulation,
  onPhaseTick,
  registerPhaseJump,
}: ProstheticComparisonViewerProps) {
  const leftMountRef = useRef<HTMLDivElement | null>(null);
  const rightMountRef = useRef<HTMLDivElement | null>(null);
  const leftCtrlRef = useRef<ComparisonViewportController | null>(null);
  const rightCtrlRef = useRef<ComparisonViewportController | null>(null);

  const [syncCameras, setSyncCameras] = useState<boolean>(true);
  const [camView, setCamView] = useState<'threeQuarter' | 'front' | 'side'>('threeQuarter');
  const [leftReady, setLeftReady] = useState<boolean>(false);
  const [rightReady, setRightReady] = useState<boolean>(false);
  const [webGLError, setWebGLError] = useState<string | null>(null);

  const syncCamerasRef = useRef(syncCameras);
  syncCamerasRef.current = syncCameras;
  const onPhaseTickRef = useRef(onPhaseTick);
  onPhaseTickRef.current = onPhaseTick;

  // Mount both 3D simulation viewports once
  useEffect(() => {
    const leftEl = leftMountRef.current;
    const rightEl = rightMountRef.current;
    if (!leftEl || !rightEl) return;

    const baseState = {
      activityId,
      terrainCondition,
      isPlaying,
      slowMotion,
      socketXray,
      blindHotspot,
      highlightedSensors,
      maintenanceSeparation,
      inViewport,
    };

    const leftCtrl = mountComparisonViewport(leftEl, 'conventional', baseState, {
      onReady: () => setLeftReady(true),
      onError: (msg) => setWebGLError(msg),
      onCameraSync: (pos, tgt) => {
        if (syncCamerasRef.current) {
          rightCtrlRef.current?.applyExternalCamera(pos, tgt);
        }
      },
    });

    const rightCtrl = mountComparisonViewport(rightEl, 'nexlimb', baseState, {
      onReady: () => setRightReady(true),
      onError: (msg) => setWebGLError(msg),
      onCameraSync: (pos, tgt) => {
        if (syncCamerasRef.current) {
          leftCtrlRef.current?.applyExternalCamera(pos, tgt);
        }
      },
      onSimulationTick: (phase, elapsedSec) => {
        onPhaseTickRef.current(phase, elapsedSec);
      },
    });

    leftCtrlRef.current = leftCtrl;
    rightCtrlRef.current = rightCtrl;

    registerPhaseJump((phase) => {
      leftCtrlRef.current?.setPhaseImmediate(phase);
      rightCtrlRef.current?.setPhaseImmediate(phase);
    });

    return () => {
      leftCtrl.dispose();
      rightCtrl.dispose();
      leftCtrlRef.current = null;
      rightCtrlRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Push reactive simulation state updates cleanly to both controllers
  useEffect(() => {
    const patch = {
      activityId,
      terrainCondition,
      isPlaying,
      slowMotion,
      socketXray,
      blindHotspot,
      highlightedSensors,
      maintenanceSeparation,
      inViewport,
    };
    leftCtrlRef.current?.updateState(patch);
    rightCtrlRef.current?.updateState(patch);
  }, [
    activityId,
    terrainCondition,
    isPlaying,
    slowMotion,
    socketXray,
    blindHotspot,
    highlightedSensors,
    maintenanceSeparation,
    inViewport,
  ]);

  const handleCameraPreset = (preset: 'front' | 'side' | 'threeQuarter') => {
    setCamView(preset);
    const pose = getComparisonCameraPreset(preset);
    leftCtrlRef.current?.setCameraPose(pose.position, pose.target);
    rightCtrlRef.current?.setCameraPose(pose.position, pose.target);
  };

  const handleZoom = (dir: 'in' | 'out') => {
    leftCtrlRef.current?.zoom(dir);
    rightCtrlRef.current?.zoom(dir);
  };

  const handleResetViewAndSim = () => {
    handleCameraPreset('threeQuarter');
    leftCtrlRef.current?.setPhaseImmediate(0.08);
    rightCtrlRef.current?.setPhaseImmediate(0.08);
    onResetSimulation();
  };

  const currentActivity =
    PANEL02_ACTIVITIES.find((a) => a.id === activityId) ?? PANEL02_ACTIVITIES[0];

  return (
    <div
      data-testid="panel02-comparison-viewer"
      data-activity={activityId}
      data-playback={isPlaying ? 'playing' : 'paused'}
      className="rounded-2xl border border-white/[0.08] bg-[#10141B] p-4 sm:p-5"
    >
      {/* Top Bar: Activity Selector + Playback Controls */}
      <div className="flex flex-col gap-3 border-b border-white/[0.07] pb-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#8E98A8]">
            <span className="font-mono-tech font-semibold text-teal-400">
              LIVE 3D ACTIVITY SIMULATION
            </span>
            <span aria-hidden="true">·</span>
            <span>{currentActivity.environmentLabel}</span>
          </div>
          <div
            role="tablist"
            aria-label="Live 3D movement activities"
            className="flex flex-wrap gap-1.5"
          >
            {PANEL02_ACTIVITIES.map((act) => {
              const active = act.id === activityId;
              return (
                <button
                  key={act.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    onSelectActivity(act.id);
                    if (act.id === 'sitting') {
                      leftCtrlRef.current?.setPhaseImmediate(0.45);
                      rightCtrlRef.current?.setPhaseImmediate(0.45);
                    }
                  }}
                  className={`rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 ${
                    active
                      ? 'border-teal-400/50 bg-teal-500/15 text-teal-200'
                      : 'border-white/10 bg-[#0B0D10] text-[#9AA4B4] hover:border-white/25 hover:text-white'
                  }`}
                >
                  <span className="sm:hidden">{act.shortLabel}</span>
                  <span className="hidden sm:inline">{act.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Playback & Camera Action Strip */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={onTogglePlay}
            aria-label={isPlaying ? 'Pause simulation' : 'Play simulation'}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-teal-400/40 bg-teal-500/15 px-3 text-xs font-medium text-teal-200 transition-colors hover:bg-teal-500/25 whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
          >
            {isPlaying ? (
              <Pause className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <Play className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              leftCtrlRef.current?.setPhaseImmediate(0.02);
              rightCtrlRef.current?.setPhaseImmediate(0.02);
              onReplay();
            }}
            className="inline-flex h-8 items-center gap-1 rounded-md border border-white/10 bg-[#0B0D10] px-2.5 text-xs font-medium text-[#CBD5E1] transition-colors hover:border-white/25 hover:text-white whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
          >
            <SkipBack className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Replay</span>
          </button>

          <button
            type="button"
            onClick={onToggleSlowMotion}
            aria-pressed={slowMotion}
            className={`inline-flex h-8 items-center gap-1 rounded-md border px-2.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 ${
              slowMotion
                ? 'border-teal-400/50 bg-teal-500/20 text-teal-200'
                : 'border-white/10 bg-[#0B0D10] text-[#9AA4B4] hover:border-white/25 hover:text-white'
            }`}
          >
            <Gauge className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Slow-Mo 0.4×</span>
          </button>

          <button
            type="button"
            onClick={handleResetViewAndSim}
            className="inline-flex h-8 items-center gap-1 rounded-md border border-white/10 bg-[#0B0D10] px-2.5 text-xs font-medium text-[#CBD5E1] transition-colors hover:border-white/25 hover:text-white whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Synchronized Dual 3D Viewports */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* LEFT VIEWPORT — Conventional Passive Mechanical Prosthetic */}
        <div className="flex flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-[#0B0E13]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] bg-[#12161F] px-3.5 py-2.5">
            <div className="min-w-0">
              <span className="font-mono-tech text-[11px] font-semibold tracking-wider text-[#94A3B8]">
                CONVENTIONAL PROSTHETIC
              </span>
              <p className="text-[11px] text-[#7D8797]">
                Molded thermoplastic socket · Steel pylon · SACH foot
              </p>
            </div>
            <span className="font-mono-tech text-[11px] text-[#94A3B8] whitespace-nowrap shrink-0">
              0 Electronic Sensors
            </span>
          </div>

          <div className="relative h-[360px] w-full sm:h-[400px]">
            <div
              ref={leftMountRef}
              data-testid="conventional-3d-viewport"
              className="h-full w-full cursor-grab active:cursor-grabbing"
              aria-label="Interactive 3D Conventional Passive Mechanical Prosthetic"
            />
            {!leftReady && !webGLError && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#0B0E13] text-xs text-[#7D8797]">
                Loading conventional model...
              </div>
            )}
            <div className="pointer-events-none absolute inset-x-3 bottom-2.5 rounded-lg border border-white/[0.07] bg-[#0B0D10]/90 px-3 py-1.5">
              <p className="text-[11px] leading-snug text-[#9AA4B4]">
                <span className="font-medium text-[#CBD5E1]">Mechanical Action: </span>
                {currentActivity.conventionalNote}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT VIEWPORT — NEXLIMB Intelligent Prosthetic */}
        <div className="flex flex-col overflow-hidden rounded-xl border border-teal-400/30 bg-[#0B0E13]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-teal-400/20 bg-[#101821] px-3.5 py-2.5">
            <div className="min-w-0">
              <span className="font-mono-tech text-[11px] font-semibold tracking-wider text-teal-400">
                NEXLIMB INTELLIGENT PROSTHETIC
              </span>
              <p className="text-[11px] text-[#8E98A8]">
                Carbon exoskeleton · Multi-sensor bus · Spring blades
              </p>
            </div>
            <span className="font-mono-tech text-[11px] text-teal-300 whitespace-nowrap shrink-0">
              {highlightedSensors.length} Active Sensor Channels
            </span>
          </div>

          <div className="relative h-[360px] w-full sm:h-[400px]">
            <div
              ref={rightMountRef}
              data-testid="nexlimb-3d-viewport"
              className="h-full w-full cursor-grab active:cursor-grabbing"
              aria-label="Interactive 3D NEXLIMB Intelligent Prosthetic"
            />
            {!rightReady && !webGLError && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#0B0E13] text-xs text-[#7D8797]">
                Loading NEXLIMB simulation...
              </div>
            )}
            <div className="pointer-events-none absolute inset-x-3 bottom-3 rounded-lg border border-teal-400/25 bg-[#0B0D10]/90 px-3 py-2">
              <p className="text-[11px] leading-snug text-[#CBD5E1]">
                <span className="font-medium text-teal-300">Intelligent Monitoring: </span>
                {currentActivity.nexlimbNote}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Synchronized Camera Controls Bar */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.07] pt-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[11px] text-[#7D8797]">Camera:</span>
          {(
            [
              { id: 'threeQuarter', label: '3/4 View' },
              { id: 'front', label: 'Front View' },
              { id: 'side', label: 'Side View' },
            ] as const
          ).map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleCameraPreset(preset.id)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 ${
                camView === preset.id
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-400/40'
                  : 'bg-[#0B0D10] text-[#8E98A8] border border-white/10 hover:text-white'
              }`}
            >
              {preset.label}
            </button>
          ))}

          <button
            type="button"
            onClick={() => handleZoom('in')}
            aria-label="Zoom in both viewports"
            className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-[#0B0D10] px-2.5 py-1 text-xs text-[#CBD5E1] hover:text-white whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
          >
            <ZoomIn className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Zoom In</span>
          </button>

          <button
            type="button"
            onClick={() => handleZoom('out')}
            aria-label="Zoom out both viewports"
            className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-[#0B0D10] px-2.5 py-1 text-xs text-[#CBD5E1] hover:text-white whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
          >
            <ZoomOut className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Zoom Out</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setSyncCameras((prev) => !prev)}
          aria-pressed={syncCameras}
          className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 ${
            syncCameras
              ? 'border-teal-400/40 bg-teal-500/15 text-teal-300'
              : 'border-white/10 bg-[#0B0D10] text-[#8E98A8] hover:text-white'
          }`}
        >
          {syncCameras ? (
            <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <Link2Off className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          <span>{syncCameras ? 'Synced Camera Rotation' : 'Independent Cameras'}</span>
        </button>
      </div>

      {webGLError && (
        <p className="mt-3 rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
          {webGLError} Showing descriptive engineering comparison below.
        </p>
      )}
    </div>
  );
}
