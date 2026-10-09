import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  gradeBugs, gradeVulnerabilities, gradeCodeSmells, gradeCoverage,
  overallGrade, computeAllGrades, ratingLetter,
} from './grading.js';

describe('metric grades', () => {
  it('grades bugs at the 0 / 5 boundaries', () => {
    assert.equal(gradeBugs('0'), 'A');
    assert.equal(gradeBugs('1'), 'B');
    assert.equal(gradeBugs('5'), 'B');
    assert.equal(gradeBugs('6'), 'C');
  });

  it('grades vulnerabilities at the 0 / 2 boundaries', () => {
    assert.equal(gradeVulnerabilities('0'), 'A');
    assert.equal(gradeVulnerabilities('2'), 'B');
    assert.equal(gradeVulnerabilities('3'), 'C');
  });

  it('grades code smells at the 10 / 50 boundaries', () => {
    assert.equal(gradeCodeSmells('10'), 'A');
    assert.equal(gradeCodeSmells('11'), 'B');
    assert.equal(gradeCodeSmells('50'), 'B');
    assert.equal(gradeCodeSmells('51'), 'C');
  });

  it('grades coverage at the 50 / 80 boundaries', () => {
    assert.equal(gradeCoverage('80.0'), 'A');
    assert.equal(gradeCoverage('79.9'), 'B');
    assert.equal(gradeCoverage('50'), 'B');
    assert.equal(gradeCoverage('49.9'), 'C');
  });

  it('returns null when a metric is missing', () => {
    assert.equal(gradeBugs(undefined), null);
    assert.equal(gradeCoverage(undefined), null);
    assert.equal(gradeCoverage(''), null);
  });
});

describe('overall grade', () => {
  it('is the worst grade', () => {
    assert.equal(overallGrade(['A', 'B', 'A']), 'B');
    assert.equal(overallGrade(['A', 'C', 'B']), 'C');
    assert.equal(overallGrade(['A', 'A']), 'A');
  });

  it('ignores ungraded metrics', () => {
    assert.equal(overallGrade(['A', null, 'A']), 'A');
    assert.equal(overallGrade([null, null]), null);
  });

  it('does not penalise a project without coverage data', () => {
    const grades = computeAllGrades({ bugs: '0', vulnerabilities: '0', code_smells: '3' });
    assert.equal(grades.coverage, null);
    assert.equal(grades.overall, 'A');
  });
});

describe('ratingLetter', () => {
  it('maps SonarQube ratings 1–5 to A–E', () => {
    assert.equal(ratingLetter('1.0'), 'A');
    assert.equal(ratingLetter('3.0'), 'C');
    assert.equal(ratingLetter('5.0'), 'E');
  });

  it('returns null for missing or out-of-range values', () => {
    assert.equal(ratingLetter(undefined), null);
    assert.equal(ratingLetter('0'), null);
    assert.equal(ratingLetter('9'), null);
  });
});
