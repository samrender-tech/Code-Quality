/** Rejects the request with 400 unless ?projectKey= is present. */
function requireProjectKey(req, res, next) {
  const projectKey = String(req.query.projectKey || '').trim();
  if (!projectKey) {
    return res.status(400).json({ error: 'projectKey query param is required' });
  }
  req.projectKey = projectKey;
  return next();
}

/** Parses a positive integer query value, clamped to [min, max]. */
function toInt(value, fallback, min, max) {
  const n = Number.parseInt(value, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(Math.max(n, min), max);
}

module.exports = { requireProjectKey, toInt };
