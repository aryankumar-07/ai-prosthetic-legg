import { useCallback, useEffect, useState } from 'react';
import { ArrowDown, ArrowRight, Cpu } from 'lucide-react';
import { BottomInfoStrip } from './components/BottomInfoStrip';
import { Navbar, type NavSectionId } from './components/Navbar';
import { ProstheticViewer } from './components/ProstheticViewer';
import { TechnologyModal } from './components/TechnologyModal';
import { ComfortLabPanel } from './components/panels/ComfortLabPanel';
import { CompanionAppPanel } from './components/panels/CompanionAppPanel';
import { IntelligencePanel } from './components/panels/IntelligencePanel';
import { ModularityPanel } from './components/panels/ModularityPanel';
import { getSensorById } from './utils/viewerState';
import {
  getAdjacentSensorId,
  type CameraViewMode,
  type VisualMode,
} from './utils/viewerState';

export default function App() {
  const [activeNav, setActiveNav] = useState<NavSectionId>('overview');
  const [viewMode, setViewMode] = useState<CameraViewMode>('threeQuarter');
  const [visualMode, setVisualMode] = useState<VisualMode>('standard');
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [activeSensorId, setActiveSensorId] = useState<string | null>(null);
  const [cameraNonce, setCameraNonce] = useState<number>(0);
  const [isExpandedView, setIsExpandedView] = useState<boolean>(false);
  const [isTechModalOpen, setIsTechModalOpen] = useState<boolean>(false);

  const scrollToSection = useCallback((sectionId: NavSectionId) => {
    setActiveNav(sectionId);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleResetCamera = useCallback(() => {
    setActiveSensorId(null);
    setViewMode('threeQuarter');
    setVisualMode('standard');
    setCameraNonce((n) => n + 1);
  }, []);

  const handleSelectSensor = useCallback(
    (sensorId: string | null) => {
      setActiveSensorId(sensorId);
      if (sensorId) {
        setAutoRotate(false);
        const spec = getSensorById(sensorId);
        if (visualMode === 'standard' && spec?.recommendedVisualMode === 'xray') {
          setVisualMode('xray');
        }
      }
    },
    [visualMode],
  );

  const handleStepSensor = useCallback(
    (direction: 1 | -1) => {
      setActiveSensorId((current) => {
        const nextId = getAdjacentSensorId(current, direction);
        const spec = getSensorById(nextId);
        if (visualMode === 'standard' && spec?.recommendedVisualMode === 'xray') {
          setVisualMode('xray');
        }
        return nextId;
      });
      setAutoRotate(false);
    },
    [visualMode],
  );

  const handleToggleAutoRotate = useCallback((forced?: boolean) => {
    setAutoRotate((prev) => (typeof forced === 'boolean' ? forced : !prev));
  }, []);

  const handleExplore3D = useCallback(() => {
    setVisualMode('sensors');
    setActiveSensorId(null);
    setViewMode('threeQuarter');
    setAutoRotate(false);
    setCameraNonce((n) => n + 1);
  }, []);

  const handleInspectTechnology = useCallback(() => {
    setVisualMode('xray');
    setIsTechModalOpen(true);
  }, []);

  const handleJumpTo3D = useCallback(
    (mode: VisualMode, sensorId?: string) => {
      setVisualMode(mode);
      setAutoRotate(false);
      if (sensorId) {
        setActiveSensorId(sensorId);
      } else {
        setActiveSensorId(null);
        setViewMode('threeQuarter');
        setCameraNonce((n) => n + 1);
      }
      scrollToSection('overview');
    },
    [scrollToSection],
  );

  const handleToggleFullscreen = useCallback(async () => {
    setIsExpandedView((prev) => !prev);
    scrollToSection('overview');
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch {
      // Fullscreen API may be restricted inside embedded iframes; expanded focus layout remains active
    }
  }, [scrollToSection]);

  // Update active nav highlight naturally as user scrolls through panels
  useEffect(() => {
    const sectionIds: NavSectionId[] = [
      'overview',
      'intelligence',
      'comfort',
      'modularity',
      'companion',
    ];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveNav(entry.target.id as NavSectionId);
          }
        }
      },
      { rootMargin: '-35% 0px -50% 0px' },
    );

    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  // Keyboard Escape handler for closing info panel / modal / expanded mode
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isTechModalOpen) {
          setIsTechModalOpen(false);
        } else if (activeSensorId) {
          setActiveSensorId(null);
        } else if (isExpandedView) {
          setIsExpandedView(false);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isTechModalOpen, activeSensorId, isExpandedView]);

  const featureHighlights = [
    {
      num: '01',
      label: 'Smart Sensor Technology',
      action: () => scrollToSection('intelligence'),
    },
    {
      num: '02',
      label: 'Intelligent Comfort Monitoring',
      action: () => scrollToSection('comfort'),
    },
    {
      num: '03',
      label: 'Modular Architecture',
      action: () => scrollToSection('modularity'),
    },
  ];

  return (
    <div className="min-h-screen w-full bg-[#0B0D10] text-[#F3F5F8]">
      <Navbar
        activeNav={activeNav}
        isExpandedView={isExpandedView}
        onSelectNav={scrollToSection}
        onToggleFullscreen={handleToggleFullscreen}
      />

      {/* PANEL 01 — Full-Viewport 3D Hero Showcase */}
      <main>
      <section
        id="overview"
        aria-label="NEXLIMB Hero 3D Showcase"
        className="flex min-h-[calc(100vh-57px)] flex-col"
      >
        <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-4 py-4 sm:px-8 lg:px-10 lg:py-5">
          <div
            className={`grid flex-1 gap-6 lg:items-stretch ${
              isExpandedView ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-12'
            }`}
          >
            {/* Left Content Column */}
            {!isExpandedView && (
              <div className="flex flex-col justify-center py-2 lg:col-span-5 lg:pr-4">
                <p className="text-xs font-medium tracking-[0.16em] text-teal-400 uppercase">
                  The Next Generation of Prosthetics
                </p>

                <h1
                  style={{ textWrap: 'balance' }}
                  className="mt-3 font-display text-[1.85rem] font-semibold leading-[1.12] tracking-tight text-[#F3F5F8] sm:text-[2.15rem] xl:text-[2.45rem]"
                >
                  More Than a Replacement.
                  <br />
                  <span className="text-[#CBD5E1]">An Intelligent Extension.</span>
                </h1>

                <p className="mt-4 max-w-md text-sm leading-relaxed text-[#9AA4B4] sm:text-[15px]">
                  An intelligent prosthetic concept designed around smart sensing, socket comfort monitoring and modular engineering.
                </p>

                {/* Primary & Secondary Hero Actions */}
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleExplore3D}
                    className="inline-flex items-center gap-2 rounded-lg bg-teal-400 px-5 py-2.5 text-xs font-semibold tracking-wide text-[#071316] transition-colors hover:bg-teal-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 whitespace-nowrap shrink-0 uppercase"
                  >
                    <span>Explore in 3D</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    onClick={handleInspectTechnology}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-[#141820] px-5 py-2.5 text-xs font-semibold tracking-wide text-[#E2E8F0] transition-colors hover:border-teal-400/50 hover:text-teal-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 whitespace-nowrap shrink-0 uppercase"
                  >
                    <Cpu className="h-3.5 w-3.5 text-teal-400" aria-hidden="true" />
                    <span>Inspect Technology</span>
                  </button>
                </div>

                {/* Three Concise Feature Indicators (scroll to corresponding panels) */}
                <div className="mt-7 space-y-2 border-t border-white/[0.08] pt-5">
                  {featureHighlights.map((item) => (
                    <button
                      key={item.num}
                      type="button"
                      onClick={item.action}
                      className="group flex w-full items-center justify-between gap-3 rounded-md py-1 text-left transition-colors hover:text-teal-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
                    >
                      <span className="flex items-center gap-3">
                        <span className="font-mono-tech text-xs font-medium text-teal-400">
                          {item.num}
                        </span>
                        <span aria-hidden="true" className="text-slate-600">
                          —
                        </span>
                        <span className="text-sm font-medium text-[#CBD5E1] transition-colors group-hover:text-white">
                          {item.label}
                        </span>
                      </span>
                      <ArrowDown
                        className="h-3.5 w-3.5 text-[#6C7687] transition-colors group-hover:text-teal-400"
                        aria-hidden="true"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Right Stage: Real-Time Interactive 3D Model */}
            <div
              className={`relative flex flex-col lg:min-h-[540px] ${
                isExpandedView ? 'col-span-1 lg:min-h-[640px]' : 'lg:col-span-7'
              }`}
            >
              <ProstheticViewer
                viewMode={viewMode}
                visualMode={visualMode}
                autoRotate={autoRotate}
                activeSensorId={activeSensorId}
                cameraNonce={cameraNonce}
                onChangeViewMode={setViewMode}
                onChangeVisualMode={setVisualMode}
                onToggleAutoRotate={handleToggleAutoRotate}
                onSelectSensor={handleSelectSensor}
                onStepSensor={handleStepSensor}
                onResetCamera={handleResetCamera}
              />
            </div>
          </div>
        </div>

        <BottomInfoStrip />
      </section>

      {/* PANEL 02 — Smart Intelligence Engine & Comparison */}
      <IntelligencePanel
        onJumpTo3DMode={(mode, sensorId) => handleJumpTo3D(mode, sensorId)}
      />

      {/* PANEL 03 — Smart Socket & Comfort Monitoring Lab */}
      <ComfortLabPanel
        onJumpTo3DSocket={() => handleJumpTo3D('xray', 'socket-pressure')}
      />

      {/* PANEL 04 — Modular & Cost-Effective Architecture */}
      <ModularityPanel
        onJumpTo3DModule={(sensorId) => handleJumpTo3D('sensors', sensorId)}
      />

      {/* PANEL 05 — NEXLIMB Companion Application UI Showcase */}
      <CompanionAppPanel />
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-white/[0.07] bg-[#080A0D] px-4 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="font-display text-sm font-semibold text-[#F3F5F8]">
              NEXLIMB <span className="font-normal text-[#6C7687]">· Intelligent Prosthetic Prototype</span>
            </p>
            <p className="mt-0.5 text-xs text-[#7D8797]">
              Engineering showcase demonstrating smart sensing, socket comfort monitoring, and modular repairability.
            </p>
          </div>

          <button
            type="button"
            onClick={() => scrollToSection('overview')}
            className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-[#12161E] px-3 py-1.5 text-xs font-medium text-[#CBD5E1] transition-colors hover:border-teal-400/50 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
          >
            <span>Back to 3D Prototype</span>
          </button>
        </div>
      </footer>

      <TechnologyModal
        open={isTechModalOpen}
        onClose={() => setIsTechModalOpen(false)}
        onInspectSensor={(id) => {
          handleSelectSensor(id);
          scrollToSection('overview');
        }}
      />
    </div>
  );
}
