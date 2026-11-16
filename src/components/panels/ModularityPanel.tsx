import { useState } from 'react';
import { ArrowRight, Wrench } from 'lucide-react';
import { MODULAR_PARTS } from '../../data/prostheticPanels';

interface ModularityPanelProps {
  onJumpTo3DModule: (sensorId: string) => void;
}

export function ModularityPanel({ onJumpTo3DModule }: ModularityPanelProps) {
  const [selectedPartId, setSelectedPartId] = useState<string>(MODULAR_PARTS[1].id);
  const [imgFailed, setImgFailed] = useState(false);

  const activePart =
    MODULAR_PARTS.find((part) => part.id === selectedPartId) ?? MODULAR_PARTS[0];

  const jumpMap: Record<string, string> = {
    'mod-liner': 'socket-pressure',
    'mod-battery': 'battery-module',
    'mod-controller': 'controller-module',
    'mod-joint': 'joint-angle',
    'mod-pylon': 'imu-motion',
    'mod-foot': 'foot-pressure',
  };

  return (
    <section
      id="modularity"
      aria-labelledby="panel-modularity-heading"
      className="border-t border-white/[0.07] bg-[#0D1015] px-4 py-16 sm:px-8 lg:px-10 lg:py-24"
    >
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="font-mono-tech text-xs font-medium tracking-[0.16em] text-teal-400 uppercase">
              04 · Modular &amp; Cost-Effective Architecture
            </p>
            <h2
              id="panel-modularity-heading"
              style={{ textWrap: 'balance' }}
              className="mt-2 font-display text-2xl font-semibold tracking-tight text-[#F3F5F8] sm:text-3xl lg:text-4xl"
            >
              One Worn Part Never Grounds the Whole Leg.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#9AA4B4] sm:text-base">
              Standardized mechanical collars, pogo-pin power docks, and interchangeable sensor harnesses allow local repairability and gradual hardware upgrades at accessible cost.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onJumpTo3DModule(jumpMap[activePart.id] ?? 'battery-module')}
            className="inline-flex items-center gap-2 self-start rounded-lg border border-white/12 bg-[#141820] px-4 py-2 text-xs font-medium text-[#E2E8F0] transition-colors hover:border-teal-400/50 hover:text-teal-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 whitespace-nowrap shrink-0"
          >
            <span>Locate {activePart.code} in 3D</span>
            <ArrowRight className="h-3.5 w-3.5 text-teal-400" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-stretch">
          {/* Left: Modular Subassembly Selector & Details */}
          <div className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#12161E] p-6 lg:col-span-5">
            <div>
              <h3 className="font-display text-base font-semibold text-[#F3F5F8]">
                Serviceable Subassemblies
              </h3>
              <p className="mt-1 text-xs text-[#8E98A8]">
                Select any module to inspect its connector standard, service time, and upgrade path.
              </p>

              <div className="mt-4 space-y-2">
                {MODULAR_PARTS.map((part) => {
                  const active = part.id === activePart.id;
                  return (
                    <button
                      key={part.id}
                      type="button"
                      onClick={() => setSelectedPartId(part.id)}
                      aria-pressed={active}
                      className={`flex w-full items-center justify-between gap-3 rounded-lg border px-3.5 py-2.5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 ${
                        active
                          ? 'border-teal-400/50 bg-teal-500/15 text-white'
                          : 'border-white/[0.07] bg-[#0E1218] text-[#CBD5E1] hover:border-white/20'
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="font-mono-tech text-[11px] font-medium text-teal-400">
                          {part.code}
                        </span>
                        <span className="truncate text-sm font-medium">{part.name}</span>
                      </div>
                      <span className="font-mono-tech text-[11px] text-[#8E98A8] whitespace-nowrap shrink-0">
                        {part.replacementTime}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Module Engineering Specs */}
            <div className="mt-5 rounded-xl border border-white/[0.07] bg-[#0E1218] p-4">
              <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] pb-2.5">
                <span className="font-display text-sm font-semibold text-[#F3F5F8]">
                  {activePart.name}
                </span>
                <span className="inline-flex items-center gap-1 font-mono-tech text-[11px] text-teal-400">
                  <Wrench className="h-3 w-3" aria-hidden="true" />
                  {activePart.replacementTime}
                </span>
              </div>

              <dl className="mt-3 space-y-2.5 text-xs leading-relaxed">
                <div>
                  <dt className="font-mono-tech text-[10px] uppercase tracking-wider text-teal-400">
                    Standardized Interface
                  </dt>
                  <dd className="mt-0.5 text-[#E2E8F0]">{activePart.interfaceType}</dd>
                </div>
                <div>
                  <dt className="font-mono-tech text-[10px] uppercase tracking-wider text-teal-400">
                    Local Repair Advantage
                  </dt>
                  <dd className="mt-0.5 text-[#B4BECB]">{activePart.repairAdvantage}</dd>
                </div>
                <div>
                  <dt className="font-mono-tech text-[10px] uppercase tracking-wider text-teal-400">
                    Upgrade Architecture
                  </dt>
                  <dd className="mt-0.5 text-[#B4BECB]">{activePart.upgradePath}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Right: Exploded Engineering Architecture Diagram */}
          <div className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#12161E] p-5 lg:col-span-7">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-display text-base font-semibold text-[#F3F5F8]">
                  Exploded Mechanical &amp; Electronics Architecture
                </h3>
                <p className="mt-0.5 text-xs text-[#8E98A8]">
                  Independent socket liner, hot-swap battery dock, finned controller housing, harmonic drive clevis, carbon pylon, and spring-blade foot.
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-1 items-center justify-center overflow-hidden rounded-xl border border-white/[0.08] bg-[#F5F7FA] p-2">
              {!imgFailed ? (
                <img
                  src="/assets/aistudio/06424a54-bb6a-4266-b868-d0352968fbba_a5eee7e1.png"
                  alt="NEXLIMB exploded engineering diagram illustrating modular socket liner, snap-in battery, rotary joint actuator, main PCB, carbon pylon, and multi-leaf foot"
                  referrerPolicy="no-referrer"
                  onError={() => setImgFailed(true)}
                  className="max-h-[470px] w-full object-contain"
                />
              ) : (
                <div className="flex h-72 items-center justify-center bg-[#141820] p-6 text-center text-xs text-[#8E98A8]">
                  NEXLIMB Modular Exploded Architecture Diagram
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
