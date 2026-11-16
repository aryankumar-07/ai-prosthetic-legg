import { PROSTHETIC_SENSORS } from '../../data/prostheticSensors';
import type { ProjectedPoint2D } from '../../utils/viewerState';

interface SensorHighlightProps {
  positions: Record<string, ProjectedPoint2D>;
  highlightedIds: string[];
  activeSensorId: string | null;
  onSelectSensor: (sensorId: string) => void;
}

export function SensorHighlight({
  positions,
  highlightedIds,
  activeSensorId,
  onSelectSensor,
}: SensorHighlightProps) {
  const highlightSet = new Set(highlightedIds);

  return (
    <div
      aria-label="Active NEXLIMB sensor indicators"
      className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
    >
      {PROSTHETIC_SENSORS.filter((s) => highlightSet.has(s.id)).map((sensor) => {
        const pt = positions[sensor.id];
        if (!pt || !pt.visible) return null;
        const isActive = activeSensorId === sensor.id;

        return (
          <button
            key={sensor.id}
            type="button"
            data-testid={`p2-highlight-${sensor.id}`}
            onClick={() => onSelectSensor(sensor.id)}
            style={{
              transform: `translate(${pt.x}px, ${pt.y}px) translate(0, -50%)`,
            }}
            aria-label={`Highlight ${sensor.name} (${sensor.code})`}
            aria-pressed={isActive}
            className="pointer-events-auto group absolute left-0 top-0 inline-flex min-h-[32px] items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
          >
            {/* Exact 3D anchor pin */}
            <span
              aria-hidden="true"
              className={`h-2.5 w-2.5 rounded-full border transition-transform group-hover:scale-125 ${
                isActive
                  ? 'border-white bg-teal-300'
                  : 'border-teal-200 bg-teal-400'
              }`}
            />
            {/* Short horizontal leader stem */}
            <span
              aria-hidden="true"
              className="h-px w-4 bg-teal-400/70 sm:w-6"
            />
            {/* Offset callout label clear of prosthetic silhouette */}
            <span
              className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-medium transition-colors whitespace-nowrap sm:text-[11px] ${
                isActive
                  ? 'border-teal-300 bg-[#0D1E22] text-teal-200 shadow-md'
                  : 'border-teal-400/50 bg-[#0D1117]/95 text-[#E2E8F0] group-hover:border-teal-300 group-hover:text-white'
              }`}
            >
              <span className="font-mono-tech font-semibold text-teal-400">
                {sensor.code}
              </span>
              <span className="hidden sm:inline">{sensor.shortLabel}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
