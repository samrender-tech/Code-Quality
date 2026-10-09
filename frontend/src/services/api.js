import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: API_URL,
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

// ─── Measures ───────────────────────────────────────────────────────────────
export const fetchMeasures = async (projectKey) => {
  const res = await api.get('/api/measures', { params: { projectKey } });
  return res.data;
};

export const fetchHistory = async (projectKey) => {
  const res = await api.get('/api/measures/history', { params: { projectKey } });
  return res.data.history;
};

// ─── Issues ─────────────────────────────────────────────────────────────────
export const fetchIssues = async (projectKey, filters = {}) => {
  const res = await api.get('/api/issues', {
    params: { projectKey, ...filters },
  });
  return res.data;
};

export default api;
