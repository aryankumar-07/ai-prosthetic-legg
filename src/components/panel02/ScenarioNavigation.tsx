import { PANEL02_SCENARIOS } from '../../data/panel02Data';
import type { ScenarioId } from '../../three/activityKinematics';

interface ScenarioNavigationProps {
  activeScenarioId: ScenarioId;
  onSelectScenario: (id: ScenarioId) => void;
}

export function ScenarioNavigation({
  activeScenarioId,
  onSelectScenario,
}: ScenarioNavigationProps) {
  return (
    <div className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono-tech text-xs font-medium tracking-[0.14em] text-teal-400 uppercase">
          Interactive Scenario Explorer · Select 1 of 5 Real-World Situations
        </p>
        <span className="text-xs text-[#7D8797]">
          Both prosthetics remain synchronized as you switch scenarios
        </span>
      </div>

      <nav
        aria-label="Comparison scenarios"
        className="mt-3 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap"
      >
        {PANEL02_SCENARIOS.map((sc) => {
          const active = sc.id === activeScenarioId;
          return (
            <button
              key={sc.id}
              type="button"
              onClick={() => onSelectScenario(sc.id)}
              aria-pressed={active}
              className={`rounded-xl border px-3.5 py-2.5 text-left text-xs font-medium transition-colors whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 ${
                active
                  ? 'border-teal-400/60 bg-teal-500/15 text-[#F3F5F8]'
                  : 'border-white/[0.08] bg-[#12161E] text-[#8E98A8] hover:border-white/20 hover:text-white'
              }`}
            >
              <span className={active ? 'text-teal-300' : 'text-[#9AA4B4]'}>
                {sc.navLabel}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
