import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeActivityPose,
  computeSimulatedTelemetry,
  getGaitStageIndex,
  normalizePhase,
} from './activityKinematics';

test('normalizePhase wraps negative and >1 values into [0, 1)', () => {
  assert.ok(Math.abs(normalizePhase(1.25) - 0.25) < 1e-6);
  assert.ok(Math.abs(normalizePhase(-0.2) - 0.8) < 1e-6);
});

test('cyclic activities match seamlessly at phase 0 and phase 1', () => {
  const activities = ['walking', 'climbing-stairs', 'descending-stairs', 'uneven-terrain'] as const;
  for (const act of activities) {
    const start = computeActivityPose(act, 0, 'nexlimb', 'flat');
    const end = computeActivityPose(act, 1, 'nexlimb', 'flat');
    assert.ok(Math.abs(start.kneeFlexion - end.kneeFlexion) < 1e-5, `${act} knee continuity`);
    assert.ok(Math.abs(start.hipPitch - end.hipPitch) < 1e-5, `${act} hip continuity`);
    assert.ok(Math.abs(start.ankleDorsi - end.ankleDorsi) < 1e-5, `${act} ankle continuity`);
  }
});

test('sitting produces deep knee flexion compared to quiet standing', () => {
  const seated = computeActivityPose('sitting', 0.5, 'nexlimb', 'flat');
  const standing = computeActivityPose('standing', 0.5, 'nexlimb', 'flat');
  assert.ok(seated.kneeFlexion > 1.2);
  assert.ok(standing.kneeFlexion < 0.1);
});

test('conventional prosthetic exhibits stiffer ankle excursion and heel-strike jolt vs NEXLIMB', () => {
  const convStrike = computeActivityPose('walking', 0.06, 'conventional', 'flat');
  const nexStrike = computeActivityPose('walking', 0.06, 'nexlimb', 'flat');
  assert.ok(convStrike.impactJolt > nexStrike.impactJolt);

  const convPeak = computeActivityPose('walking', 0.44, 'conventional', 'flat');
  const nexPeak = computeActivityPose('walking', 0.44, 'nexlimb', 'flat');
  assert.ok(Math.abs(nexPeak.ankleDorsi) > Math.abs(convPeak.ankleDorsi));
});

test('gait stage index progresses sequentially from 0 to 4', () => {
  assert.equal(getGaitStageIndex(0.05), 0);
  assert.equal(getGaitStageIndex(0.22), 1);
  assert.equal(getGaitStageIndex(0.38), 2);
  assert.equal(getGaitStageIndex(0.55), 3);
  assert.equal(getGaitStageIndex(0.82), 4);
});

test('simulated telemetry increases socket load/temp/humidity as wear progress rises', () => {
  const fresh = computeSimulatedTelemetry('standing', 0.2, 'flat', 0.0, 'extended-wear');
  const extended = computeSimulatedTelemetry('standing', 0.2, 'flat', 0.95, 'extended-wear');
  assert.ok(extended.socket.tempC > fresh.socket.tempC);
  assert.ok(extended.socket.humidityPct > fresh.socket.humidityPct);
  assert.ok(extended.socket.peakPressureKpa > fresh.socket.peakPressureKpa);
});
