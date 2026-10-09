import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildAlerts } from './alerts.js';

const thresholds = { bugs: 5, vulnerabilities: 1 };
const ids = (alerts) => alerts.map((a) => a.id);

describe('buildAlerts', () => {
  it('returns nothing for a healthy project', () => {
    const measures = { bugs: '0', vulnerabilities: '0', alert_status: 'OK' };
    assert.deepEqual(buildAlerts(measures, { overall: 'A' }, thresholds), []);
  });

  it('respects the vulnerability threshold', () => {
    assert.deepEqual(ids(buildAlerts({ vulnerabilities: '1' }, {}, thresholds)), []);
    assert.deepEqual(ids(buildAlerts({ vulnerabilities: '2' }, {}, thresholds)), ['vulnerabilities']);
  });

  it('respects the bug threshold', () => {
    assert.deepEqual(ids(buildAlerts({ bugs: '5' }, {}, thresholds)), []);
    assert.deepEqual(ids(buildAlerts({ bugs: '6' }, {}, thresholds)), ['bugs']);
  });

  it('flags a failed quality gate and a C grade', () => {
    const alerts = buildAlerts({ alert_status: 'ERROR' }, { overall: 'C' }, thresholds);
    assert.deepEqual(ids(alerts), ['quality-gate', 'overall-grade']);
  });

  it('handles missing measures', () => {
    assert.deepEqual(buildAlerts(null, null, thresholds), []);
  });
});
