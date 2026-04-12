const express = require('express');
const { getMeasures } = require('../services/sonarqube');

const router = express.Router();

const DEFAULT_METRICS = [
  'bugs',
  'vulnerabilities',
  'code_smells',
  'coverage',
  'duplicated_lines_density',
  'ncloc',
  'reliability_rating',
  'security_rating',
  'sqale_rating',
  'alert_status',
  'quality_gate_details',
];

// GET /api/measures?projectKey=my_project
router.get('/', async (req, res) => {
  const { projectKey, metrics } = req.query;

  if (!projectKey) {
    return res.status(400).json({ error: 'projectKey query param is required' });
  }

  const metricsList = metrics ? metrics.split(',') : DEFAULT_METRICS;

  try {
    const data = await getMeasures(projectKey, metricsList);
    const measures = data.component?.measures || [];

    // Normalize into key-value map
    const result = {};
    measures.forEach((m) => {
      result[m.metric] = m.value || m.period?.value || null;
    });

    res.json({
      projectKey,
      projectName: data.component?.name || projectKey,
      measures: result,
    });
  } catch (err) {
    const status = err.response?.status || 500;
    const message = err.response?.data?.errors?.[0]?.msg || err.message;
    res.status(status).json({ error: message });
  }
});

module.exports = router;
