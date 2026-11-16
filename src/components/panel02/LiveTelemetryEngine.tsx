import { Activity, ArrowRight, Cpu, Footprints, Radio, Thermometer } from 'lucide-react';
import type { SimulatedTelemetry } from '../../three/activityKinematics';

interface LiveTelemetryEngineProps {
  telemetry: SimulatedTelemetry;
  isPlaying: boolean;
  angleHistory: number[];
}

export function LiveTelemetryEngine({
  telemetry,
  isPlaying,
  angleHistory,
}: LiveTelemetryEngineProps) {
  const maxAngle = 90;
  const sparkPoints = angleHistory
    .map((deg, idx) => {
      const x = (idx / Math.max(1, angleHistory.length - 1)) * 120;
      const y = 30 - Math.min(28, (Math.max(0, deg) / maxAngle) * 26);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const pipelineNodes = [
    {
      step: '01',
      title: 'SENSORS',
      status: `${telemetry.aiStatus.activeSensors.length} active inputs`,
      detail: 'IMU, plantar FSRs, AS5600, socket probes',
    },
    {
      step: '02',
      title: 'SIGNAL PROCESSING',
      status: isPlaying ? 'Streaming · 100 Hz sim' : 'Paused frame held',
      detail: 'Time-synced filtering & noise rejection',
    },
    {
      step: '03',
      title: 'AI ANALYSIS',
      status: telemetry.aiStatus.gaitPhase,
      detail: telemetry.aiStatus.baselineStatus,
    },
    {
      step: '04',
      title: 'USER INSIGHT',
      status: telemetry.aiStatus.detectedActivity,
      detail: telemetry.aiStatus.insight,
    },
  ];

  return (
    <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-12">
      {/* Left 7 Cols: Live Sensor Activity Panel (SIMULATED SENSOR DATA) */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#12161E] p-5 lg:col-span-7">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-display text-base font-semibold text-[#F3F5F8]">
              NEXLIMB Live Sensor Activity
            </h3>
            <p className="text-xs text-[#8E98A8]">
              Synchronized continuously with the active 3D movement cycle (Conventional leg outputs 0 channels).
            </p>
          </div>
          <span className="font-mono-tech text-[11px] font-semibold tracking-wider text-teal-400">
            SIMULATED SENSOR DATA
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* 1. IMU Card */}
          <div className="rounded-xl border border-white/[0.06] bg-[#0B0D10] p-3.5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E2E8F0]">
                <Radio className="h-3.5 w-3.5 text-teal-400" aria-hidden="true" />
                <span>9-DOF IMU</span>
              </span>
              <span className="font-mono-tech text-[11px] text-[#7D8797]">BNO085 Sim</span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 font-mono-tech text-xs tabular-nums">
              <div>
                <span className="block text-[10px] text-[#7D8797]">Accel</span>
                <span className="text-[#F3F5F8]">{telemetry.imu.accelG.toFixed(2)} g</span>
              </div>
              <div>
                <span className="block text-[10px] text-[#7D8797]">Pitch / Roll</span>
                <span className="text-teal-300">
                  {telemetry.imu.pitchDeg}° / {telemetry.imu.rollDeg}°
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-[#7D8797]">Ang. Vel</span>
                <span className="text-[#F3F5F8]">{telemetry.imu.gyroDegS}°/s</span>
              </div>
            </div>
          </div>

          {/* 2. Foot Pressure Card */}
          <div className="rounded-xl border border-white/[0.06] bg-[#0B0D10] p-3.5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E2E8F0]">
                <Footprints className="h-3.5 w-3.5 text-teal-400" aria-hidden="true" />
                <span>Foot Pressure</span>
              </span>
              <span className="font-mono-tech text-[11px] text-[#7D8797]">5-Zone FSR</span>
            </div>
            <div className="mt-2.5 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono-tech tabular-nums">
                <span className="text-[#8E98A8]">Heel Loading</span>
                <span className="text-teal-300">{telemetry.footPressure.heelPct}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded bg-white/10">
                <div
                  className="h-full bg-teal-400 transition-[width] duration-100"
                  style={{ width: `${telemetry.footPressure.heelPct}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono-tech tabular-nums">
                <span className="text-[#8E98A8]">Forefoot Loading</span>
                <span className="text-cyan-300">{telemetry.footPressure.forefootPct}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded bg-white/10">
                <div
                  className="h-full bg-cyan-400 transition-[width] duration-100"
                  style={{ width: `${telemetry.footPressure.forefootPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* 3. Joint Angle Card */}
          <div className="rounded-xl border border-white/[0.06] bg-[#0B0D10] p-3.5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E2E8F0]">
                <Activity className="h-3.5 w-3.5 text-teal-400" aria-hidden="true" />
                <span>Joint Angle</span>
              </span>
              <span className="font-mono-tech text-[11px] text-teal-300 tabular-nums">
                Knee {telemetry.jointAngle.kneeDeg}° · Ankle {telemetry.jointAngle.ankleDeg}°
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3">
              <svg
                viewBox="0 0 120 34"
                className="h-8 w-full rounded bg-[#11151C] px-1"
                aria-hidden="true"
              >
                <polyline
                  fill="none"
                  stroke="#14B8A6"
                  strokeWidth="1.8"
                  points={sparkPoints || '0,28 120,28'}
                />
              </svg>
              <span className="font-mono-tech text-[11px] text-[#9AA4B4] whitespace-nowrap">
                {telemetry.jointAngle.phaseLabel}
              </span>
            </div>
          </div>

          {/* 4. Socket Monitoring Card */}
          <div className="rounded-xl border border-white/[0.06] bg-[#0B0D10] p-3.5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E2E8F0]">
                <Thermometer className="h-3.5 w-3.5 text-teal-400" aria-hidden="true" />
                <span>Socket Monitoring</span>
              </span>
              <span className="font-mono-tech text-[11px] text-[#7D8797]">6-Region Array</span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 font-mono-tech text-xs tabular-nums">
              <div>
                <span className="block text-[10px] text-[#7D8797]">Peak Load</span>
                <span
                  className={
                    telemetry.socket.peakPressureKpa > 75 ? 'text-amber-300' : 'text-[#F3F5F8]'
                  }
                >
                  {telemetry.socket.peakPressureKpa} kPa
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-[#7D8797]">Temp</span>
                <span className={telemetry.socket.tempC > 34 ? 'text-amber-300' : 'text-[#F3F5F8]'}>
                  {telemetry.socket.tempC.toFixed(1)} °C
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-[#7D8797]">Humidity</span>
                <span
                  className={
                    telemetry.socket.humidityPct > 68 ? 'text-amber-300' : 'text-teal-300'
                  }
                >
                  {telemetry.socket.humidityPct}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right 5 Cols: Live AI Intelligence Engine Flow */}
      <div className="rounded-2xl border border-teal-400/25 bg-[#111720] p-5 lg:col-span-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-teal-400" aria-hidden="true" />
            <h3 className="font-display text-base font-semibold text-[#F3F5F8]">
              Live AI Intelligence Engine
            </h3>
          </div>
          <span className="font-mono-tech text-[11px] text-[#8E98A8]">
            Simulated Pipeline
          </span>
        </div>

        <div className="mt-4 space-y-2.5">
          {pipelineNodes.map((node, idx) => (
            <div key={node.step} className="relative">
              <div className="rounded-xl border border-white/[0.08] bg-[#0B0E14] px-3.5 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono-tech text-[11px] font-semibold tracking-wider text-teal-400">
                    {node.step} · {node.title}
                  </span>
                  <span className="font-mono-tech text-[11px] text-[#E2E8F0] truncate max-w-[190px]">
                    {node.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#9AA4B4]">{node.detail}</p>
              </div>
              {idx < pipelineNodes.length - 1 && (
                <div className="flex justify-center py-0.5" aria-hidden="true">
                  <ArrowRight className="h-3 w-3 rotate-90 text-teal-400/70" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
