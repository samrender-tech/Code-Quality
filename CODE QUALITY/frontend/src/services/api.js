import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

// ─── Projects ───────────────────────────────────────────────────────────────
export const fetchProjects = async () => {
  const res = await api.get('/api/projects');
  return res.data.projects;
};

export const checkConnection = async () => {
  const res = await api.get('/api/projects/status');
  return res.data;
};

// ─── Measures ────────────────────────────────────────────────────────────────
export const fetchMeasures = async (projectKey) => {
  const res = await api.get('/api/measures', { params: { projectKey } });
  return res.data;
};

// ─── Issues ──────────────────────────────────────────────────────────────────
export const fetchIssues = async (projectKey, filters = {}) => {
  const res = await api.get('/api/issues', {
    params: { projectKey, ...filters },
  });
  return res.data;
};

export default api;
