export type ActivityId =
  | 'walking'
  | 'climbing-stairs'
  | 'descending-stairs'
  | 'uneven-terrain'
  | 'standing'
  | 'sitting';

export type TerrainCondition = 'flat' | 'incline' | 'uneven';

export type ScenarioId =
  | 'walking'
  | 'extended-wear'
  | 'uneven-terrain'
  | 'pressure-awareness'
  | 'maintenance';

export type ProstheticVariant = 'conventional' | 'nexlimb';

export interface ActivityPose {
  rootY: number;
  rootZ: number;
  hipPitch: number;
  kneeFlexion: number;
  ankleDorsi: number;
  ankleRoll: number;
  footToeBend: number;
  impactJolt: number;
  heelLoad01: number;
  forefootLoad01: number;
  gaitPhaseIndex: number;
  gaitPhaseLabel: string;
}

export interface SimulatedTelemetry {
  imu: {
    accelG: number;
    pitchDeg: number;
    rollDeg: number;
    gyroDegS: number;
  };
  footPressure: {
    heelPct: number;
    midfootPct: number;
    forefootPct: number;
    toePct: number;
  };
  jointAngle: {
    kneeDeg: number;
    ankleDeg: number;
    phaseLabel: string;
  };
  socket: {
    peakPressureKpa: number;
    tempC: number;
    humidityPct: number;
  };
  aiStatus: {
    detectedActivity: string;
    gaitPhase: string;
    baselineStatus: string;
    insight: string;
    activeSensors: string[];
  };
}

const TAU = Math.PI * 2;

const GAIT_STAGE_LABELS = [
  'Initial Contact',
  'Loading Response',
  'Mid-Stance',
  'Terminal Stance & Toe-Off',
  'Swing Phase',
] as const;

export function normalizePhase(phase: number): number {
  const mod = phase % 1;
  return mod < 0 ? mod + 1 : mod;
}

export function getGaitStageIndex(phase: number): number {
  const p = normalizePhase(phase);
  if (p < 0.14) return 0; // Initial contact
  if (p < 0.30) return 1; // Loading response
  if (p < 0.48) return 2; // Mid-stance
  if (p < 0.65) return 3; // Terminal stance & toe-off
  return 4; // Swing phase
}

/**
 * Computes periodic, mechanically plausible kinematic joint angles (radians) and
 * ground loading fractions for both conventional passive mechanical and NEXLIMB
 * intelligent prosthetics across 6 everyday activities.
 */
