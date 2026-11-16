import { Compass } from 'lucide-react';
import { TERRAIN_CONDITIONS } from '../../data/panel02Data';
import type { TerrainCondition } from '../../three/activityKinematics';

interface TerrainDemonstrationProps {
  terrainCondition: TerrainCondition;
  onSelectTerrain: (condition: TerrainCondition) => void;
}

export function TerrainDemonstration({
  terrainCondition,
  onSelectTerrain,
}: TerrainDemonstrationProps) {
  const activeTerrain =
    TERRAIN_CONDITIONS.find((t) => t.id === terrainCondition) ?? TERRAIN_CONDITIONS[0];

  return (
    <div className="mt-5 rounded-2xl border border-white/[0.08] bg-[#12161E] p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="font-display text-base font-semibold text-[#F3F5F8]">
            Selectable Terrain &amp; Movement Condition
          </h4>
          <p className="text-xs text-[#8E98A8]">
            Switch surfaces to update the 3D walking ground geometry, IMU orientation behavior, and logged gait insight.
          </p>
        </div>
        <span className="font-mono-tech text-[11px] font-semibold text-teal-400">
          MONITORING ONLY · NO ACTIVE ACTUATION CLAIMED
        </span>
      </div>

      {/* 3 Terrain Buttons */}
      <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        {TERRAIN_CONDITIONS.map((item) => {
          const active = item.id === terrainCondition;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTerrain(item.id)}
              aria-pressed={active}
              className={`rounded-xl border p-3.5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 ${
                active
                  ? 'border-teal-400/60 bg-teal-500/15 text-[#F3F5F8]'
                  : 'border-white/[0.07] bg-[#0B0D10] text-[#9AA4B4] hover:border-white/20 hover:text-white'
              }`}
            >
              <span className="font-mono-tech text-xs font-semibold text-teal-400">
                {item.label}
              </span>
              <p className="mt-1 text-xs leading-relaxed text-[#A1AAB8]">
                {item.surfaceDescription}
              </p>
            </button>
          );
        })}
      </div>

      {/* Telemetry & Movement Change Card */}
      <div className="mt-4 grid grid-cols-1 gap-4 rounded-xl border border-white/[0.06] bg-[#0B0E14] p-4 md:grid-cols-3">
        <div>
          <span className="font-mono-tech text-[11px] text-[#7D8797] uppercase">
            IMU Orientation Change
          </span>
          <p className="mt-1.5 text-xs font-medium text-[#E2E8F0]">
            {activeTerrain.orientationChange}
          </p>
        </div>
        <div>
          <span className="font-mono-tech text-[11px] text-[#7D8797] uppercase">
            Plantar Loading Shift
          </span>
          <p className="mt-1.5 text-xs font-medium text-[#E2E8F0]">
            {activeTerrain.loadingShift}
          </p>
        </div>
        <div className="rounded-lg border border-teal-400/25 bg-teal-500/[0.06] p-3">
          <div className="flex items-center gap-1.5">
            <Compass className="h-3.5 w-3.5 text-teal-400" aria-hidden="true" />
            <span className="font-mono-tech text-[11px] font-semibold text-teal-300">
              {activeTerrain.detectionTitle}
            </span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-[#CBD5E1]">
            {activeTerrain.detectionMessage}
          </p>
        </div>
      </div>
    </div>
  );
}
