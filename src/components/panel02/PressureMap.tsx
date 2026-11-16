import { useState } from 'react';
import { SOCKET_PRESSURE_POINTS } from '../../data/panel02Data';

export function PressureMap() {
  const [selectedPointId, setSelectedPointId] = useState<string>(SOCKET_PRESSURE_POINTS[0].id);
  const selectedPoint =
    SOCKET_PRESSURE_POINTS.find((pt) => pt.id === selectedPointId) ?? SOCKET_PRESSURE_POINTS[0];

  const maxTrend = 95;
  const trendPolyline = selectedPoint.trendSeries
    .map((val, idx) => {
      const x = 14 + idx * 42;
      const y = 78 - (val / maxTrend) * 62;
      return `${x},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <div className="mt-5 rounded-2xl border border-white/[0.08] bg-[#12161E] p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="font-display text-base font-semibold text-[#F3F5F8]">
            Interactive Socket Pressure Distribution Map
          </h4>
          <p className="text-xs text-[#8E98A8]">
            Select any monitored point inside the semi-transparent socket cross-section to inspect simulated relative load and trend history.
          </p>
        </div>
        <span className="font-mono-tech text-[11px] font-semibold text-teal-400">
          SIMULATED PRESSURE MAP · NON-DIAGNOSTIC
        </span>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Left: Interactive Semi-Transparent Socket Cross-Section SVG */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-white/[0.06] bg-[#0B0D10] p-4 lg:col-span-5">
          <svg
            viewBox="0 0 280 265"
            className="h-60 w-full max-w-[270px]"
            role="img"
            aria-label="Semi-transparent NEXLIMB socket pressure distribution cross-section"
          >
            {/* Semi-transparent carbon outer shell silhouette */}
            <path
              d="M54 34 C46 115, 62 195, 96 244 L184 244 C216 195, 232 115, 226 34 C198 54, 174 62, 140 62 C106 62, 82 54, 54 34 Z"
              fill="rgba(20, 184, 166, 0.08)"
              stroke="rgba(148, 163, 184, 0.35)"
              strokeWidth="1.5"
            />
            {/* Inner comfort liner contour */}
            <path
              d="M68 44 C64 118, 78 186, 106 232 L174 232 C202 186, 214 118, 212 44"
              fill="none"
              stroke="rgba(203, 213, 225, 0.25)"
              strokeDasharray="4 4"
              strokeWidth="1.2"
            />
            {/* Copper flex trace routing down */}
            {SOCKET_PRESSURE_POINTS.map((pt) => (
              <line
                key={`trace-${pt.id}`}
                x1={pt.svgX}
                y1={pt.svgY}
                x2="140"
                y2="246"
                stroke="rgba(217, 168, 67, 0.35)"
                strokeWidth="1.2"
              />
            ))}
            {/* Interactive Pressure Monitoring Points */}
            {SOCKET_PRESSURE_POINTS.map((pt) => {
              const isSelected = pt.id === selectedPoint.id;
              const fill =
                pt.status === 'elevated'
                  ? '#F59E0B'
                  : pt.status === 'watch'
                    ? '#38BDF8'
                    : '#14B8A6';
              return (
                <g key={pt.id}>
                  <circle
                    cx={pt.svgX}
                    cy={pt.svgY}
                    r={isSelected ? 19 : 13}
                    fill={fill}
                    fillOpacity={isSelected ? 0.28 : 0.14}
                  />
                  <circle
                    cx={pt.svgX}
                    cy={pt.svgY}
                    r={isSelected ? 9 : 7}
                    fill={fill}
                    stroke="#0B0D10"
                    strokeWidth="2"
                  />
                </g>
              );
            })}
          </svg>

          {/* Selectable Point Buttons */}
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            {SOCKET_PRESSURE_POINTS.map((pt) => {
              const active = pt.id === selectedPoint.id;
              return (
                <button
                  key={pt.id}
                  type="button"
                  onClick={() => setSelectedPointId(pt.id)}
                  aria-pressed={active}
                  className={`rounded-md border px-2 py-1 text-[11px] font-mono-tech transition-colors whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 ${
                    active
                      ? 'border-teal-400/60 bg-teal-500/20 text-teal-200'
                      : 'border-white/10 bg-[#12161E] text-[#8E98A8] hover:text-white'
                  }`}
                >
                  {pt.code} · {pt.regionName.split(' ')[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Point Value, Historical Trend & Pressure Pattern Change Notice */}
        <div className="flex flex-col justify-between gap-4 lg:col-span-7">
          <div className="rounded-xl border border-white/[0.06] bg-[#0B0E14] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-mono-tech text-[11px] text-teal-400">
                  {selectedPoint.code} · MONITORED REGION
                </span>
                <h5 className="font-display text-base font-semibold text-[#F3F5F8]">
                  {selectedPoint.regionName}
                </h5>
              </div>
              <div className="text-right font-mono-tech tabular-nums">
                <span
                  className={`text-lg font-semibold ${
                    selectedPoint.status === 'elevated'
                      ? 'text-amber-300'
                      : selectedPoint.status === 'watch'
                        ? 'text-sky-300'
                        : 'text-teal-300'
                  }`}
                >
                  {selectedPoint.simulatedKpa} kPa
                </span>
                <span className="block text-[11px] text-[#7D8797]">
                  Baseline: {selectedPoint.baselineKpa} kPa (Simulated)
                </span>
              </div>
            </div>

            <p className="mt-2.5 text-xs leading-relaxed text-[#CBD5E1]">
              {selectedPoint.explanation}
            </p>

            {/* Historical Trend Chart */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-[11px] font-mono-tech text-[#7D8797]">
                <span>6-Hour Simulated Trend</span>
                <span>0h → 6h</span>
              </div>
              <svg
                viewBox="0 0 240 88"
                className="mt-1.5 h-20 w-full rounded-lg bg-[#090B0E] p-1"
                aria-hidden="true"
              >
                <line
                  x1="10"
                  y1={78 - (selectedPoint.baselineKpa / maxTrend) * 62}
                  x2="230"
                  y2={78 - (selectedPoint.baselineKpa / maxTrend) * 62}
                  stroke="rgba(148,163,184,0.3)"
                  strokeDasharray="3 3"
                />
                <polyline
                  fill="none"
                  stroke={selectedPoint.status === 'elevated' ? '#F59E0B' : '#14B8A6'}
                  strokeWidth="2.2"
                  points={trendPolyline}
                />
              </svg>
            </div>
          </div>

          {/* Sample Notification */}
          <div className="rounded-xl border border-amber-400/35 bg-amber-500/[0.06] p-4">
            <span className="font-mono-tech text-[11px] font-semibold tracking-wider text-amber-300">
              PRESSURE PATTERN CHANGE · SAMPLE APP NOTICE
            </span>
            <p className="mt-1 text-xs leading-relaxed text-[#D8DFE9]">
              A higher-than-usual pressure concentration has been recorded in one monitored region. Consider inspecting socket fit and comfort. Seek professional assessment if discomfort continues.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
