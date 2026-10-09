const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../src/app');
const { createDemoService } = require('../src/services/demo');

/** Starts an app on a random port and returns a tiny client for it. */
async function serve(app) {
  const server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  const get = async (path) => {
    const res = await fetch(base + path);
    return { status: res.status, body: await res.json() };
  };
  return { get, close: () => new Promise((resolve) => server.close(resolve)) };
}

let api;
before(async () => { api = await serve(createApp({ service: createDemoService() })); });
after(() => api.close());

/** GET path and assert the status code. */
async function expectGet(path, status, client = api) {
  const res = await client.get(path);
  assert.equal(res.status, status, `GET ${path} -> ${res.status} ${JSON.stringify(res.body)}`);
  return res;
}

describe('health and status', () => {
  it('GET /health reports ok', async () => {
    const res = await expectGet('/health', 200);
    assert.equal(res.body.status, 'ok');
    assert.equal(res.body.mode, 'demo');
  });

  it('GET /api/projects/status reports connected', async () => {
    const res = await expectGet('/api/projects/status', 200);
    assert.equal(res.body.connected, true);
  });

  it('unknown routes return a JSON 404', async () => {
    const res = await expectGet('/api/nope', 404);
    assert.match(res.body.error, /not found/i);
  });
});

describe('GET /api/projects', () => {
  it('lists projects with key and name', async () => {
    const res = await expectGet('/api/projects', 200);
    assert.ok(res.body.projects.length > 0);
    for (const p of res.body.projects) {
      assert.ok(p.key);
      assert.ok(p.name);
    }
  });
});

describe('GET /api/measures', () => {
  it('requires projectKey', async () => {
    const res = await expectGet('/api/measures', 400);
    assert.match(res.body.error, /projectKey/);
  });

  it('returns a flat metric map', async () => {
    const res = await expectGet('/api/measures?projectKey=payments-api', 200);
    assert.equal(res.body.projectName, 'Payments API');
    assert.equal(res.body.measures.bugs, '3');
    assert.equal(res.body.measures.alert_status, 'OK');
  });

  it('honours a custom metrics list', async () => {
    const res = await expectGet('/api/measures?projectKey=payments-api&metrics=bugs,coverage', 200);
    assert.deepEqual(Object.keys(res.body.measures).sort(), ['bugs', 'coverage']);
  });

  it('returns 404 for an unknown project', async () => {
    const res = await expectGet('/api/measures?projectKey=missing', 404);
    assert.match(res.body.error, /not found/);
  });

  it('returns history ordered oldest first', async () => {
    const res = await expectGet('/api/measures/history?projectKey=auth-service', 200);
    const dates = res.body.history.map((h) => h.date);
    assert.ok(dates.length >= 2);
    assert.deepEqual(dates, [...dates].sort());
    assert.equal(typeof res.body.history[0].bugs, 'number');
  });
});

describe('GET /api/issues', () => {
  it('paginates', async () => {
    const res = await expectGet('/api/issues?projectKey=web-storefront&p=2&ps=10', 200);
    assert.equal(res.body.page, 2);
    assert.equal(res.body.pageSize, 10);
    assert.equal(res.body.issues.length, 10);
    assert.equal(res.body.total, 17 + 4 + 138);
  });

  it('filters by type and severity', async () => {
    const res = await expectGet('/api/issues?projectKey=web-storefront&types=VULNERABILITY&ps=500', 200);
    assert.equal(res.body.total, 4);
    assert.ok(res.body.issues.every((i) => i.type === 'VULNERABILITY'));
  });

  it('falls back to sane paging values for bad input', async () => {
    const res = await expectGet('/api/issues?projectKey=web-storefront&p=abc&ps=99999', 200);
    assert.equal(res.body.page, 1);
    assert.equal(res.body.pageSize, 500);
  });
});

describe('error handling for SonarQube failures', () => {
  async function getWithFailingService(path, error, status) {
    const service = createDemoService();
    service.getProjects = async () => { throw error; };
    const client = await serve(createApp({ service }));
    try {
      return await expectGet(path, status, client);
    } finally {
      await client.close();
    }
  }

  it('maps an unreachable server to 502', async () => {
    const err = Object.assign(new Error('connect ECONNREFUSED'), { isAxiosError: true, code: 'ECONNREFUSED' });
    const res = await getWithFailingService('/api/projects', err, 502);
    assert.match(res.body.error, /Cannot reach SonarQube/);
  });

  it('passes through SonarQube error messages', async () => {
    const err = Object.assign(new Error('Request failed'), {
      isAxiosError: true,
      response: { status: 403, data: { errors: [{ msg: 'Insufficient privileges' }] } },
    });
    const res = await getWithFailingService('/api/projects', err, 403);
    assert.equal(res.body.error, 'Insufficient privileges');
  });

  it('explains a rejected token', async () => {
    const err = Object.assign(new Error('Request failed'), {
      isAxiosError: true,
      response: { status: 401, data: {} },
    });
    const res = await getWithFailingService('/api/projects', err, 401);
    assert.match(res.body.error, /SONARQUBE_TOKEN/);
  });
});
