/**
 * Grading logic for the Code Quality Analyzer.
 * Converts raw SonarQube metric values (strings) into A/B/C grades.
 * A grade of null means "not enough data" and is ignored in the overall grade.
 */

function toNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/** Grades a count where lower is better: 0..a → A, ..b → B, above → C. */
function gradeCount(value, aMax, bMax) {
  const n = toNumber(value);
  if (n === null) return null;
  if (n <= aMax) return 'A';
  if (n <= bMax) return 'B';
  return 'C';
}

export const gradeBugs = (count) => gradeCount(count, 0, 5);
export const gradeVulnerabilities = (count) => gradeCount(count, 0, 2);
export const gradeCodeSmells = (count) => gradeCount(count, 10, 50);

export function gradeCoverage(pct) {
  const n = toNumber(pct);
  // Projects without coverage reports get no grade instead of an unfair C.
  if (n === null) return null;
  if (n >= 80) return 'A';
  if (n >= 50) return 'B';
  return 'C';
}

/** The overall grade is the worst individual grade; ungraded metrics are skipped. */
export function overallGrade(grades) {
  const known = grades.filter(Boolean);
  if (known.length === 0) return null;
  if (known.includes('C')) return 'C';
  if (known.includes('B')) return 'B';
  return 'A';
}

export function computeAllGrades(measures = {}) {
  const grades = {
    bugs: gradeBugs(measures.bugs),
    vulnerabilities: gradeVulnerabilities(measures.vulnerabilities),
    code_smells: gradeCodeSmells(measures.code_smells),
    coverage: gradeCoverage(measures.coverage),
  };
  return { ...grades, overall: overallGrade(Object.values(grades)) };
}

/** SonarQube ratings come back as "1.0".."5.0"; convert them to the familiar A–E. */
export function ratingLetter(value) {
  const n = toNumber(value);
  if (n === null || n < 1 || n > 5) return null;
  return 'ABCDE'[Math.round(n) - 1];
}

export const gradeColors = {
  A: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/40', bar: 'bg-emerald-500' },
  B: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/40', bar: 'bg-amber-500' },
  C: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/40', bar: 'bg-red-500' },
};

export const ratingColors = {
  A: 'text-emerald-400',
  B: 'text-lime-400',
  C: 'text-amber-400',
  D: 'text-orange-400',
  E: 'text-red-400',
};

export const gradeLabels = {
  A: 'Excellent',
  B: 'Good',
  C: 'Needs Improvement',
};
