import { ArrowUpRight, X } from 'lucide-react';
import { INTELLIGENCE_STAGES, PROSTHETIC_SENSORS } from '../data/prostheticSensors';

interface TechnologyModalProps {
  open: boolean;
  onClose: () => void;
  onInspectSensor: (sensorId: string) => void;
}

export function TechnologyModal({
  open,
  onClose,
  onInspectSensor,
}: TechnologyModalProps) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tech-modal-title"
      data-testid="technology-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/12 bg-[#11151C] p-6 shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] pb-4">
          <div>
            <p className="text-xs font-medium tracking-[0.14em] text-teal-400 uppercase">
              NEXLIMB Architecture
            </p>
            <h2
              id="tech-modal-title"
              className="mt-1 font-display text-xl font-semibold text-[#F3F5F8] sm:text-2xl"
            >
              Smart Prosthetic Intelligence Engine
            </h2>
            <p className="mt-1 text-sm text-[#9AA4B4]">
              Every embedded sensor performs a dedicated kinematic, environmental, or diagnostic role.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close technology overview"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/10 bg-[#181D26] text-[#9AA4B4] transition-colors hover:border-white/25 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* 4-Stage Intelligence Loop */}
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {INTELLIGENCE_STAGES.map((stage) => (
            <div
              key={stage.step}
              className="rounded-xl border border-white/[0.08] bg-[#161B24] p-3.5"
            >
              <span className="font-mono-tech text-xs font-semibold text-teal-400">
                {stage.step}
              </span>
              <h3 className="mt-1 font-display text-sm font-semibold text-[#F3F5F8]">
                {stage.title}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-[#9AA4B4]">{stage.summary}</p>
              <p className="mt-2 border-t border-white/[0.06] pt-2 font-mono-tech text-[10px] text-[#7D8797]">
                {stage.inputs}
              </p>
            </div>
          ))}
        </div>

        {/* 8 Selectable Hardware Modules */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-semibold text-[#E2E8F0]">
              Select a Component to Inspect on 3D Model
            </h3>
            <span className="font-mono-tech text-xs text-[#7D8797]">8 Modules</span>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {PROSTHETIC_SENSORS.map((sensor) => (
              <button
                key={sensor.id}
                type="button"
                onClick={() => {
                  onInspectSensor(sensor.id);
                  onClose();
                }}
                className="group flex items-center justify-between gap-3 rounded-lg border border-white/[0.08] bg-[#151A22] px-3.5 py-2.5 text-left transition-colors hover:border-teal-400/50 hover:bg-[#19202B] focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono-tech text-[11px] font-medium text-teal-400">
                      {sensor.code}
                    </span>
                    <span className="truncate text-sm font-medium text-[#F3F5F8]">
                      {sensor.name}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-[#8E98A8]">
                    {sensor.hardwareRef}
                  </p>
                </div>
                <ArrowUpRight
                  className="h-4 w-4 shrink-0 text-[#6C7687] transition-colors group-hover:text-teal-400"
                  aria-hidden="true"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
