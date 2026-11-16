import test from 'node:test';
import assert from 'node:assert/strict';
import {
  COMPARISON_PILLARS,
  GAIT_CYCLE_STAGES,
  MAINTENANCE_SEQUENCE_STEPS,
  PANEL02_ACTIVITIES,
  PANEL02_SCENARIOS,
  SOCKET_PRESSURE_POINTS,
  TERRAIN_CONDITIONS,
} from './panel02Data';

test('Panel 02 defines all 6 live 3D activities and 5 comparison scenarios', () => {
  assert.equal(PANEL02_ACTIVITIES.length, 6);
  assert.equal(PANEL02_SCENARIOS.length, 5);
  for (const sc of PANEL02_SCENARIOS) {
    assert.ok(sc.conventionalBullets.length >= 3);
    assert.ok(sc.nexlimbBullets.length >= 4);
    assert.ok(sc.practicalAdvantage.length > 10);
  }
});

test('Gait stages, terrain conditions, socket pressure points, maintenance steps, and summary pillars are complete', () => {
  assert.equal(GAIT_CYCLE_STAGES.length, 5);
  assert.equal(TERRAIN_CONDITIONS.length, 3);
  assert.equal(SOCKET_PRESSURE_POINTS.length, 6);
  assert.equal(MAINTENANCE_SEQUENCE_STEPS.length, 6);
  assert.equal(COMPARISON_PILLARS.length, 3);
});
