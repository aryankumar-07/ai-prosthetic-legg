import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ACTIVITY_SCENARIOS,
  COMFORT_SCENARIOS,
  COMPANION_SCREENS,
  COMPARISON_POINTS,
  MODULAR_PARTS,
} from './prostheticPanels';

test('comparison table covers core conventional vs NEXLIMB dimensions', () => {
  assert.equal(COMPARISON_POINTS.length, 4);
  for (const point of COMPARISON_POINTS) {
    assert.ok(point.conventional.length > 10);
    assert.ok(point.nexlimb.length > 10);
  }
});

test('all 5 gait activity scenarios provide complete sensor-to-response mappings', () => {
  assert.equal(ACTIVITY_SCENARIOS.length, 5);
  for (const scenario of ACTIVITY_SCENARIOS) {
    assert.ok(scenario.sensorSignature.length > 10);
    assert.ok(scenario.mechanicalResponse.length > 10);
    assert.ok(scenario.userBenefit.length > 10);
  }
});

test('all 3 comfort scenarios map 6 socket regions cleanly', () => {
  assert.equal(COMFORT_SCENARIOS.length, 3);
  for (const scenario of COMFORT_SCENARIOS) {
    assert.equal(scenario.regionLevels.length, 6);
    assert.ok(scenario.recommendation.length > 10);
  }
});

test('all 6 modular subassemblies and 5 companion app screens are defined', () => {
  assert.equal(MODULAR_PARTS.length, 6);
  assert.equal(COMPANION_SCREENS.length, 5);
});
