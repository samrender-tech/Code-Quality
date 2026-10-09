const express = require('express');
const { requireProjectKey } = require('../middleware/validate');

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
];

const HISTORY_METRICS = ['bugs', 'vulnerabilities', 'code_smells'];

function parseMetrics(value, fallback) {
  if (!value) return fallback;
  const list = String(value).split(',').map((m) => m.trim()).filter(Boolean);
  return list.length ? list : fallback;
}

function measuresRouter(service) {
  const router = express.Router();

  // GET /api/measures?projectKey=my_project[&metrics=bugs,coverage]
  router.get('/', requireProjectKey, async (req, res) => {
    const metrics = parseMetrics(req.query.metrics, DEFAULT_METRICS);
    res.json(await service.getMeasures(req.projectKey, metrics));
  });

  // GET /api/measures/history?projectKey=my_project — one row per analysis, oldest first
  router.get('/history', requireProjectKey, async (req, res) => {
    const metrics = parseMetrics(req.query.metrics, HISTORY_METRICS);
    const history = await service.getMeasureHistory(req.projectKey, metrics);
    res.json({ projectKey: req.projectKey, history });
  });

  return router;
}

module.exports = measuresRouter;
module.exports.DEFAULT_METRICS = DEFAULT_METRICS;
