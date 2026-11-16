import { AlertTriangle, Clock } from 'lucide-react';

interface SocketMonitoringVisualizationProps {
  wearProgress01: number;
  onChangeWearProgress: (val: number) => void;
}

export function SocketMonitoringVisualization({
  wearProgress01,
  onChangeWearProgress,
}: SocketMonitoringVisualizationProps) {
  const hours = Number((wearProgress01 * 6).toFixed(1));
  const simTemp = Number((31.2 + wearProgress01 * 4.1).toFixed(1));
  const simHumidity = Math.round(44 + wearProgress01 * 36);
  const simPressure = Math.round(46 + wearProgress01 * 38);
  const noticeTriggered = wearProgress01 >= 0.6;

  return (
    <div className="mt-5 rounded-2xl border border-white/[0.08] bg-[#12161E] p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="font-display text-base font-semibold text-[#F3F5F8]">
            Extended-Wear Socket Environment Simulation
          </h4>
          <p className="text-xs text-[#8E98A8]">
            Scrub across a 6-hour wear session to observe how internal pressure concentration, heat, and moisture change inside the semi-transparent socket.
          </p>
        </div>
        <span className="font-mono-tech text-[11px] font-semibold text-teal-400">
          SIMULATED READINGS · NON-DIAGNOSTIC
        </span>
      </div>

      {/* Wear Duration Scrubber */}
      <div className="mt-4 rounded-xl border border-white/[0.06] bg-[#0B0E14] p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label
            htmlFor="wear-duration-range"
            className="inline-flex items-center gap-2 text-xs font-medium text-[#E2E8F0]"
          >
            <Clock className="h-3.5 w-3.5 text-teal-400" aria-hidden="true" />
            <span>Simulated Wear Duration</span>
          </label>
          <span className="font-mono-tech text-sm font-semibold text-teal-300 tabular-nums">
            {hours} hrs continuous wear
          </span>
        </div>

        <input
          id="wear-duration-range"
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={wearProgress01}
          onChange={(e) => onChangeWearProgress(parseFloat(e.target.value))}
          className="mt-3 h-2 w-full cursor-pointer accent-teal-400"
        />

        <div className="mt-2 flex justify-between text-[11px] font-mono-tech text-[#7D8797]">
          <button
            type="button"
            onClick={() => onChangeWearProgress(0.15)}
            className="hover:text-white focus:outline-none focus-visible:underline"
          >
            0.9 hr (Fresh Fit)
          </button>
          <button
            type="button"
            onClick={() => onChangeWearProgress(0.5)}
            className="hover:text-white focus:outline-none focus-visible:underline"
          >
            3.0 hrs (Mid-Day)
          </button>
          <button
            type="button"
            onClick={() => onChangeWearProgress(0.9)}
            className="hover:text-teal-300 focus:outline-none focus-visible:underline"
          >
            5.4 hrs (Extended Wear)
          </button>
        </div>
      </div>

      {/* Readings + Sample Notification */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="grid grid-cols-3 gap-3 lg:col-span-6">
          <div className="rounded-xl border border-white/[0.06] bg-[#0B0D10] p-3.5">
            <span className="font-mono-tech text-[11px] text-[#7D8797]">Peak Region Load</span>
            <p
              className={`mt-1.5 font-mono-tech text-xl font-semibold tabular-nums ${
                noticeTriggered ? 'text-amber-300' : 'text-[#F3F5F8]'
              }`}
            >
              {simPressure} kPa
            </p>
            <span className="mt-1 block text-[11px] text-[#8E98A8]">
              {noticeTriggered ? 'Elevated concentration' : 'Within baseline'}
            </span>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-[#0B0D10] p-3.5">
            <span className="font-mono-tech text-[11px] text-[#7D8797]">Socket Temp</span>
            <p
              className={`mt-1.5 font-mono-tech text-xl font-semibold tabular-nums ${
                noticeTriggered ? 'text-amber-300' : 'text-[#F3F5F8]'
              }`}
            >
              {simTemp} °C
            </p>
            <span className="mt-1 block text-[11px] text-[#8E98A8]">
              {noticeTriggered ? 'Thermal buildup' : 'Steady liner state'}
            </span>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-[#0B0D10] p-3.5">
            <span className="font-mono-tech text-[11px] text-[#7D8797]">Relative Humidity</span>
            <p
              className={`mt-1.5 font-mono-tech text-xl font-semibold tabular-nums ${
                noticeTriggered ? 'text-amber-300' : 'text-teal-300'
              }`}
            >
              {simHumidity}%
            </p>
            <span className="mt-1 block text-[11px] text-[#8E98A8]">
              {noticeTriggered ? 'Moisture rise' : 'Ventilation balanced'}
            </span>
          </div>
        </div>

        {/* Sample Socket Condition Notice */}
        <div
          className={`rounded-xl border p-4 lg:col-span-6 ${
            noticeTriggered
              ? 'border-amber-400/40 bg-amber-500/[0.07]'
              : 'border-teal-400/25 bg-teal-500/[0.05]'
          }`}
        >
          <div className="flex items-start gap-2.5">
            <AlertTriangle
              className={`mt-0.5 h-4 w-4 shrink-0 ${
                noticeTriggered ? 'text-amber-300' : 'text-teal-400'
              }`}
              aria-hidden="true"
            />
            <div>
              <p className="font-mono-tech text-xs font-semibold tracking-wider text-[#F3F5F8]">
                {noticeTriggered ? 'SOCKET CONDITION NOTICE (SIMULATED)' : 'NOMINAL WEAR STATE (SIMULATED)'}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[#CBD5E1]">
                {noticeTriggered
                  ? 'Unusual pressure and environmental changes detected. Consider checking socket comfort and inspecting the monitored area. Consult your prosthetist if discomfort persists.'
                  : 'Monitored pressure, temperature, and humidity remain close to your baseline wear profile. Scrub past 3.5 hrs to simulate extended wear buildup.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
