import { CheckCircle2, MinusCircle } from 'lucide-react';
import type { ComparisonScenarioSpec } from '../../data/panel02Data';

interface ScenarioInformationPanelProps {
  scenario: ComparisonScenarioSpec;
}

export function ScenarioInformationPanel({ scenario }: ScenarioInformationPanelProps) {
  return (
    <div className="mt-5 rounded-2xl border border-white/[0.08] bg-[#12161E] p-5 sm:p-6">
      <div className="border-b border-white/[0.07] pb-4">
        <span className="font-mono-tech text-xs font-semibold text-teal-400">
          SCENARIO {scenario.code}
        </span>
        <h3 className="mt-1 font-display text-xl font-semibold tracking-tight text-[#F3F5F8] sm:text-2xl">
          {scenario.title}
        </h3>
        <p className="mt-1.5 max-w-3xl text-sm text-[#9AA4B4]">{scenario.subtitle}</p>
      </div>

      {/* Left (Conventional) vs Right (NEXLIMB) Comparison Cards */}
      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-white/[0.07] bg-[#0B0E14] p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono-tech text-xs font-semibold tracking-wider text-[#94A3B8]">
              CONVENTIONAL · {scenario.conventionalHeading}
            </span>
          </div>
          <ul className="mt-3.5 space-y-2.5">
            {scenario.conventionalBullets.map((line) => (
              <li
                key={line}
                className="flex items-start gap-2.5 text-sm leading-relaxed text-[#9AA4B4]"
              >
                <MinusCircle
                  className="mt-1 h-3.5 w-3.5 shrink-0 text-[#64748B]"
                  aria-hidden="true"
                />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-teal-400/30 bg-[#0D151B] p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono-tech text-xs font-semibold tracking-wider text-teal-400">
              NEXLIMB · {scenario.nexlimbHeading}
            </span>
          </div>
          <ul className="mt-3.5 space-y-2.5">
            {scenario.nexlimbBullets.map((line) => (
              <li
                key={line}
                className="flex items-start gap-2.5 text-sm leading-relaxed text-[#E2E8F0]"
              >
                <CheckCircle2
                  className="mt-1 h-3.5 w-3.5 shrink-0 text-teal-400"
                  aria-hidden="true"
                />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Comparison Outcome Bar */}
      <div className="mt-4 grid grid-cols-1 gap-3 rounded-xl border border-white/[0.07] bg-[#0B0D10] p-4 md:grid-cols-3">
        <div>
          <span className="font-mono-tech text-[11px] uppercase tracking-wider text-[#7D8797]">
            Conventional Outcome
          </span>
          <p className="mt-1 text-xs leading-relaxed text-[#9AA4B4]">
            {scenario.outcomeConventional}
          </p>
        </div>
        <div>
          <span className="font-mono-tech text-[11px] uppercase tracking-wider text-teal-400">
            NEXLIMB Outcome
          </span>
          <p className="mt-1 text-xs leading-relaxed text-[#D8DFE9]">
            {scenario.outcomeNexlimb}
          </p>
        </div>
        <div>
          <span className="font-mono-tech text-[11px] uppercase tracking-wider text-teal-300">
            Practical Advantage
          </span>
          <p className="mt-1 font-display text-sm font-semibold text-[#F3F5F8]">
            {scenario.practicalAdvantage}
          </p>
        </div>
      </div>
    </div>
  );
}
