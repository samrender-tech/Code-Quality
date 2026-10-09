require('dotenv').config();

function toBool(value) {
  return ['1', 'true', 'yes', 'on'].includes(String(value || '').toLowerCase());
}

const config = {
  port: Number(process.env.PORT) || 4000,
  sonarUrl: (process.env.SONARQUBE_URL || 'http://localhost:9000').replace(/\/+$/, ''),
  sonarToken: process.env.SONARQUBE_TOKEN || '',
  // Comma-separated list of allowed origins, or "*" for any origin.
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  // Serve built-in sample data instead of calling SonarQube.
  // Works on every OS via `npm run demo` (passes --demo) or DEMO_MODE=true in .env.
  demoMode: toBool(process.env.DEMO_MODE) || process.argv.includes('--demo'),
};

module.exports = config;