export function computeActivityPose(
  activityId: ActivityId,
  rawPhase: number,
  variant: ProstheticVariant,
  terrainCondition: TerrainCondition = 'flat',
): ActivityPose {
  const p = normalizePhase(rawPhase);
  const w = p * TAU;
  const isConv = variant === 'conventional';

  // Terrain modifier applied during walking / uneven terrain
  const terrainRoughness =
    activityId === 'uneven-terrain' || terrainCondition === 'uneven'
      ? 1
      : terrainCondition === 'incline'
        ? 0.45
        : 0;

  if (activityId === 'standing') {
    const gentleSway = Math.sin(w);
    const hipPitch = gentleSway * 0.015;
    const kneeFlexion = 0.04 + Math.sin(w * 0.5) * 0.01;
    const ankleDorsi = -hipPitch * 0.6;
    const ankleRoll = Math.cos(w) * (isConv ? 0.012 : 0.018);

    return {
      rootY: 0,
      rootZ: 0,
      hipPitch,
      kneeFlexion,
      ankleDorsi,
      ankleRoll,
      footToeBend: 0,
      impactJolt: 0,
      heelLoad01: 0.54 + gentleSway * 0.06,
      forefootLoad01: 0.46 - gentleSway * 0.06,
      gaitPhaseIndex: 2,
      gaitPhaseLabel: 'Quiet Stance Balance',
    };
  }

  if (activityId === 'sitting') {
    // Smooth periodic Sit -> Rest -> Stand cycle (0..0.35 sit down, 0.35..0.65 seated, 0.65..1.0 stand up)
    let sitFactor = 0;
    let phaseLabel = 'Standing Readiness';
    if (p < 0.35) {
      const t = p / 0.35;
      sitFactor = 0.5 - 0.5 * Math.cos(t * Math.PI);
      phaseLabel = 'Controlled Descent to Seat';
    } else if (p < 0.65) {
      sitFactor = 1;
      phaseLabel = 'Seated Rest Posture';
    } else {
      const t = (p - 0.65) / 0.35;
      sitFactor = 0.5 + 0.5 * Math.cos(t * Math.PI);
      phaseLabel = 'Sit-to-Stand Extension';
    }

    const kneeFlexion = sitFactor * (isConv ? 1.38 : 1.44); // ~80-83 deg knee flexion
    const hipPitch = -sitFactor * 0.44;
    const ankleDorsi = sitFactor * (isConv ? 0.05 : 0.22); // Rigid SACH foot flexes far less
    const rootY = -sitFactor * 0.48;
    const rootZ = -sitFactor * 0.28;

    return {
      rootY,
      rootZ,
      hipPitch,
      kneeFlexion,
      ankleDorsi,
      ankleRoll: 0,
      footToeBend: sitFactor * (isConv ? 0.01 : 0.08),
      impactJolt: isConv && p > 0.3 && p < 0.38 ? 0.018 : 0,
      heelLoad01: 0.62 - sitFactor * 0.45,
      forefootLoad01: 0.38 - sitFactor * 0.3,
      gaitPhaseIndex: sitFactor > 0.5 ? 2 : 1,
      gaitPhaseLabel: phaseLabel,
    };
  }

  if (activityId === 'climbing-stairs') {
    const stageIdx = getGaitStageIndex(p);
    // Lift foot onto upper tread during swing (0.55..0.95), pull body upward during stance
    const swingUp = p > 0.52 ? Math.sin(((p - 0.52) / 0.48) * Math.PI) : 0;
    const kneeFlexion =
      0.28 +
      0.86 * Math.max(0, Math.sin(w - 0.85)) +
      (isConv ? 0.05 * Math.sin(w * 2) : 0);
    const hipPitch = -0.22 + 0.42 * Math.sin(w - 0.6);
    const ankleDorsi = isConv
      ? 0.04 * Math.sin(w)
      : 0.16 * Math.sin(w + 0.35) - 0.06;
    const rootY = 0.06 + swingUp * 0.34;
    const rootZ = 0.12 * Math.sin(w - 0.9);
    const impactJolt = isConv && p < 0.12 ? Math.sin((p / 0.12) * Math.PI) * 0.028 : 0;

    return {
      rootY,
      rootZ,
      hipPitch,
      kneeFlexion: Math.max(0.05, kneeFlexion),
      ankleDorsi,
      ankleRoll: isConv ? Math.sin(w * 3) * 0.022 : 0.008 * Math.sin(w),
      footToeBend: p > 0.15 && p < 0.58 ? (isConv ? 0.02 : 0.18) : 0,
      impactJolt,
      heelLoad01: p < 0.55 ? 0.22 : 0,
      forefootLoad01: p < 0.58 ? 0.86 * Math.sin((p / 0.58) * Math.PI) : 0,
      gaitPhaseIndex: stageIdx,
      gaitPhaseLabel: GAIT_STAGE_LABELS[stageIdx],
    };
  }

  if (activityId === 'descending-stairs') {
    const stageIdx = getGaitStageIndex(p);
    const lowerDrop = p < 0.58 ? Math.sin((p / 0.58) * Math.PI * 0.7) : 0;
    const kneeFlexion =
      0.18 +
      0.78 * Math.max(0, Math.sin(w - 0.3)) +
      (p < 0.45 ? 0.32 * Math.sin((p / 0.45) * Math.PI) : 0);
    const hipPitch = -0.1 + 0.28 * Math.sin(w - 0.8);
    const ankleDorsi = isConv
      ? -0.05 + 0.04 * Math.cos(w)
      : -0.14 + 0.22 * Math.sin(w + 0.2);
    const rootY = 0.05 + (p > 0.58 ? Math.sin(((p - 0.58) / 0.42) * Math.PI) * 0.22 : -lowerDrop * 0.04);
    const rootZ = -0.08 * Math.cos(w);
    const impactJolt = isConv && p > 0.1 && p < 0.24 ? Math.sin(((p - 0.1) / 0.14) * Math.PI) * 0.036 : 0;

    return {
      rootY: Math.max(0, rootY),
      rootZ,
      hipPitch,
      kneeFlexion: Math.max(0.05, kneeFlexion),
      ankleDorsi,
      ankleRoll: isConv ? Math.sin(w * 2.5) * 0.024 : 0.01 * Math.cos(w),
      footToeBend: p < 0.52 ? (isConv ? 0.025 : 0.2) : 0,
      impactJolt,
      heelLoad01: p > 0.14 && p < 0.48 ? 0.62 : 0,
      forefootLoad01: p < 0.55 ? 0.78 : 0,
      gaitPhaseIndex: stageIdx,
      gaitPhaseLabel: GAIT_STAGE_LABELS[stageIdx],
    };
  }

  // Normal Walking & Uneven Terrain (cyclic 0..1 gait stride)
  const stageIdx = getGaitStageIndex(p);
  const inclineBias = terrainCondition === 'incline' ? 0.08 : 0;
  const unevenOsc = terrainRoughness * Math.sin(w * 2 + 0.4);

  // Hip pitch: swings forward (-0.28 rad) toward initial contact, sweeps backward (+0.22 rad) at toe-off
  const hipPitch = -0.26 * Math.cos(w) + inclineBias * 0.5;

  // Anatomical double-peak knee flexion: slight loading-response cushion (~14 deg), deep swing peak (~58 deg)
  const loadingFlex = 0.2 * Math.exp(-Math.pow((p - 0.16) / 0.085, 2));
  const swingFlex = 0.96 * Math.exp(-Math.pow((p - 0.74) / 0.125, 2));
  const convLagPenalty = isConv ? -0.05 * Math.sin(w) : 0;
  const kneeFlexion = Math.max(
    0.02,
    0.05 + loadingFlex + swingFlex + inclineBias + convLagPenalty + terrainRoughness * 0.06 * Math.max(0, Math.sin(w)),
  );

  // Ankle rocker: rigid SACH foot barely pivots compared to articulated NEXLIMB clevis
  const nexlimbAnkle =
    -0.1 * Math.exp(-Math.pow((p - 0.07) / 0.055, 2)) +
    0.2 * Math.exp(-Math.pow((p - 0.44) / 0.13, 2)) -
    0.16 * Math.exp(-Math.pow((p - 0.62) / 0.075, 2));
  const ankleDorsi = (isConv ? nexlimbAnkle * 0.32 : nexlimbAnkle) + inclineBias;

  // Vertical swing clearance & heel-strike impact shock (conventional exhibits stiffer heel slap)
  const swingLift = p > 0.58 ? Math.sin(((p - 0.58) / 0.42) * Math.PI) * (0.14 + terrainRoughness * 0.04) : 0;
  const heelStrikeImpulse =
    isConv && p > 0.01 && p < 0.11
      ? Math.sin(((p - 0.01) / 0.1) * Math.PI) * (0.026 + terrainRoughness * 0.022)
      : 0;

  const ankleRoll = terrainRoughness * (isConv ? 0.13 * unevenOsc : 0.085 * unevenOsc);
  const footToeBend =
    p > 0.36 && p < 0.64
      ? Math.sin(((p - 0.36) / 0.28) * Math.PI) * (isConv ? 0.03 : 0.22)
      : 0;

  const heelLoad01 = p < 0.38 ? Math.sin((Math.min(p, 0.38) / 0.38) * Math.PI) * 0.95 : 0;
  const forefootLoad01 =
    p > 0.18 && p < 0.62 ? Math.sin(((p - 0.18) / 0.44) * Math.PI) * 0.98 : 0;

  return {
    rootY: swingLift,
    rootZ: -0.05 * Math.sin(w),
    hipPitch,
    kneeFlexion,
    ankleDorsi,
    ankleRoll,
    footToeBend,
    impactJolt: heelStrikeImpulse,
    heelLoad01,
    forefootLoad01,
    gaitPhaseIndex: stageIdx,
    gaitPhaseLabel: GAIT_STAGE_LABELS[stageIdx],
  };
}

