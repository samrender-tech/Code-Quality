const express = require('express');

function projectsRouter(service) {
  const router = express.Router();

  // GET /api/projects — list projects the token can see
  router.get('/', async (req, res) => {
    const projects = await service.getProjects();
    res.json({ projects });
  });

  // GET /api/projects/status — check that SonarQube is reachable
  router.get('/status', async (req, res) => {
    try {
      const { status, version } = await service.getStatus();
      res.json({ connected: status === 'UP', status, version, mode: service.name });
    } catch (err) {
      res.status(503).json({ connected: false, mode: service.name, error: err.message });
    }
  });

  return router;
}

module.exports = projectsRouter;
