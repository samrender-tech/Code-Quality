/**
 * Converts any thrown error into a consistent JSON response: { error: string }.
 * Errors from SonarQube (axios) keep SonarQube's status code and message;
 * an unreachable SonarQube server becomes a 502.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let status = err.status || 500;
  let message = err.message || 'Internal server error';

  if (err.isAxiosError) {
    if (err.response) {
      status = err.response.status;
      message = err.response.data?.errors?.[0]?.msg || `SonarQube responded with ${status}`;
      if (status === 401) message = 'SonarQube rejected the token. Check SONARQUBE_TOKEN in backend/.env.';
    } else {
      status = 502;
      message = `Cannot reach SonarQube (${err.code || 'network error'}). Is it running?`;
    }
  }

  if (status >= 500) console.error(`[${req.method} ${req.originalUrl}]`, err.message);
  res.status(status).json({ error: message });
}

function notFound(req, res) {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
}

module.exports = { errorHandler, notFound };
