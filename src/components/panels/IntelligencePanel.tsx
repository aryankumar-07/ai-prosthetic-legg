import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import {
  MAINTENANCE_SEQUENCE_STEPS,
  PANEL02_SCENARIOS,
} from '../../data/panel02Data';
import {
  computeSimulatedTelemetry,
  getGaitStageIndex,
  type ActivityId,
  type ScenarioId,
  type TerrainCondition,
} from '../../three/activityKinematics';
import { ComparisonSummary } from '../panel02/ComparisonSummary';
import { GaitDemonstration } from '../panel02/GaitDemonstration';
import { LiveTelemetryEngine } from '../panel02/LiveTelemetryEngine';
import { ModularMaintenanceDemo } from '../panel02/ModularMaintenanceDemo';
import { PressureMap } from '../panel02/PressureMap';
import { ProstheticComparisonViewer } from '../panel02/ProstheticComparisonViewer';
import { ScenarioInformationPanel } from '../panel02/ScenarioInformationPanel';
import { ScenarioNavigation } from '../panel02/ScenarioNavigation';
import { SocketMonitoringVisualization } from '../panel02/SocketMonitoringVisualization';
import { TerrainDemonstration } from '../panel02/TerrainDemonstration';

interface IntelligencePanelProps {
  onJumpTo3DMode: (mode: 'sensors' | 'xray', sensorId?: string) => void;
}

