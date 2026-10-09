const express = require('express');
const cors = require('cors');
const projectsRouter = require('./routes/projects');
const measuresRouter = require('./routes/measures');
const issuesRouter = require('./routes/issues');
const { errorHandler, notFound } = require('./middleware/errorHandler');

/**
 * Builds the Express app around a data service (real SonarQube or demo).
 * Kept separate from server.js so tests can create an app without opening a port.
 */
function createApp({ service, corsOrigin = '*' }) {
  const app = express();

  const origins = corsOrigin === '*' ? '*' : corsOrigin.split(',').map((o) => o.trim());
  app.use(cors({ origin: origins }));
  app.use(express.json());

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', mode: service.name, timestamp: new Date().toISOString() });
  });

  app.use('/api/projects', projectsRouter(service));
  app.use('/api/measures', measuresRouter(service));
  app.use('/api/issues', issuesRouter(service));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
