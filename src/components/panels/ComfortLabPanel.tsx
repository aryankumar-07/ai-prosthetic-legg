import { useState } from 'react';
import { AlertTriangle, ArrowRight, CheckCircle2, Droplets, Thermometer } from 'lucide-react';
import { COMFORT_SCENARIOS } from '../../data/prostheticPanels';

interface ComfortLabPanelProps {
  onJumpTo3DSocket: () => void;
}

export function ComfortLabPanel({ onJumpTo3DSocket }: ComfortLabPanelProps) {
  const [selectedId, setSelectedId] = useState<string>(COMFORT_SCENARIOS[1].id);
  const [imgFailed, setImgFailed] = useState(false);

  const scenario =
    COMFORT_SCENARIOS.find((s) => s.id === selectedId) ?? COMFORT_SCENARIOS[0];

  const loadBadgeStyle = (level: 'baseline' | 'moderate' | 'elevated') => {
    if (level === 'elevated') {
      return 'border-amber-400/40 bg-amber-500/15 text-amber-200';
    }
    if (level === 'moderate') {
      return 'border-teal-400/35 bg-teal-500/10 text-teal-200';
    }
    return 'border-white/10 bg-[#141820] text-[#9AA4B4]';
  };

  const loadLabelText = (level: 'baseline' | 'moderate' | 'elevated') => {
    if (level === 'elevated') return 'Elevated';
    if (level === 'moderate') return 'Moderate';
    return 'Baseline';
  };

  return (
    <section
      id="comfort"
      aria-labelledby="panel-comfort-heading"
      className="border-t border-white/[0.07] bg-[#0B0D10] px-4 py-16 sm:px-8 lg:px-10 lg:py-24"
    >
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="font-mono-tech text-xs font-medium tracking-[0.16em] text-teal-400 uppercase">
              03 · Smart Socket &amp; Comfort Monitoring
            </p>
            <h2
              id="panel-comfort-heading"
              style={{ textWrap: 'balance' }}
              className="mt-2 font-display text-2xl font-semibold tracking-tight text-[#F3F5F8] sm:text-3xl lg:text-4xl"
            >
              Contextual Fit Alerts Instead of Unexplained Numbers.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#9AA4B4] sm:text-base">
              A prosthesis can perform mechanically while still causing socket discomfort. NEXLIMB pairs 6-zone liner FSRs with temperature and humidity probes to flag fit shifts relative to your personal baseline.
            </p>
          </div>

          <button
            type="button"
            onClick={onJumpTo3DSocket}
            className="inline-flex items-center gap-2 self-start rounded-lg border border-white/12 bg-[#141820] px-4 py-2 text-xs font-medium text-[#E2E8F0] transition-colors hover:border-teal-400/50 hover:text-teal-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 whitespace-nowrap shrink-0"
          >
            <span>Inspect Socket Sensors in X-Ray</span>
            <ArrowRight className="h-3.5 w-3.5 text-teal-400" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-stretch">
          {/* Left: Reference Hardware Sensor Callout Diagram */}
          <div className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#12161E] p-5 lg:col-span-6">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base font-semibold text-[#F3F5F8]">
                  Embedded Hardware Sensor Layout
                </h3>
                <span className="font-mono-tech text-[11px] text-[#7D8797]">
                  Liner · Climate · Encoder · Plantar
                </span>
              </div>
              <p className="mt-1 text-xs text-[#8E98A8]">
                Close-up placement of the 6 socket FSR pads, perforated SI7021 humidity module, 9-DOF IMU, AS5600 encoder, and plantar insole array.
              </p>
            </div>

            <div className="mt-4 overflow-hidden rounded-xl border border-white/[0.08] bg-[#F5F7FA]">
              {!imgFailed ? (
                <img
                  src="/assets/aistudio/cd6dfc4b-ab99-4719-82aa-0e237a0b28bd_2a1320b8.png"
                  alt="NEXLIMB detailed hardware callouts showing socket liner FSR pads, humidity sensor, IMU module, magnetic encoder, main PCB, and foot pressure insole"
                  referrerPolicy="no-referrer"
                  onError={() => setImgFailed(true)}
                  className="h-auto w-full object-contain"
                />
              ) : (
                <div className="flex h-64 items-center justify-center bg-[#141820] p-6 text-center text-xs text-[#8E98A8]">
                  NEXLIMB Hardware Sensor Reference Diagram
                </div>
              )}
            </div>
          </div>

          {/* Right: Interactive Socket Fit & Micro-Climate Condition Explorer */}
          <div className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#12161E] p-6 lg:col-span-6">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-lg font-semibold text-[#F3F5F8]">
                  Socket Fit &amp; Micro-Climate Explorer
                </h3>
                <span className="font-mono-tech text-[11px] text-[#7D8797]">
                  Illustrative Monitoring Range
                </span>
              </div>

              {/* Scenario Switcher */}
              <div
                role="tablist"
                aria-label="Socket comfort condition scenarios"
                className="mt-4 flex flex-wrap gap-1.5 rounded-lg bg-[#0B0D10] p-1.5"
              >
                {COMFORT_SCENARIOS.map((item) => {
                  const active = item.id === scenario.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setSelectedId(item.id)}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 ${
                        active
                          ? 'bg-teal-500/20 text-teal-300 border border-teal-400/40'
                          : 'text-[#8E98A8] hover:text-white border border-transparent'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {/* Thermal & Humidity Readout Strip */}
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-white/[0.06] bg-[#0E1218] p-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#8E98A8]">
                    <Thermometer className="h-3.5 w-3.5 text-teal-400" aria-hidden="true" />
                    <span>Socket Temp</span>
                  </div>
                  <p className="mt-1 font-mono-tech text-base font-semibold text-[#F3F5F8]">
                    {scenario.temperatureC}
                  </p>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-[#0E1218] p-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#8E98A8]">
                    <Droplets className="h-3.5 w-3.5 text-teal-400" aria-hidden="true" />
                    <span>Liner Humidity</span>
                  </div>
                  <p className="mt-1 font-mono-tech text-base font-semibold text-[#F3F5F8]">
                    {scenario.humidityPct}
                  </p>
                </div>
                <div className="col-span-2 rounded-xl border border-white/[0.06] bg-[#0E1218] p-3 sm:col-span-1">
                  <span className="text-[11px] text-[#8E98A8]">Monitored Focus</span>
                  <p className="mt-1 truncate font-display text-sm font-semibold text-[#F3F5F8]">
                    {scenario.peakRegion}
                  </p>
                </div>
              </div>

              {/* 6-Region Socket Map List */}
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {scenario.regionLevels.map((reg) => (
                  <div
                    key={reg.region}
                    className="flex items-center justify-between gap-2 rounded-lg border border-white/[0.06] bg-[#0E1218] px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-[#E2E8F0]">{reg.region}</p>
                      <p className="truncate text-[11px] text-[#7D8797]">{reg.note}</p>
                    </div>
                    <span
                      className={`rounded border px-2 py-0.5 text-[10px] font-medium whitespace-nowrap shrink-0 ${loadBadgeStyle(
                        reg.relativeLoad,
                      )}`}
                    >
                      {loadLabelText(reg.relativeLoad)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contextual Alert Card */}
            <div
              className={`mt-5 rounded-xl border p-4 ${
                scenario.isElevated
                  ? 'border-amber-400/35 bg-amber-500/10'
                  : 'border-teal-400/30 bg-teal-500/10'
              }`}
            >
              <div className="flex items-start gap-3">
                {scenario.isElevated ? (
                  <AlertTriangle
                    className="mt-0.5 h-4 w-4 shrink-0 text-amber-300"
                    aria-hidden="true"
                  />
                ) : (
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-teal-400"
                    aria-hidden="true"
                  />
                )}
                <div className="text-xs leading-relaxed">
                  <p className="font-display text-sm font-semibold text-[#F3F5F8]">
                    {scenario.alertTitle} ·{' '}
                    <span className="font-normal text-[#CBD5E1]">{scenario.statusLabel}</span>
                  </p>
                  <p className="mt-1 text-[#CBD5E1]">{scenario.alertMessage}</p>
                  <p className="mt-1.5 text-[#9AA4B4]">
                    <span className="font-medium text-[#E2E8F0]">Suggested Action: </span>
                    {scenario.recommendation}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
