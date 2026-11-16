import {
  ChevronDown,
  ChevronUp,
  Eye,
  RotateCw,
  RotateCcw,
  Scan,
  Sparkles,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type { CameraViewMode, VisualMode } from '../utils/viewerState';

interface ViewerControlsProps {
  viewMode: CameraViewMode;
  visualMode: VisualMode;
  autoRotate: boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onToggleAutoRotate: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetCamera: () => void;
  onSelectViewMode: (mode: CameraViewMode) => void;
  onSelectVisualMode: (mode: VisualMode) => void;
}

export function ViewerControls({
  viewMode,
  visualMode,
  autoRotate,
  collapsed,
  onToggleCollapse,
  onToggleAutoRotate,
  onZoomIn,
  onZoomOut,
  onResetCamera,
  onSelectViewMode,
  onSelectVisualMode,
}: ViewerControlsProps) {
  const viewOptions: Array<{ id: CameraViewMode; label: string }> = [
    { id: 'threeQuarter', label: '3/4' },
    { id: 'front', label: 'Front' },
    { id: 'side', label: 'Side' },
    { id: 'rear', label: 'Rear' },
  ];

  const visualOptions: Array<{
    id: VisualMode;
    label: string;
    Icon: typeof Eye;
  }> = [
    { id: 'standard', label: 'Standard', Icon: Eye },
    { id: 'xray', label: 'X-Ray', Icon: Scan },
    { id: 'sensors', label: 'Sensors', Icon: Sparkles },
  ];

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-3 z-20 flex flex-col items-center px-3">
      {/* Collapse / Expand toggle */}
      <button
        type="button"
        onClick={onToggleCollapse}
        aria-expanded={!collapsed}
        aria-label={collapsed ? 'Show 3D viewer controls' : 'Hide 3D viewer controls'}
        className="pointer-events-auto mb-1.5 inline-flex items-center gap-1.5 rounded-t-md border border-b-0 border-white/10 bg-[#12161E]/95 px-3 py-1 text-[11px] font-medium text-[#A1AAB8] transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
      >
        {collapsed ? (
          <>
            <ChevronUp className="h-3.5 w-3.5 text-teal-400" aria-hidden="true" />
            <span>Show Controls</span>
          </>
        ) : (
          <>
            <ChevronDown className="h-3.5 w-3.5 text-teal-400" aria-hidden="true" />
            <span>Hide Controls</span>
          </>
        )}
      </button>

      {!collapsed && (
        <div
          role="toolbar"
          aria-label="3D model camera and visual mode controls"
          data-testid="viewer-controls-dock"
          className="pointer-events-auto flex max-w-full flex-wrap items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-[#12161E]/95 p-1.5 shadow-2xl lg:flex-nowrap"
        >
          {/* A. Camera Controls */}
          <div className="flex items-center gap-0.5 rounded-lg bg-[#0B0D10]/70 p-0.5">
            <button
              type="button"
              onClick={onToggleAutoRotate}
              aria-pressed={autoRotate}
              aria-label="Toggle automatic rotation"
              title="Toggle rotation"
              className={`inline-flex h-7 items-center gap-1 rounded-md px-2 text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 ${
                autoRotate
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-400/40'
                  : 'text-[#A1AAB8] hover:bg-white/[0.06] hover:text-white border border-transparent'
              }`}
            >
              <RotateCw className="h-3 w-3" aria-hidden="true" />
              <span>Rotate</span>
            </button>

            <button
              type="button"
              onClick={onZoomIn}
              aria-label="Zoom in"
              title="Zoom in"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[#A1AAB8] transition-colors hover:bg-white/[0.06] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
            >
              <ZoomIn className="h-3.5 w-3.5" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={onZoomOut}
              aria-label="Zoom out"
              title="Zoom out"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[#A1AAB8] transition-colors hover:bg-white/[0.06] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
            >
              <ZoomOut className="h-3.5 w-3.5" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={onResetCamera}
              aria-label="Reset camera view"
              title="Reset view"
              className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-[11px] font-medium text-[#A1AAB8] transition-colors hover:bg-white/[0.06] hover:text-white whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
            >
              <RotateCcw className="h-3 w-3" aria-hidden="true" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>

          <span aria-hidden="true" className="hidden h-4 w-px bg-white/10 lg:block" />

          {/* B. View Modes */}
          <div className="flex items-center gap-0.5 rounded-lg bg-[#0B0D10]/70 p-0.5" role="group" aria-label="Camera angles">
            {viewOptions.map((opt) => {
              const active = viewMode === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onSelectViewMode(opt.id)}
                  aria-pressed={active}
                  className={`h-7 rounded-md px-2 text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 ${
                    active
                      ? 'bg-[#1D2430] text-[#F3F5F8] border border-white/15'
                      : 'text-[#8E98A8] hover:text-white border border-transparent'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          <span aria-hidden="true" className="hidden h-4 w-px bg-white/10 lg:block" />

          {/* C. Visual Modes */}
          <div className="flex items-center gap-0.5 rounded-lg bg-[#0B0D10]/70 p-0.5" role="group" aria-label="Visual inspection modes">
            {visualOptions.map(({ id, label, Icon }) => {
              const active = visualMode === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onSelectVisualMode(id)}
                  aria-pressed={active}
                  className={`inline-flex h-7 items-center gap-1 rounded-md px-2 text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 ${
                    active
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-400/40'
                      : 'text-[#8E98A8] hover:text-white border border-transparent'
                  }`}
                >
                  <Icon className="h-3 w-3" aria-hidden="true" />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
