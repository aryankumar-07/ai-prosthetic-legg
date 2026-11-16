import { ArrowDown } from 'lucide-react';
import { COMPARISON_PILLARS } from '../../data/panel02Data';

interface ComparisonSummaryProps {
  onExploreComfortLab: () => void;
}

export function ComparisonSummary({ onExploreComfortLab }: ComparisonSummaryProps) {
  return (
    <div className="mt-12 rounded-2xl border border-white/[0.08] bg-[#12161E] p-6 sm:p-8">
      <div className="max-w-3xl">
        <p className="font-mono-tech text-xs font-medium tracking-[0.16em] text-teal-400 uppercase">
          Comparison Conclusion
        </p>
        <h3
          style={{ textWrap: 'balance' }}
          className="mt-2 font-display text-2xl font-semibold tracking-tight text-[#F3F5F8] sm:text-3xl"
        >
          MORE THAN MECHANICAL FUNCTIONALITY. AN INTELLIGENT LAYER BUILT AROUND IT.
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-[#9AA4B4]">
          NEXLIMB builds upon conventional prosthetic engineering by introducing intelligent sensing, meaningful movement insights, and a more serviceable modular architecture. The objective is not to replace the fundamental mechanical function of a prosthetic, but to introduce additional capabilities around it.
        </p>
      </div>

      {/* Three Major Differences */}
      <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-3">
        {COMPARISON_PILLARS.map((pillar) => (
          <div
            key={pillar.code}
            className="rounded-xl border border-white/[0.07] bg-[#0B0E14] p-5"
          >
            <span className="font-mono-tech text-xs font-semibold text-teal-400">
              {pillar.code}
            </span>
            <h4 className="mt-1.5 font-display text-base font-semibold text-[#F3F5F8] uppercase">
              {pillar.title}
            </h4>
            <p className="mt-2 text-xs leading-relaxed text-[#9AA4B4]">
              {pillar.description}
            </p>
          </div>
        ))}
      </div>

      {/* Transition Indicator to Next Section */}
      <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.07] pt-5">
        <span className="font-mono-tech text-xs text-[#7D8797]">
          NEXT · EXPLORE SOCKET COMFORT &amp; SENSOR ANATOMY
        </span>
        <button
          type="button"
          onClick={onExploreComfortLab}
          className="inline-flex items-center gap-2 rounded-lg border border-teal-400/40 bg-teal-500/10 px-4 py-2 text-xs font-semibold tracking-wide text-teal-300 transition-colors hover:bg-teal-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 whitespace-nowrap shrink-0 uppercase"
        >
          <span>Continue to Comfort Lab</span>
          <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
