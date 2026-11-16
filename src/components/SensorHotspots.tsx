import { PROSTHETIC_SENSORS } from '../data/prostheticSensors';
import type { ProjectedPoint2D, VisualMode } from '../utils/viewerState';

interface SensorHotspotsProps {
  projectedPositions: Record<string, ProjectedPoint2D>;
  activeSensorId: string | null;
  hoveredSensorId: string | null;
  visualMode: VisualMode;
  onSelectSensor: (sensorId: string) => void;
  onHoverSensor: (sensorId: string | null) => void;
}

export function SensorHotspots({
  projectedPositions,
  activeSensorId,
  hoveredSensorId,
  visualMode,
  onSelectSensor,
  onHoverSensor,
}: SensorHotspotsProps) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
      aria-label="Interactive prosthetic sensor hotspots"
    >
      {PROSTHETIC_SENSORS.map((sensor) => {
        const pos = projectedPositions[sensor.id];
        if (!pos || !pos.visible) return null;

        const isActive = activeSensorId === sensor.id;
        const isHovered = hoveredSensorId === sensor.id;
        const emphasizeLabel = isActive || isHovered || visualMode === 'sensors';

        return (
          <div
            key={sensor.id}
            style={{
              transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
            }}
            className="pointer-events-auto absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2"
          >
            <button
              type="button"
              onClick={() => onSelectSensor(sensor.id)}
              onMouseEnter={() => onHoverSensor(sensor.id)}
              onMouseLeave={() => onHoverSensor(null)}
              onFocus={() => onHoverSensor(sensor.id)}
              onBlur={() => onHoverSensor(null)}
              aria-label={`Inspect ${sensor.name}`}
              aria-pressed={isActive}
              data-testid={`hotspot-${sensor.id}`}
              className="group relative flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
            >
              {/* Outer precision reticle ring */}
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full border transition-all duration-150 ${
                  isActive
                    ? 'scale-110 border-teal-300 bg-teal-400/25 shadow-[0_0_12px_rgba(45,212,191,0.5)]'
                    : isHovered || visualMode === 'sensors'
                      ? 'scale-105 border-teal-400 bg-[#0B0D10]/90'
                      : 'border-white/50 bg-[#0B0D10]/80 group-hover:border-teal-400'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full transition-colors ${
                    isActive
                      ? 'bg-teal-300'
                      : isHovered || visualMode === 'sensors'
                        ? 'bg-teal-400'
                        : 'bg-white/85 group-hover:bg-teal-300'
                  }`}
                />
              </span>

              {/* Compact callout label — shown only on hover, active, or Sensor Highlight mode */}
              {emphasizeLabel && (
                <span
                  className={`pointer-events-none absolute left-full ml-1.5 flex items-center gap-1.5 rounded border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap transition-opacity duration-150 ${
                    isActive
                      ? 'border-teal-400/70 bg-[#10151D]/95 text-teal-200'
                      : 'border-white/12 bg-[#10141B]/90 text-[#E2E8F0]'
                  }`}
                >
                  <span className="font-mono-tech text-[10px] text-teal-400">
                    {sensor.code}
                  </span>
                  <span>{sensor.shortLabel}</span>
                </span>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}
