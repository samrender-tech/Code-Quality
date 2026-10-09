const config = require('./config');
const { createApp } = require('./app');
const { createSonarQubeService } = require('./services/sonarqube');
const { createDemoService } = require('./services/demo');

const service = config.demoMode
  ? createDemoService()
  : createSonarQubeService({ baseUrl: config.sonarUrl, token: config.sonarToken });

const app = createApp({ service, corsOrigin: config.corsOrigin });

app.listen(config.port, () => {
  console.log(`Code Quality Analyzer API listening on http://localhost:${config.port}`);
  console.log(
    config.demoMode
      ? 'Mode: DEMO (sample data, no SonarQube needed)'
      : `Mode: SonarQube at ${config.sonarUrl}${config.sonarToken ? '' : ' (no token set)'}`,
  );
});