/**
 * Generates deterministic, phase-synchronized SIMULATED sensor telemetry matching
 * the real-time 3D NEXLIMB model pose and active comparison scenario.
 */
export function computeSimulatedTelemetry(
  activityId: ActivityId,
  rawPhase: number,
  terrainCondition: TerrainCondition,
  wearProgress01: number,
  scenarioId: ScenarioId,
): SimulatedTelemetry {
  const p = normalizePhase(rawPhase);
  const pose = computeActivityPose(activityId, p, 'nexlimb', terrainCondition);
  const w = p * TAU;

  const isStatic = activityId === 'standing';
  const terrainFactor =
    activityId === 'uneven-terrain' || terrainCondition === 'uneven'
      ? 1.35
      : terrainCondition === 'incline'
        ? 1.15
        : 1.0;

  const accelG = isStatic
    ? Number((1.0 + Math.sin(w) * 0.015).toFixed(2))
    : Number(
        (
          1.0 +
          (0.28 * Math.abs(Math.sin(w * 2)) + (pose.heelLoad01 > 0.7 ? 0.22 : 0)) *
            terrainFactor
        ).toFixed(2),
      );

  const pitchDeg = Math.round((pose.hipPitch * 180) / Math.PI);
  const rollDeg = Math.round(((pose.ankleRoll * 180) / Math.PI) * 1.4);
  const gyroDegS = isStatic
    ? Math.round(Math.cos(w) * 3)
    : Math.round(Math.sin(w) * 145 * terrainFactor);

  const heelPct = Math.round(pose.heelLoad01 * 100);
  const forefootPct = Math.round(pose.forefootLoad01 * 100);
  const midfootPct = Math.round(Math.min(heelPct, forefootPct) * 0.85);
  const toePct =
    p > 0.42 && p < 0.64 ? Math.round(Math.sin(((p - 0.42) / 0.22) * Math.PI) * 92) : 0;

  const kneeDeg = Math.round((pose.kneeFlexion * 180) / Math.PI);
  const ankleDeg = Math.round((pose.ankleDorsi * 180) / Math.PI);

  // Extended wear simulation progression (0..1 -> 0h to 6h simulated wear)
  const clampedWear = Math.max(0, Math.min(1, wearProgress01));
  const scenarioLoadBoost =
    scenarioId === 'extended-wear' || scenarioId === 'pressure-awareness' ? clampedWear : 0.25;

  const peakPressureKpa = Math.round(44 + scenarioLoadBoost * 42 + pose.heelLoad01 * 12);
  const tempC = Number((31.2 + scenarioLoadBoost * 3.9).toFixed(1));
  const humidityPct = Math.round(44 + scenarioLoadBoost * 34);

  const activityNames: Record<ActivityId, string> = {
    walking: terrainCondition === 'incline' ? 'Incline Walking' : 'Normal Walking',
    'climbing-stairs': 'Climbing Stairs',
    'descending-stairs': 'Descending Stairs',
    'uneven-terrain': 'Uneven Terrain Gait',
    standing: 'Standing Weight Shift',
    sitting: 'Sitting / Stand Transition',
  };

  let activeSensors: string[] = ['imu-motion', 'foot-pressure', 'joint-angle', 'controller-module'];
  if (scenarioId === 'extended-wear') {
    activeSensors = ['socket-pressure', 'temperature', 'humidity', 'controller-module'];
  } else if (scenarioId === 'pressure-awareness') {
    activeSensors = ['socket-pressure', 'foot-pressure', 'controller-module'];
  } else if (scenarioId === 'maintenance') {
    activeSensors = ['socket-pressure', 'controller-module', 'battery-module'];
  } else if (activityId === 'standing') {
    activeSensors = ['foot-pressure', 'socket-pressure', 'controller-module'];
  }

  let baselineStatus = 'Aligned with user baseline (Simulated)';
  if (terrainCondition === 'uneven' || activityId === 'uneven-terrain') {
    baselineStatus = 'Irregular roll & load shift recorded (Simulated)';
  } else if (scenarioId === 'extended-wear' && clampedWear > 0.65) {
    baselineStatus = 'Elevated socket thermal & pressure drift (Simulated)';
  } else if (scenarioId === 'pressure-awareness') {
    baselineStatus = 'Anterior crest concentration flagged (Simulated)';
  } else if (scenarioId === 'maintenance') {
    baselineStatus = 'Sensor bus check & module service active (Simulated)';
  }

  let insight = 'Simulated multi-sensor gait monitoring active across stride cycle.';
  if (activityId === 'climbing-stairs') {
    insight = 'Elevated knee flexion & forefoot loading profile identified on stair ascent.';
  } else if (activityId === 'descending-stairs') {
    insight = 'Sustained controlled flexion angle & heel-to-forefoot transfer recorded.';
  } else if (activityId === 'uneven-terrain' || terrainCondition === 'uneven') {
    insight = 'Lateral roll deviation logged by IMU; movement data flagged for review.';
  } else if (activityId === 'standing') {
    insight = 'Quiescent angular rate confirms stationary weight-bearing posture.';
  } else if (activityId === 'sitting') {
    insight = 'Deep flexion excursion (~80°) distinguishes seating from walking stance.';
  }

  return {
    imu: { accelG, pitchDeg, rollDeg, gyroDegS },
    footPressure: { heelPct, midfootPct, forefootPct, toePct },
    jointAngle: { kneeDeg, ankleDeg, phaseLabel: pose.gaitPhaseLabel },
    socket: { peakPressureKpa, tempC, humidityPct },
    aiStatus: {
      detectedActivity: activityNames[activityId],
      gaitPhase: pose.gaitPhaseLabel,
      baselineStatus,
      insight,
      activeSensors,
    },
  };
}
