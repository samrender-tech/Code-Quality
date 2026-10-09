/**
 * Builds the dashboard alert list from a project's measures, its grades and
 * the user's thresholds. Pure function, so it is easy to test.
 */
export function buildAlerts(measures, grades, thresholds) {
  if (!measures) return [];
  const alerts = [];
  const bugs = Number.parseInt(measures.bugs, 10) || 0;
  const vulns = Number.parseInt(measures.vulnerabilities, 10) || 0;

  if (measures.alert_status === 'ERROR') {
    alerts.push({
      id: 'quality-gate',
      type: 'danger',
      title: 'Quality gate failed',
      message: 'This project does not meet its SonarQube quality gate conditions.',
    });
  }

  if (vulns > thresholds.vulnerabilities) {
    alerts.push({
      id: 'vulnerabilities',
      type: 'danger',
      title: `${vulns} security ${vulns === 1 ? 'vulnerability' : 'vulnerabilities'} found`,
      message: `Your threshold is ${thresholds.vulnerabilities}. Fix these before releasing.`,
    });
  }

  if (bugs > thresholds.bugs) {
    alerts.push({
      id: 'bugs',
      type: 'danger',
      title: `High bug count: ${bugs} bugs`,
      message: `Your threshold is ${thresholds.bugs}. Immediate attention recommended.`,
    });
  }

  if (grades?.overall === 'C') {
    alerts.push({
      id: 'overall-grade',
      type: 'warning',
      title: 'Overall grade C: code quality needs improvement',
      message: 'Review bugs, vulnerabilities, code smells and test coverage.',
    });
  }

  return alerts;
}
