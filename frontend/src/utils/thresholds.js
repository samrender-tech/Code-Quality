/** Alert thresholds, saved per browser in localStorage. */

const STORAGE_KEY = 'cqa_thresholds';

export const DEFAULT_THRESHOLDS = Object.freeze({ bugs: 5, vulnerabilities: 0 });

function sanitize(value, fallback) {
  const n = Number.parseInt(value, 10);
  return Number.isNaN(n) || n < 0 ? fallback : n;
}

export function loadThresholds() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    return {
      bugs: sanitize(stored.bugs, DEFAULT_THRESHOLDS.bugs),
      vulnerabilities: sanitize(stored.vulnerabilities, DEFAULT_THRESHOLDS.vulnerabilities),
    };
  } catch {
    return { ...DEFAULT_THRESHOLDS };
  }
}

/** Returns true when the thresholds were saved. */
export function saveThresholds(thresholds) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(thresholds));
    return true;
  } catch {
    return false;
  }
}
