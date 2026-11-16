import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { ProstheticSensorSpec } from '../data/prostheticSensors';

interface ComponentInfoPanelProps {
  sensor: ProstheticSensorSpec;
  currentIndex: number;
  totalCount: number;
  onClose: () => void;
  onStep: (direction: 1 | -1) => void;
}

export function ComponentInfoPanel({
  sensor,
  currentIndex,
  totalCount,
  onClose,
  onStep,
}: ComponentInfoPanelProps) {
  return (
    <aside
      aria-label={`${sensor.name} specifications`}
      data-testid="component-info-panel"
      className="z-20 w-full rounded-xl border border-white/12 bg-[#12161E]/95 p-4 text-left shadow-2xl sm:w-[320px]"
    >
      <div className="flex items-start justify-between gap-3 border-b border-white/[0.08] pb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] text-[#8E98A8]">
            <span className="font-mono-tech font-medium text-teal-400">{sensor.code}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{sensor.subsystemLabel}</span>
          </div>
          <h3 className="mt-1 font-display text-base font-semibold tracking-tight text-[#F3F5F8]">
            {sensor.name}
          </h3>
          <p className="mt-0.5 text-[11px] text-[#7D8797]">{sensor.hardwareRef}</p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close component specification panel"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/10 bg-[#181D26] text-[#9AA4B4] transition-colors hover:border-white/25 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <dl className="mt-3 space-y-2.5 text-xs leading-relaxed">
        <div>
          <dt className="font-mono-tech text-[10px] font-medium uppercase tracking-wider text-teal-400">
            Function
          </dt>
          <dd className="mt-0.5 text-[#D8DFE9]">{sensor.functionText}</dd>
        </div>
        <div>
          <dt className="font-mono-tech text-[10px] font-medium uppercase tracking-wider text-teal-400">
            Purpose
          </dt>
          <dd className="mt-0.5 text-[#B4BECB]">{sensor.purposeText}</dd>
        </div>
        <div>
          <dt className="font-mono-tech text-[10px] font-medium uppercase tracking-wider text-teal-400">
            Benefit
          </dt>
          <dd className="mt-0.5 text-[#B4BECB]">{sensor.benefitText}</dd>
        </div>
      </dl>

      <div className="mt-3.5 flex items-center justify-between border-t border-white/[0.08] pt-2.5">
        <span className="font-mono-tech text-[11px] text-[#7D8797]">
          {String(currentIndex + 1).padStart(2, '0')} / {String(totalCount).padStart(2, '0')}
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onStep(-1)}
            aria-label="Previous component"
            className="inline-flex h-8 items-center gap-1 rounded-md border border-white/10 bg-[#181D26] px-2.5 text-xs font-medium text-[#CBD5E1] transition-colors hover:border-teal-400/50 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
          >
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Prev</span>
          </button>
          <button
            type="button"
            onClick={() => onStep(1)}
            aria-label="Next component"
            className="inline-flex h-8 items-center gap-1 rounded-md border border-white/10 bg-[#181D26] px-2.5 text-xs font-medium text-[#CBD5E1] transition-colors hover:border-teal-400/50 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
          >
            <span>Next</span>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  );
}
