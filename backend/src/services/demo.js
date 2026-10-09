/**
 * Demo provider: serves realistic sample data with the same interface as the
 * SonarQube service, so the dashboard can be explored without a SonarQube server.
 * Enable it with DEMO_MODE=true.
 */

const PROJECTS = [
  {
    key: 'payments-api',
    name: 'Payments API',
    measures: {
      bugs: '3', vulnerabilities: '1', code_smells: '42', coverage: '76.4',
      duplicated_lines_density: '3.2', ncloc: '18420', reliability_rating: '3.0',
      security_rating: '2.0', sqale_rating: '1.0', alert_status: 'OK',
    },
    trend: { bugs: [14, 11, 9, 9, 7, 6, 5, 4, 3, 3], vulnerabilities: [5, 5, 4, 3, 3, 2, 2, 1, 1, 1], code_smells: [96, 90, 81, 77, 70, 63, 58, 51, 46, 42] },
  },
  {
    key: 'web-storefront',
    name: 'Web Storefront',
    measures: {
      bugs: '17', vulnerabilities: '4', code_smells: '138', coverage: '41.8',
      duplicated_lines_density: '8.9', ncloc: '52310', reliability_rating: '4.0',
      security_rating: '4.0', sqale_rating: '2.0', alert_status: 'ERROR',
    },
    trend: { bugs: [9, 10, 12, 11, 13, 14, 15, 15, 16, 17], vulnerabilities: [2, 2, 2, 3, 3, 3, 4, 4, 4, 4], code_smells: [101, 104, 110, 114, 117, 121, 126, 130, 135, 138] },
  },
  {
    key: 'auth-service',
    name: 'Auth Service',
    measures: {
      bugs: '0', vulnerabilities: '0', code_smells: '7', coverage: '88.1',
      duplicated_lines_density: '1.1', ncloc: '6240', reliability_rating: '1.0',
      security_rating: '1.0', sqale_rating: '1.0', alert_status: 'OK',
    },
    trend: { bugs: [4, 3, 3, 2, 2, 1, 1, 0, 0, 0], vulnerabilities: [2, 2, 1, 1, 1, 0, 0, 0, 0, 0], code_smells: [25, 22, 19, 17, 15, 12, 10, 9, 8, 7] },
  },
];

const ISSUE_TEMPLATES = {
  BUG: [
    ['javascript:S2259', 'Possible null dereference of "user.profile".'],
    ['javascript:S1854', 'Remove this useless assignment to variable "total".'],
    ['javascript:S3923', 'Remove this conditional structure or edit its code blocks so that they\'re not all the same.'],
    ['javascript:S2201', 'Return value of "Array.prototype.map" is ignored; use "forEach" instead.'],
  ],
  VULNERABILITY: [
    ['javascript:S2068', 'Review this potentially hard-coded password.'],
    ['javascript:S5332', 'Using http protocol is insecure. Use https instead.'],
    ['javascript:S4507', 'Make sure this debug feature is deactivated before delivering the code in production.'],
  ],
  CODE_SMELL: [
    ['javascript:S3776', 'Refactor this function to reduce its Cognitive Complexity from 21 to the 15 allowed.'],
    ['javascript:S1481', 'Remove the declaration of the unused "response" variable.'],
    ['javascript:S125', 'Remove this commented out code.'],
    ['javascript:S1192', 'Define a constant instead of duplicating this literal 4 times.'],
    ['javascript:S4144', 'Update this function so that its implementation is not identical to the one on line 42.'],
  ],
};

const FILES = [
  'src/routes/checkout.js', 'src/services/payment.js', 'src/utils/format.js',
  'src/controllers/user.js', 'src/middleware/auth.js', 'src/models/order.js',
  'src/components/Cart.jsx', 'src/lib/http.js',
];

const SEVERITY_BY_TYPE = {
  BUG: ['CRITICAL', 'MAJOR', 'MAJOR', 'MINOR'],
  VULNERABILITY: ['BLOCKER', 'CRITICAL', 'MAJOR'],
  CODE_SMELL: ['MAJOR', 'MINOR', 'MINOR', 'INFO'],
};

// Small deterministic PRNG so the demo looks the same on every run.
function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function hashString(text) {
  return [...text].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
}

function buildIssues(project) {
  const rand = seededRandom(hashString(project.key));
  const pick = (list) => list[Math.floor(rand() * list.length)];
  const counts = {
    BUG: Number(project.measures.bugs),
    VULNERABILITY: Number(project.measures.vulnerabilities),
    CODE_SMELL: Number(project.measures.code_smells),
  };

  const issues = [];
  for (const [type, count] of Object.entries(counts)) {
    for (let i = 0; i < count; i += 1) {
      const [rule, message] = pick(ISSUE_TEMPLATES[type]);
      const daysAgo = Math.floor(rand() * 60);
      issues.push({
        key: `${project.key}-${type.toLowerCase()}-${i + 1}`,
        type,
        severity: pick(SEVERITY_BY_TYPE[type]),
        message,
        component: `${project.key}:${pick(FILES)}`,
        line: 1 + Math.floor(rand() * 300),
        status: 'OPEN',
        rule,
        effort: `${5 * (1 + Math.floor(rand() * 6))}min`,
        tags: [],
        author: null,
        creationDate: new Date(Date.UTC(2026, 8, 30) - daysAgo * 86400000).toISOString(),
      });
    }
  }
  return issues;
}

const issueCache = new Map();

function findProject(projectKey) {
  const project = PROJECTS.find((p) => p.key === projectKey);
  if (!project) {
    const err = new Error(`Component key '${projectKey}' not found`);
    err.status = 404;
    throw err;
  }
  return project;
}

function createDemoService() {
  return {
    name: 'demo',

    async getStatus() {
      return { status: 'UP', version: 'demo' };
    },

    async getProjects() {
      return PROJECTS.map(({ key, name }) => ({ key, name, lastAnalysisDate: '2026-09-30T10:15:00+0000' }));
    },

    async getMeasures(projectKey, metricKeys) {
      const project = findProject(projectKey);
      const measures = {};
      for (const metric of metricKeys) {
        if (project.measures[metric] !== undefined) measures[metric] = project.measures[metric];
      }
      return { projectKey, projectName: project.name, measures };
    },

    async getMeasureHistory(projectKey, metricKeys) {
      const project = findProject(projectKey);
      const points = project.trend.bugs.length;
      const history = [];
      for (let i = 0; i < points; i += 1) {
        const date = new Date(Date.UTC(2026, 6, 22) + i * 7 * 86400000).toISOString().slice(0, 10);
        const row = { date };
        for (const metric of metricKeys) {
          if (project.trend[metric]) row[metric] = project.trend[metric][i];
        }
        history.push(row);
      }
      return history;
    },

    async getIssues(projectKey, { types, severities, page, pageSize }) {
      const project = findProject(projectKey);
      if (!issueCache.has(projectKey)) issueCache.set(projectKey, buildIssues(project));

      const typeSet = types ? new Set(types.split(',')) : null;
      const severitySet = severities ? new Set(severities.split(',')) : null;
      const filtered = issueCache.get(projectKey).filter(
        (issue) => (!typeSet || typeSet.has(issue.type)) && (!severitySet || severitySet.has(issue.severity)),
      );

      const start = (page - 1) * pageSize;
      return {
        total: filtered.length,
        page,
        pageSize,
        issues: filtered.slice(start, start + pageSize),
      };
    },
  };
}

module.exports = { createDemoService, DEMO_PROJECTS: PROJECTS };
