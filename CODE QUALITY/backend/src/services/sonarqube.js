const axios = require('axios');
require('dotenv').config();

const SONARQUBE_URL = process.env.SONARQUBE_URL || 'http://localhost:9000';
const SONARQUBE_TOKEN = process.env.SONARQUBE_TOKEN || '';

const sonarClient = axios.create({
  baseURL: SONARQUBE_URL,
  auth: {
    username: SONARQUBE_TOKEN,
    password: '',
  },
  timeout: 15000,
});

/**
 * Fetch component measures from SonarQube
 * @param {string} projectKey
 * @param {string[]} metricKeys
 */
async function getMeasures(projectKey, metricKeys) {
  const metrics = metricKeys.join(',');
  const response = await sonarClient.get('/api/measures/component', {
    params: {
      component: projectKey,
      metricKeys: metrics,
    },
  });
  return response.data;
}

/**
 * Fetch issues from SonarQube
 * @param {string} projectKey
 * @param {object} filters - optional { types, severities, statuses, p, ps }
 */
async function getIssues(projectKey, filters = {}) {
  const response = await sonarClient.get('/api/issues/search', {
    params: {
      componentKeys: projectKey,
      ...filters,
      ps: filters.ps || 100,
    },
  });
  return response.data;
}

/**
 * List all accessible SonarQube projects
 */
async function getProjects() {
  const response = await sonarClient.get('/api/projects/search', {
    params: { ps: 50 },
  });
  return response.data;
}

/**
 * Test connectivity to SonarQube
 */
async function testConnection() {
  const response = await sonarClient.get('/api/system/status');
  return response.data;
}

module.exports = { getMeasures, getIssues, getProjects, testConnection };
