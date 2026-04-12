/**
 * Grading logic for Code Quality Analyzer
 * Converts raw SonarQube metrics into A/B/C grades
 */

export function gradeBugs(count) {
  const n = parseInt(count) || 0;
  if (n === 0) return 'A';
  if (n <= 5) return 'B';
  return 'C';
}

export function gradeVulnerabilities(count) {
  const n = parseInt(count) || 0;
  if (n === 0) return 'A';
  if (n <= 2) return 'B';
  return 'C';
}

export function gradeCodeSmells(count) {
  const n = parseInt(count) || 0;
  if (n <= 10) return 'A';
  if (n <= 50) return 'B';
  return 'C';
}

export function gradeCoverage(pct) {
  const n = parseFloat(pct) || 0;
  if (n >= 80) return 'A';
  if (n >= 50) return 'B';
  return 'C';
}

export function overallGrade(grades) {
  if (grades.includes('C')) return 'C';
  if (grades.includes('B')) return 'B';
  return 'A';
}

export const gradeColors = {
  A: {
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-400',
    border: 'border-emerald-500/40',
    hex: '#10b981',
  },
  B: {
    bg: 'bg-amber-500/20',
    text: 'text-amber-400',
    border: 'border-amber-500/40',
    hex: '#f59e0b',
  },
  C: {
    bg: 'bg-red-500/20',
    text: 'text-red-400',
    border: 'border-red-500/40',
    hex: '#ef4444',
  },
};

export const gradeLabels = {
  A: 'Excellent',
  B: 'Good',
  C: 'Needs Improvement',
};

export function computeAllGrades(measures) {
  const bugs = gradeBugs(measures.bugs);
  const vulns = gradeVulnerabilities(measures.vulnerabilities);
  const smells = gradeCodeSmells(measures.code_smells);
  const coverage = gradeCoverage(measures.coverage);
  const overall = overallGrade([bugs, vulns, smells, coverage]);
  return { bugs, vulnerabilities: vulns, code_smells: smells, coverage, overall };
}
