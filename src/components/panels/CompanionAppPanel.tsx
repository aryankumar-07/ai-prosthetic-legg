import { useState } from 'react';
import {
  Activity,
  BatteryCharging,
  CheckCircle2,
  Cpu,
  Footprints,
  ShieldCheck,
  Smartphone,
  Wrench,
} from 'lucide-react';
import { COMPANION_SCREENS, type CompanionScreenSpec } from '../../data/prostheticPanels';

export function CompanionAppPanel() {
  const [activeScreenId, setActiveScreenId] =
    useState<CompanionScreenSpec['id']>('dashboard');

  const activeScreen =
    COMPANION_SCREENS.find((s) => s.id === activeScreenId) ?? COMPANION_SCREENS[0];

  return (
    <section
      id="companion"
      aria-labelledby="panel-companion-heading"
      className="border-t border-white/[0.07] bg-[#0B0D10] px-4 py-16 sm:px-8 lg:px-10 lg:py-24"
    >
      <div className="mx-auto max-w-[1440px]">
        <div className="max-w-2xl">
          <p className="font-mono-tech text-xs font-medium tracking-[0.16em] text-teal-400 uppercase">
            05 · NEXLIMB Companion Application
          </p>
          <h2
            id="panel-companion-heading"
            style={{ textWrap: 'balance' }}
            className="mt-2 font-display text-2xl font-semibold tracking-tight text-[#F3F5F8] sm:text-3xl lg:text-4xl"
          >
            A Medical-Grade Companion Interface Connecting All Three Pillars.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#9AA4B4] sm:text-base">
            Designed like a focused clinical companion rather than a generic fitness tracker—giving users clear daily confidence while supporting engineers and prosthetists with deeper diagnostics.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
          {/* Left: Interactive 5-Screen Selector & UX Rationale */}
          <div className="space-y-3 lg:col-span-6">
            {COMPANION_SCREENS.map((screen, idx) => {
              const active = screen.id === activeScreen.id;
              return (
                <button
                  key={screen.id}
                  type="button"
                  onClick={() => setActiveScreenId(screen.id)}
                  aria-pressed={active}
                  className={`flex w-full items-start gap-4 rounded-xl border p-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 ${
                    active
                      ? 'border-teal-400/50 bg-[#141A23]'
                      : 'border-white/[0.07] bg-[#11151C] hover:border-white/20'
                  }`}
                >
                  <span
                    className={`font-mono-tech text-xs font-semibold ${
                      active ? 'text-teal-400' : 'text-[#6C7687]'
                    }`}
                  >
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-display text-base font-semibold text-[#F3F5F8]">
                      {screen.title}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-[#9AA4B4]">
                      {screen.subtitle}
                    </p>
                    {active && (
                      <p className="mt-2 border-t border-white/[0.07] pt-2 text-xs text-teal-200/90">
                        {screen.purpose}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: Interactive Mobile Companion Device Preview */}
          <div className="flex flex-col items-center lg:col-span-6">
            <div className="w-full max-w-[360px] rounded-[28px] border border-white/15 bg-[#0F1319] p-4 shadow-2xl">
              {/* Top Phone Header */}
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-teal-400" aria-hidden="true" />
                  <span className="font-display text-sm font-semibold tracking-tight text-[#F3F5F8]">
                    NEXLIMB
                  </span>
                </div>
                <span className="font-mono-tech text-[11px] text-teal-400">
                  Concept UI · {activeScreen.tabLabel}
                </span>
              </div>

              {/* Screen Viewport Content */}
              <div className="mt-3 min-h-[370px] rounded-2xl border border-white/[0.07] bg-[#0B0D10] p-4">
                {activeScreen.id === 'dashboard' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] text-[#8E98A8]">Prosthesis Status</p>
                        <p className="font-display text-base font-semibold text-[#F3F5F8]">
                          Connected · Systems Nominal
                        </p>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-teal-400" aria-hidden="true" />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="rounded-xl border border-white/[0.07] bg-[#12161E] p-3">
                        <div className="flex items-center gap-1.5 text-[11px] text-[#8E98A8]">
                          <Footprints className="h-3.5 w-3.5 text-teal-400" aria-hidden="true" />
                          <span>Steps Today</span>
                        </div>
                        <p className="mt-1 font-mono-tech text-lg font-semibold text-[#F3F5F8]">
                          4,280
                        </p>
                      </div>
                      <div className="rounded-xl border border-white/[0.07] bg-[#12161E] p-3">
                        <div className="flex items-center gap-1.5 text-[11px] text-[#8E98A8]">
                          <Activity className="h-3.5 w-3.5 text-teal-400" aria-hidden="true" />
                          <span>Gait Consistency*</span>
                        </div>
                        <p className="mt-1 font-mono-tech text-lg font-semibold text-[#F3F5F8]">
                          82%
                        </p>
                      </div>
                      <div className="rounded-xl border border-white/[0.07] bg-[#12161E] p-3">
                        <div className="flex items-center gap-1.5 text-[11px] text-[#8E98A8]">
                          <BatteryCharging
                            className="h-3.5 w-3.5 text-teal-400"
                            aria-hidden="true"
                          />
                          <span>Battery</span>
                        </div>
                        <p className="mt-1 font-mono-tech text-lg font-semibold text-[#F3F5F8]">
                          86%
                        </p>
                      </div>
                      <div className="rounded-xl border border-white/[0.07] bg-[#12161E] p-3">
                        <div className="flex items-center gap-1.5 text-[11px] text-[#8E98A8]">
                          <ShieldCheck className="h-3.5 w-3.5 text-teal-400" aria-hidden="true" />
                          <span>Socket State</span>
                        </div>
                        <p className="mt-1 font-display text-sm font-semibold text-teal-300">
                          Normal
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/[0.07] bg-[#12161E] p-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#CBD5E1]">Daily Step Goal</span>
                        <span className="font-mono-tech text-[#8E98A8]">4,280 / 6,000</span>
                      </div>
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#1C222D]">
                        <div className="h-full w-[71%] rounded-full bg-teal-400" />
                      </div>
                    </div>
                  </div>
                )}

                {activeScreen.id === 'gait' && (
                  <div className="space-y-3">
                    <div>
                      <p className="text-[11px] text-[#8E98A8]">Gait Intelligence</p>
                      <p className="font-display text-base font-semibold text-[#F3F5F8]">
                        Personal Baseline Comparison
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="rounded-xl border border-white/[0.07] bg-[#12161E] p-3">
                        <span className="text-[11px] text-[#8E98A8]">Cadence</span>
                        <p className="mt-1 font-mono-tech text-base font-semibold text-[#F3F5F8]">
                          104 steps/min
                        </p>
                      </div>
                      <div className="rounded-xl border border-white/[0.07] bg-[#12161E] p-3">
                        <span className="text-[11px] text-[#8E98A8]">Stride Cycle</span>
                        <p className="mt-1 font-mono-tech text-base font-semibold text-[#F3F5F8]">
                          1.15 s
                        </p>
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/[0.07] bg-[#12161E] p-3 text-xs">
                      <p className="font-medium text-[#E2E8F0]">Gait Phase Timing Split</p>
                      <div className="mt-2.5 flex h-3 overflow-hidden rounded-full bg-[#1C222D]">
                        <div className="w-[18%] bg-teal-500" title="Heel Strike" />
                        <div className="w-[34%] bg-teal-400" title="Mid-Stance" />
                        <div className="w-[14%] bg-cyan-300" title="Toe-Off" />
                        <div className="w-[34%] bg-[#334155]" title="Swing" />
                      </div>
                      <div className="mt-2 flex justify-between font-mono-tech text-[10px] text-[#8E98A8]">
                        <span>Stance 66%</span>
                        <span>Swing 34%</span>
                      </div>
                    </div>
                    <p className="rounded-lg border border-white/[0.06] bg-[#12161E] p-3 text-xs text-[#9AA4B4]">
                      Weekly symmetry report ready to export for prosthetist review.
                    </p>
                  </div>
                )}

                {activeScreen.id === 'comfort' && (
                  <div className="space-y-3">
                    <div>
                      <p className="text-[11px] text-[#8E98A8]">Smart Comfort Monitoring</p>
                      <p className="font-display text-base font-semibold text-[#F3F5F8]">
                        6-Zone Socket Distribution
                      </p>
                    </div>
                    <div className="space-y-2">
                      {[
                        { label: 'Anterior Tibial', state: 'Elevated vs baseline', warn: true },
                        { label: 'Patellar Bar', state: 'Within baseline', warn: false },
                        { label: 'Lateral / Medial', state: 'Within baseline', warn: false },
                        { label: 'Posterior Calf', state: '33.4 °C · 58% RH', warn: false },
                      ].map((row) => (
                        <div
                          key={row.label}
                          className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-[#12161E] px-3 py-2 text-xs"
                        >
                          <span className="text-[#E2E8F0]">{row.label}</span>
                          <span
                            className={`font-mono-tech text-[11px] ${
                              row.warn ? 'text-amber-300' : 'text-teal-300'
                            }`}
                          >
                            {row.state}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-lg border border-amber-400/30 bg-amber-500/10 p-3 text-xs text-amber-100">
                      Review anterior liner seating if localized pressure persists.
                    </div>
                  </div>
                )}

                {activeScreen.id === 'telemetry' && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <p className="font-display text-sm font-semibold text-[#F3F5F8]">
                        Hardware Sensor Bus (Concept UI)
                      </p>
                      <Cpu className="h-4 w-4 text-teal-400" aria-hidden="true" />
                    </div>
                    {[
                      { ch: '9-DOF IMU', val: 'Axes X / Y / Z + Quaternion' },
                      { ch: 'Foot FSRs (x5)', val: 'Heel · Mid · Metatarsals · Toe' },
                      { ch: 'AS5600 Angle', val: '12-bit Rotary Flexion' },
                      { ch: 'Socket FSRs (x6)', val: 'Polyimide Matrix Active' },
                      { ch: 'DS18B20 / SI7021', val: 'Thermal + RH Micro-Climate' },
                    ].map((bus) => (
                      <div
                        key={bus.ch}
                        className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-[#12161E] px-3 py-2 text-[11px]"
                      >
                        <span className="font-mono-tech font-medium text-teal-300">{bus.ch}</span>
                        <span className="text-[#9AA4B4]">{bus.val}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeScreen.id === 'maintenance' && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <p className="font-display text-sm font-semibold text-[#F3F5F8]">
                        Modular Service Status
                      </p>
                      <Wrench className="h-4 w-4 text-teal-400" aria-hidden="true" />
                    </div>
                    {[
                      { mod: 'IMU Motion Module', stat: 'Connected' },
                      { mod: 'Plantar & Socket FSRs', stat: 'Operational' },
                      { mod: 'Li-Ion Battery Pack', stat: '86% · Hot-Swap Ready' },
                      { mod: 'Rotary Joint & Encoder', stat: 'Inspection Schedule' },
                      { mod: 'Controller Bay PCB', stat: 'Firmware Current' },
                    ].map((row) => (
                      <div
                        key={row.mod}
                        className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-[#12161E] px-3 py-2 text-xs"
                      >
                        <span className="text-[#E2E8F0]">{row.mod}</span>
                        <span className="font-mono-tech text-[11px] text-teal-300">{row.stat}</span>
                      </div>
                    ))}
                  </div>
                )}

                <p className="mt-3 text-[10px] leading-snug text-[#6C7687]">
                  *Illustrative UI concept values only, not validated measurements or clinical scores.
                </p>
              </div>

              {/* Bottom App Tab Bar */}
              <div className="mt-3 grid grid-cols-5 gap-1 rounded-xl bg-[#0B0D10] p-1">
                {COMPANION_SCREENS.map((tab) => {
                  const active = tab.id === activeScreen.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveScreenId(tab.id)}
                      className={`rounded-lg py-1.5 text-[10px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 ${
                        active
                          ? 'bg-teal-500/20 text-teal-300'
                          : 'text-[#7D8797] hover:text-white'
                      }`}
                    >
                      {tab.tabLabel}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
