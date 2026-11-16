import { CheckCircle2, Wrench } from 'lucide-react';
import { MAINTENANCE_SEQUENCE_STEPS } from '../../data/panel02Data';

interface ModularMaintenanceDemoProps {
  currentStep: number;
  onSelectStep: (stepIndex: number) => void;
}

export function ModularMaintenanceDemo({
  currentStep,
  onSelectStep,
}: ModularMaintenanceDemoProps) {
  const activeStep = MAINTENANCE_SEQUENCE_STEPS[currentStep] ?? MAINTENANCE_SEQUENCE_STEPS[0];

  return (
    <div className="mt-5 rounded-2xl border border-white/[0.08] bg-[#12161E] p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="font-display text-base font-semibold text-[#F3F5F8]">
            Modular Component Replacement Demonstration
          </h4>
          <p className="text-xs text-[#8E98A8]">
            Step through the replacement sequence to watch the socket pressure sensor pod highlight, detach from the 3D NEXLIMB model, and re-seat cleanly while the carbon pylon remains untouched.
          </p>
        </div>
        <span className="font-mono-tech text-[11px] font-semibold text-teal-400">
          SIMULATED SERVICE WORKFLOW
        </span>
      </div>

      {/* 6-Step Sequence Selector */}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {MAINTENANCE_SEQUENCE_STEPS.map((step, idx) => {
          const active = idx === currentStep;
          return (
            <button
              key={step.step}
              type="button"
              onClick={() => onSelectStep(idx)}
              aria-pressed={active}
              className={`rounded-xl border p-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 ${
                active
                  ? 'border-teal-400/60 bg-teal-500/15 text-[#F3F5F8]'
                  : 'border-white/[0.07] bg-[#0B0D10] text-[#9AA4B4] hover:border-white/20 hover:text-white'
              }`}
            >
              <span className="font-mono-tech text-[11px] text-teal-400">{step.label}</span>
              <span className="mt-1 block text-xs font-semibold leading-snug">
                {step.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Maintenance Readout */}
      <div className="mt-4 grid grid-cols-1 gap-4 rounded-xl border border-white/[0.06] bg-[#0B0E14] p-4 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-teal-400" aria-hidden="true" />
            <span className="font-mono-tech text-xs font-semibold text-teal-300">
              {activeStep.label} · {activeStep.title}
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-[#CBD5E1]">{activeStep.detail}</p>
        </div>

        <div className="rounded-lg border border-teal-400/25 bg-[#0F171F] p-3.5 lg:col-span-5">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono-tech text-[11px] font-semibold text-teal-400">
              COMPONENT MAINTENANCE
            </span>
            <CheckCircle2 className="h-3.5 w-3.5 text-teal-400" aria-hidden="true" />
          </div>
          <dl className="mt-2 space-y-1 text-xs">
            <div className="flex justify-between gap-2">
              <dt className="text-[#8E98A8]">Target Module:</dt>
              <dd className="font-medium text-[#F3F5F8]">Pressure sensor module</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-[#8E98A8]">Status:</dt>
              <dd className="font-medium text-teal-300">Replacement demonstration</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-[#8E98A8]">Module Connection:</dt>
              <dd className="font-mono-tech text-[#E2E8F0]">{activeStep.busStatus}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
