const express = require('express');
const { requireProjectKey, toInt } = require('../middleware/validate');

// SonarQube caps the page size at 500.
const MAX_PAGE_SIZE = 500;

function issuesRouter(service) {
  const router = express.Router();

  // GET /api/issues?projectKey=my_project&types=BUG,VULNERABILITY&severities=CRITICAL&p=1&ps=50
  router.get('/', requireProjectKey, async (req, res) => {
    const { types, severities, statuses } = req.query;
    const result = await service.getIssues(req.projectKey, {
      types,
      severities,
      statuses,
      page: toInt(req.query.p, 1, 1, 10000),
      pageSize: toInt(req.query.ps, 50, 1, MAX_PAGE_SIZE),
    });
    res.json(result);
  });

  return router;
}

module.exports = issuesRouter;
