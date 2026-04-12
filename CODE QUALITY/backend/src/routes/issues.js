const express = require('express');
const { getIssues } = require('../services/sonarqube');

const router = express.Router();

// GET /api/issues?projectKey=my_project&types=BUG,VULNERABILITY&severities=CRITICAL&p=1&ps=50
router.get('/', async (req, res) => {
  const { projectKey, types, severities, statuses, p = 1, ps = 50 } = req.query;

  if (!projectKey) {
    return res.status(400).json({ error: 'projectKey query param is required' });
  }

  const filters = {
    ...(types && { types }),
    ...(severities && { severities }),
    ...(statuses && { statuses }),
    p: Number(p),
    ps: Number(ps),
  };

  try {
    const data = await getIssues(projectKey, filters);
    res.json({
      total: data.total,
      page: data.p,
      pageSize: data.ps,
      issues: (data.issues || []).map((issue) => ({
        key: issue.key,
        type: issue.type,
        severity: issue.severity,
        message: issue.message,
        component: issue.component,
        line: issue.line,
        status: issue.status,
        creationDate: issue.creationDate,
        updateDate: issue.updateDate,
        author: issue.author,
        effort: issue.effort,
        debt: issue.debt,
        tags: issue.tags,
        rule: issue.rule,
      })),
    });
  } catch (err) {
    const status = err.response?.status || 500;
    const message = err.response?.data?.errors?.[0]?.msg || err.message;
    res.status(status).json({ error: message });
  }
});

module.exports = router;
