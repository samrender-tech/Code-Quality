const axios = require('axios');

/**
 * Thin wrapper around the SonarQube Web API.
 * Every method returns plain data in the shape the routes expect,
 * so the demo provider can implement the same interface.
 */
function createSonarQubeService({ baseUrl, token }) {
  const client = axios.create({
    baseURL: baseUrl,
    // SonarQube accepts a user token as the basic-auth username with an empty password.
    auth: token ? { username: token, password: '' } : undefined,
    timeout: 15000,
  });

  return {
    name: 'sonarqube',

    async getStatus() {
      const { data } = await client.get('/api/system/status');
      return { status: data.status, version: data.version };
    },

    async getProjects() {
      let components;
      try {
        // Includes the last analysis date, but needs the "Administer System" permission.
        const { data } = await client.get('/api/projects/search', { params: { ps: 500 } });
        components = data.components;
      } catch (err) {
        if (err.response?.status !== 403) throw err;
        // Non-admin tokens: fall back to every project the token can browse.
        const { data } = await client.get('/api/components/search', { params: { qualifiers: 'TRK', ps: 500 } });
        components = data.components;
      }
      return (components || []).map((p) => ({
        key: p.key,
        name: p.name,
        lastAnalysisDate: p.lastAnalysisDate || null,
      }));
    },

    async getMeasures(projectKey, metricKeys) {
      const { data } = await client.get('/api/measures/component', {
        params: { component: projectKey, metricKeys: metricKeys.join(',') },
      });

      const measures = {};
      for (const m of data.component?.measures || []) {
        measures[m.metric] = m.value ?? m.period?.value ?? null;
      }
      return { projectKey, projectName: data.component?.name || projectKey, measures };
    },

    async getMeasureHistory(projectKey, metricKeys) {
      const { data } = await client.get('/api/measures/search_history', {
        params: { component: projectKey, metrics: metricKeys.join(','), ps: 1000 },
      });

      // SonarQube returns one history array per metric; merge them into one row per analysis.
      const byDate = new Map();
      for (const { metric, history = [] } of data.measures || []) {
        for (const point of history) {
          if (point.value === undefined) continue;
          const row = byDate.get(point.date) || { date: point.date };
          row[metric] = Number(point.value);
          byDate.set(point.date, row);
        }
      }
      return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
    },

    async getIssues(projectKey, { types, severities, statuses, page, pageSize }) {
      const { data } = await client.get('/api/issues/search', {
        params: {
          componentKeys: projectKey,
          ...(types && { types }),
          ...(severities && { severities }),
          ...(statuses && { statuses }),
          p: page,
          ps: pageSize,
        },
      });

      return {
        total: data.paging?.total ?? data.total ?? 0,
        page: data.paging?.pageIndex ?? data.p ?? page,
        pageSize: data.paging?.pageSize ?? data.ps ?? pageSize,
        issues: (data.issues || []).map((issue) => ({
          key: issue.key,
          type: issue.type,
          severity: issue.severity,
          message: issue.message,
          component: issue.component,
          line: issue.line ?? null,
          status: issue.status,
          rule: issue.rule,
          effort: issue.effort ?? null,
          tags: issue.tags || [],
          author: issue.author || null,
          creationDate: issue.creationDate,
        })),
      };
    },
  };
}

module.exports = { createSonarQubeService };
