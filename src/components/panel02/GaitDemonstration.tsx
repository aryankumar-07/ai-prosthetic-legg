import { GAIT_CYCLE_STAGES } from '../../data/panel02Data';

interface GaitDemonstrationProps {
  currentPhaseIndex: number;
  selectedStageIndex: number | null;
  onSelectGaitStage: (stageIndex: number, phaseCenter: number) => void;
}

export function GaitDemonstration({
  currentPhaseIndex,
  selectedStageIndex,
  onSelectGaitStage,
}: GaitDemonstrationProps) {
  const activeIdx = selectedStageIndex ?? currentPhaseIndex;
  const stage = GAIT_CYCLE_STAGES[activeIdx] ?? GAIT_CYCLE_STAGES[0];

  return (
    <div className="mt-5 rounded-2xl border border-white/[0.08] bg-[#12161E] p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="font-display text-base font-semibold text-[#F3F5F8]">
            5-Stage Walking Cycle Breakdown
          </h4>
          <p className="text-xs text-[#8E98A8]">
            Select any gait stage to inspect sensor triggers or watch the live 3D simulation cycle automatically.
          </p>
        </div>
        <span className="font-mono-tech text-[11px] font-semibold text-teal-400">
          SIMULATED GAIT DEMONSTRATION
        </span>
      </div>

      {/* Interactive 5-Stage Gait Selector */}
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-5">
        {GAIT_CYCLE_STAGES.map((item) => {
          const isCurrent = item.index === activeIdx;
          return (
            <button
              key={item.title}
              type="button"
              onClick={() => onSelectGaitStage(item.index, item.phaseCenter)}
              aria-pressed={isCurrent}
              className={`rounded-xl border p-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 ${
                isCurrent
                  ? 'border-teal-400/60 bg-teal-500/15 text-[#F3F5F8]'
                  : 'border-white/[0.07] bg-[#0B0D10] text-[#9AA4B4] hover:border-white/20 hover:text-white'
              }`}
            >
              <span className="font-mono-tech text-[11px] text-teal-400">
                0{item.index + 1}
              </span>
              <span className="mt-1 block text-xs font-semibold">{item.title}</span>
              <span className="mt-1.5 block font-mono-tech text-[11px] text-[#7D8797] tabular-nums">
                Knee {item.kneeAngleDeg}°
              </span>
            </button>
          );
        })}
      </div>

      {/* Stage Details: Animated Pressure Distribution + Sensor Triggers */}
      <div className="mt-4 grid grid-cols-1 gap-4 rounded-xl border border-white/[0.06] bg-[#0B0E14] p-4 md:grid-cols-3">
        <div>
          <span className="font-mono-tech text-[11px] text-[#7D8797] uppercase">
            Plantar Loading Split
          </span>
          <div className="mt-2.5 space-y-2 font-mono-tech text-xs tabular-nums">
            <div className="flex justify-between">
              <span className="text-[#9AA4B4]">Heel Zone</span>
              <span className="text-teal-300">{stage.heelLoadPct}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded bg-white/10">
              <div
                className="h-full bg-teal-400 transition-[width] duration-200"
                style={{ width: `${stage.heelLoadPct}%` }}
              />
            </div>
            <div className="flex justify-between">
              <span className="text-[#9AA4B4]">Forefoot Zone</span>
              <span className="text-cyan-300">{stage.forefootLoadPct}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded bg-white/10">
              <div
                className="h-full bg-cyan-400 transition-[width] duration-200"
                style={{ width: `${stage.forefootLoadPct}%` }}
              />
            </div>
          </div>
        </div>

        <div>
          <span className="font-mono-tech text-[11px] text-[#7D8797] uppercase">
            Illustrative Joint Angle
          </span>
          <p className="mt-2 font-mono-tech text-2xl font-semibold text-[#F3F5F8] tabular-nums">
            {stage.kneeAngleDeg}°
          </p>
          <p className="mt-1 text-xs text-[#8E98A8]">
            {stage.activeSensors.join(' · ')} active during {stage.title.toLowerCase()}.
          </p>
        </div>

        <div>
          <span className="font-mono-tech text-[11px] text-teal-400 uppercase">
            Collected Movement Data
          </span>
          <p className="mt-2 text-xs leading-relaxed text-[#CBD5E1]">
            {stage.telemetrySummary}
          </p>
        </div>
      </div>
    </div>
  );
}
