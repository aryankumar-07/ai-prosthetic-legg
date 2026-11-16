import { PROSTHETIC_SENSORS, type ProstheticSensorSpec } from '../data/prostheticSensors';

export type CameraViewMode = 'threeQuarter' | 'front' | 'side' | 'rear';
export type VisualMode = 'standard' | 'xray' | 'sensors';

export interface CameraPose {
  position: [number, number, number];
  target: [number, number, number];
}

export const ZOOM_MIN_DISTANCE = 1.35;
export const ZOOM_MAX_DISTANCE = 9.0;
export const ZOOM_STEP_FACTOR = 0.78;

export const VIEW_PRESETS: Record<CameraViewMode, CameraPose> = {
  threeQuarter: {
    position: [3.45, 2.05, 5.45],
    target: [0.0, 1.42, 0.06],
  },
  front: {
    position: [0.0, 1.72, 6.4],
    target: [0.0, 1.42, 0.06],
  },
  side: {
    position: [6.4, 1.7, 0.08],
    target: [0.0, 1.42, 0.08],
  },
  rear: {
    position: [0.0, 1.75, -6.4],
    target: [0.0, 1.42, 0.04],
  },
};

export function getPresetCameraPose(mode: CameraViewMode): CameraPose {
  const preset = VIEW_PRESETS[mode];
  return {
    position: [...preset.position] as [number, number, number],
    target: [...preset.target] as [number, number, number],
  };
}

export function getSensorById(id: string | null): ProstheticSensorSpec | null {
  if (!id) return null;
  return PROSTHETIC_SENSORS.find((sensor) => sensor.id === id) ?? null;
}

export function getAdjacentSensorId(currentId: string | null, direction: 1 | -1): string {
  if (!currentId) {
    return PROSTHETIC_SENSORS[0].id;
  }
  const index = PROSTHETIC_SENSORS.findIndex((s) => s.id === currentId);
  if (index === -1) {
    return PROSTHETIC_SENSORS[0].id;
  }
  const nextIndex = (index + direction + PROSTHETIC_SENSORS.length) % PROSTHETIC_SENSORS.length;
  return PROSTHETIC_SENSORS[nextIndex].id;
}

/**
 * Computes a new camera position along the ray from `target` through `position`,
 * clamped safely between ZOOM_MIN_DISTANCE and ZOOM_MAX_DISTANCE.
 */
export function computeZoomedCameraPosition(
  position: [number, number, number],
  target: [number, number, number],
  direction: 'in' | 'out',
): [number, number, number] {
  const dx = position[0] - target[0];
  const dy = position[1] - target[1];
  const dz = position[2] - target[2];
  const currentDist = Math.hypot(dx, dy, dz);

  if (currentDist < 0.0001) {
    return [...position];
  }

  const scaleFactor = direction === 'in' ? ZOOM_STEP_FACTOR : 1 / ZOOM_STEP_FACTOR;
  const nextDist = Math.min(
    ZOOM_MAX_DISTANCE,
    Math.max(ZOOM_MIN_DISTANCE, currentDist * scaleFactor),
  );
  const ratio = nextDist / currentDist;

  return [
    target[0] + dx * ratio,
    target[1] + dy * ratio,
    target[2] + dz * ratio,
  ];
}

export interface ProjectedPoint2D {
  x: number;
  y: number;
  visible: boolean;
}

/**
 * Projects Normalized Device Coordinates (-1..1) into viewport container pixel coordinates
 * with safe inset clamping so pins never overflow off-edge.
 */
export function ndcToViewportPixels(
  ndcX: number,
  ndcY: number,
  ndcZ: number,
  width: number,
  height: number,
  padding = 24,
): ProjectedPoint2D {
  if (width <= 0 || height <= 0 || ndcZ > 1 || ndcZ < -1) {
    return { x: 0, y: 0, visible: false };
  }
  const rawX = ((ndcX + 1) * 0.5) * width;
  const rawY = ((-ndcY + 1) * 0.5) * height;
  const clampedX = Math.min(width - padding, Math.max(padding, rawX));
  const clampedY = Math.min(height - padding, Math.max(padding, rawY));
  const inBounds =
    rawX >= -40 && rawX <= width + 40 && rawY >= -40 && rawY <= height + 40;

  return {
    x: Math.round(clampedX * 10) / 10,
    y: Math.round(clampedY * 10) / 10,
    visible: inBounds,
  };
}
