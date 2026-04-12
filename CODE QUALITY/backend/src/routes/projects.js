const express = require('express');
const { getProjects, testConnection } = require('../services/sonarqube');

const router = express.Router();

// GET /api/projects — list all SonarQube projects
router.get('/', async (req, res) => {
  try {
    const data = await getProjects();
    const projects = (data.components || []).map((p) => ({
      key: p.key,
      name: p.name,
      qualifier: p.qualifier,
      lastAnalysisDate: p.lastAnalysisDate || null,
    }));
    res.json({ projects });
  } catch (err) {
    const status = err.response?.status || 500;
    const message = err.response?.data?.errors?.[0]?.msg || err.message;
    res.status(status).json({ error: message });
  }
});

// GET /api/projects/status — test SonarQube connectivity
router.get('/status', async (req, res) => {
  try {
    const data = await testConnection();
    res.json({ connected: true, status: data.status, version: data.version });
  } catch (err) {
    res.status(503).json({
      connected: false,
      error: err.message,
    });
  }
});

module.exports = router;
