require('dotenv').config();
const express = require('express');
const cors = require('cors');
const measuresRouter = require('./routes/measures');
const issuesRouter = require('./routes/issues');
const projectsRouter = require('./routes/projects');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Routes
app.use('/api/measures', measuresRouter);
app.use('/api/issues', issuesRouter);
app.use('/api/projects', projectsRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n🚀 Code Quality Analyzer Backend`);
  console.log(`   Listening on http://localhost:${PORT}`);
  console.log(`   SonarQube URL: ${process.env.SONARQUBE_URL || 'http://localhost:9000'}\n`);
});
