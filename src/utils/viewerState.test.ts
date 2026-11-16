import test from 'node:test';
import assert from 'node:assert/strict';
import { PROSTHETIC_SENSORS, INTELLIGENCE_STAGES } from '../data/prostheticSensors';
import {
  ZOOM_MIN_DISTANCE,
  ZOOM_MAX_DISTANCE,
  computeZoomedCameraPosition,
  getAdjacentSensorId,
  getPresetCameraPose,
  getSensorById,
  ndcToViewportPixels,
} from './viewerState';

test('all 8 required prosthetic sensors and modules are defined with complete copy', () => {
  assert.equal(PROSTHETIC_SENSORS.length, 8);
  const requiredIds = [
    'imu-motion',
    'foot-pressure',
    'socket-pressure',
    'temperature',
    'humidity',
    'joint-angle',
    'controller-module',
    'battery-module',
  ];

  for (const id of requiredIds) {
    const sensor = getSensorById(id);
    assert.ok(sensor, `Expected sensor ${id} to exist`);
    assert.ok(sensor.functionText.length > 15);
    assert.ok(sensor.purposeText.length > 15);
    assert.ok(sensor.benefitText.length > 15);
    assert.equal(sensor.anchor.length, 3);
    assert.equal(sensor.focusCameraPos.length, 3);
  }

  assert.equal(INTELLIGENCE_STAGES.length, 4);
});

test('camera preset returns valid cloned coordinates for each view mode', () => {
  const pose = getPresetCameraPose('front');
  assert.deepEqual(pose.position, [0.0, 1.72, 6.4]);
  pose.position[0] = 99;
  assert.equal(getPresetCameraPose('front').position[0], 0.0);
});

test('computeZoomedCameraPosition moves closer/farther and respects min/max distance bounds', () => {
  const target: [number, number, number] = [0, 1.5, 0];
  const start: [number, number, number] = [0, 1.5, 4.0];

  const zoomedIn = computeZoomedCameraPosition(start, target, 'in');
  assert.ok(zoomedIn[2] < 4.0);
  assert.ok(zoomedIn[2] >= ZOOM_MIN_DISTANCE);

  let veryClose: [number, number, number] = [0, 1.5, 1.4];
  for (let i = 0; i < 10; i++) {
    veryClose = computeZoomedCameraPosition(veryClose, target, 'in');
  }
  const minDist = Math.hypot(veryClose[0] - target[0], veryClose[1] - target[1], veryClose[2] - target[2]);
  assert.ok(Math.abs(minDist - ZOOM_MIN_DISTANCE) < 0.001);

  let veryFar: [number, number, number] = [0, 1.5, 6.5];
  for (let i = 0; i < 10; i++) {
    veryFar = computeZoomedCameraPosition(veryFar, target, 'out');
  }
  const maxDist = Math.hypot(veryFar[0] - target[0], veryFar[1] - target[1], veryFar[2] - target[2]);
  assert.ok(Math.abs(maxDist - ZOOM_MAX_DISTANCE) < 0.001);
});

test('getAdjacentSensorId wraps cleanly forward and backward', () => {
  const first = PROSTHETIC_SENSORS[0].id;
  const last = PROSTHETIC_SENSORS[PROSTHETIC_SENSORS.length - 1].id;
  assert.equal(getAdjacentSensorId(last, 1), first);
  assert.equal(getAdjacentSensorId(first, -1), last);
  assert.equal(getAdjacentSensorId(null, 1), first);
});

test('ndcToViewportPixels projects centered and clamped coordinates accurately', () => {
  const center = ndcToViewportPixels(0, 0, 0.5, 1000, 800);
  assert.deepEqual(center, { x: 500, y: 400, visible: true });

  const clippedBehind = ndcToViewportPixels(0, 0, 1.2, 1000, 800);
  assert.equal(clippedBehind.visible, false);

  const edgeClamped = ndcToViewportPixels(0.99, -0.99, 0.2, 1000, 800, 24);
  assert.equal(edgeClamped.x, 976);
  assert.equal(edgeClamped.y, 776);
  assert.equal(edgeClamped.visible, true);
});