export function IntelligencePanel({ onJumpTo3DMode }: IntelligencePanelProps) {
  const viewerWrapperRef = useRef<HTMLDivElement | null>(null);
  const phaseJumpFnRef = useRef<((phase: number) => void) | null>(null);

  const [inViewport, setInViewport] = useState<boolean>(false);
  const [activeScenarioId, setActiveScenarioId] = useState<ScenarioId>('walking');
  const [activityId, setActivityId] = useState<ActivityId>('walking');
  const [terrainCondition, setTerrainCondition] = useState<TerrainCondition>('flat');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [slowMotion, setSlowMotion] = useState<boolean>(false);
  const [wearProgress01, setWearProgress01] = useState<number>(0.72);
  const [maintenanceStep, setMaintenanceStep] = useState<number>(3);
  const [selectedGaitStage, setSelectedGaitStage] = useState<number | null>(null);

  const [simPhase, setSimPhase] = useState<number>(0.12);
  const [angleHistory, setAngleHistory] = useState<number[]>([6, 12, 8, 22, 48, 56, 32, 10]);

  const activeScenario =
    PANEL02_SCENARIOS.find((s) => s.id === activeScenarioId) ?? PANEL02_SCENARIOS[0];

  // Run Panel 02 3D animation whenever the dual comparison viewer is near or inside the viewport
  useEffect(() => {
    const el = viewerWrapperRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          setInViewport(entry.isIntersecting);
        }
      },
      { rootMargin: '140px 0px 140px 0px', threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleSelectScenario = useCallback((id: ScenarioId) => {
    setActiveScenarioId(id);
    const spec = PANEL02_SCENARIOS.find((s) => s.id === id);
    if (spec) {
      setActivityId(spec.defaultActivity);
      setSelectedGaitStage(null);
      if (id === 'uneven-terrain') {
        setTerrainCondition('uneven');
      } else if (id === 'walking') {
        setTerrainCondition('flat');
      }
      if (id === 'extended-wear' || id === 'pressure-awareness') {
        setWearProgress01(0.78);
      }
    }
  }, []);

  const handlePhaseTick = useCallback(
    (phase: number) => {
      setSimPhase(phase);
      const t = computeSimulatedTelemetry(
        activityId,
        phase,
        terrainCondition,
        wearProgress01,
        activeScenarioId,
      );
      setAngleHistory((prev) => [...prev.slice(-17), t.jointAngle.kneeDeg]);
    },
    [activityId, terrainCondition, wearProgress01, activeScenarioId],
  );

  const telemetry = computeSimulatedTelemetry(
    activityId,
    simPhase,
    terrainCondition,
    wearProgress01,
    activeScenarioId,
  );

  const currentGaitStageIndex = getGaitStageIndex(simPhase);
  const maintenanceSeparation =
    activeScenarioId === 'maintenance'
      ? (MAINTENANCE_SEQUENCE_STEPS[maintenanceStep]?.separation01 ?? 0)
      : 0;

  return (
    <section
      id="intelligence"
      aria-labelledby="panel-intelligence-heading"
      data-scenario={activeScenarioId}
      className="border-t border-white/[0.07] bg-[#0D1015] px-4 py-16 sm:px-8 lg:px-10 lg:py-24"
    >
      <div className="mx-auto max-w-[1440px]">
        {/* Section 2: Editorial Introduction */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="font-mono-tech text-xs font-medium tracking-[0.16em] text-teal-400 uppercase">
              NEXLIMB · 02 — THE DIFFERENCE
            </p>
            <h2
              id="panel-intelligence-heading"
              style={{ textWrap: 'balance' }}
              className="mt-2 font-display text-3xl font-semibold tracking-tight text-[#F3F5F8] sm:text-4xl lg:text-[2.75rem] lg:leading-[1.08]"
            >
              SAME WORLD. DIFFERENT EXPERIENCE.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#9AA4B4] sm:text-base">
              Everyday mobility comes with different challenges. Discover how NEXLIMB builds upon conventional prosthetic engineering with intelligent movement monitoring, socket comfort awareness, and modular design.
            </p>
          </div>

          <div className="flex flex-col items-start gap-2 lg:items-end">
            <p className="text-xs font-medium text-[#CBD5E1]">
              Two prosthetics. Six live activities. A different level of intelligence.
            </p>
            <button
              type="button"
              onClick={() => onJumpTo3DMode('sensors', 'imu-motion')}
              className="inline-flex items-center gap-2 rounded-lg border border-white/12 bg-[#141820] px-4 py-2 text-xs font-medium text-[#E2E8F0] transition-colors hover:border-teal-400/50 hover:text-teal-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 whitespace-nowrap shrink-0"
            >
              <span>Inspect Hero 3D Model</span>
              <ArrowRight className="h-3.5 w-3.5 text-teal-400" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Central Visual Thesis Line */}
        <div className="mt-8 rounded-xl border border-white/[0.07] bg-[#11151C] px-4 py-3 text-xs sm:flex sm:items-center sm:justify-between">
          <p className="font-medium text-[#CBD5E1]">
            A conventional prosthetic performs the movement.{' '}
            <span className="text-teal-300">
              NEXLIMB performs the movement while also understanding and monitoring it.
            </span>
          </p>
          <span className="mt-1 block font-mono-tech text-[11px] text-[#7D8797] sm:mt-0">
            REAL-TIME DUAL 3D DIGITAL TWIN · SIMULATED TELEMETRY
          </span>
        </div>

        {/* Dual Synchronized Live 3D Viewports */}
        <div ref={viewerWrapperRef} className="mt-5">
          <ProstheticComparisonViewer
            activityId={activityId}
            terrainCondition={terrainCondition}
            isPlaying={isPlaying}
            slowMotion={slowMotion}
            socketXray={activeScenario.socketXray}
            blindHotspot={activeScenarioId === 'pressure-awareness' || wearProgress01 >= 0.6}
            highlightedSensors={activeScenario.highlightedSensors}
            maintenanceSeparation={maintenanceSeparation}
            inViewport={inViewport}
            onSelectActivity={(act) => {
              setActivityId(act);
              setSelectedGaitStage(null);
              if (act === 'uneven-terrain') {
                setTerrainCondition('uneven');
              } else if (act === 'walking' && terrainCondition === 'uneven') {
                setTerrainCondition('flat');
              }
            }}
            onTogglePlay={() => setIsPlaying((p) => !p)}
            onReplay={() => {
              setIsPlaying(true);
            }}
            onToggleSlowMotion={() => setSlowMotion((s) => !s)}
            onResetSimulation={() => {
              setIsPlaying(true);
              setSlowMotion(false);
              setSelectedGaitStage(null);
            }}
            onPhaseTick={handlePhaseTick}
            registerPhaseJump={(fn) => {
              phaseJumpFnRef.current = fn;
            }}
          />
        </div>

        {/* Live Sensor Activity + 4-Stage AI Intelligence Pipeline */}
        <LiveTelemetryEngine
          telemetry={telemetry}
          isPlaying={isPlaying}
          angleHistory={angleHistory}
        />

        {/* 5 Everyday Comparison Scenarios */}
        <ScenarioNavigation
          activeScenarioId={activeScenarioId}
          onSelectScenario={handleSelectScenario}
        />

        <ScenarioInformationPanel scenario={activeScenario} />

        {/* Scenario-Specific Interactive Demonstration */}
        {activeScenarioId === 'walking' && (
          <GaitDemonstration
            currentPhaseIndex={currentGaitStageIndex}
            selectedStageIndex={selectedGaitStage}
            onSelectGaitStage={(stageIndex, phaseCenter) => {
              setSelectedGaitStage(stageIndex);
              setActivityId('walking');
              phaseJumpFnRef.current?.(phaseCenter);
            }}
          />
        )}

        {activeScenarioId === 'extended-wear' && (
          <SocketMonitoringVisualization
            wearProgress01={wearProgress01}
            onChangeWearProgress={(val) => setWearProgress01(val)}
          />
        )}

        {activeScenarioId === 'uneven-terrain' && (
          <TerrainDemonstration
            terrainCondition={terrainCondition}
            onSelectTerrain={(cond) => {
              setTerrainCondition(cond);
              setActivityId(cond === 'uneven' ? 'uneven-terrain' : 'walking');
            }}
          />
        )}

        {activeScenarioId === 'pressure-awareness' && <PressureMap />}

        {activeScenarioId === 'maintenance' && (
          <ModularMaintenanceDemo
            currentStep={maintenanceStep}
            onSelectStep={(idx) => setMaintenanceStep(idx)}
          />
        )}

        {/* Section 10: Final Comparison Summary */}
        <ComparisonSummary
          onExploreComfortLab={() => {
            document.getElementById('comfort')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
        />
      </div>
    </section>
  );
}
