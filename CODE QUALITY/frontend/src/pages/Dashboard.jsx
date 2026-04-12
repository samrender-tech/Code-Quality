import { useState, useEffect } from 'react';
import { Bug, ShieldAlert, Wind, Percent, Code2, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import GradeBadge from '../components/GradeBadge';
import AlertBanner from '../components/AlertBanner';
import MetricsBarChart from '../components/charts/MetricsBarChart';
import IssuesPieChart from '../components/charts/IssuesPieChart';
import TrendLineChart from '../components/charts/TrendLineChart';
import { fetchMeasures } from '../services/api';
import { computeAllGrades } from '../utils/grading';

const ALERT_THRESHOLDS_KEY = 'cqa_thresholds';

function getThresholds() {
  try {
    return JSON.parse(localStorage.getItem(ALERT_THRESHOLDS_KEY)) || { bugs: 5, vulnerabilities: 1 };
  } catch { return { bugs: 5, vulnerabilities: 1 }; }
}

export default function Dashboard({ projectKey, projectName }) {
  const [measures, setMeasures] = useState(null);
  const [grades, setGrades] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  const load = async () => {
    if (!projectKey) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMeasures(projectKey);
      setMeasures(data.measures);
      const g = computeAllGrades(data.measures);
      setGrades(g);
      buildAlerts(data.measures, g);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const buildAlerts = (m, g) => {
    const t = getThresholds();
    const list = [];
    const bugs = parseInt(m.bugs) || 0;
    const vulns = parseInt(m.vulnerabilities) || 0;

    if (bugs > t.bugs) {
      list.push({
        id: 'bugs-alert',
        type: 'danger',
        title: `High Bug Count: ${bugs} bugs detected`,
        message: `Threshold is ${t.bugs}. Immediate attention recommended.`,
      });
    }
    if (vulns > 0) {
      list.push({
        id: 'vuln-alert',
        type: 'danger',
        title: `${vulns} Securit${vulns === 1 ? 'y Vulnerability' : 'y Vulnerabilities'} Found`,
        message: 'Security vulnerabilities should be fixed immediately.',
      });
    }
    if (g.overall === 'C') {
      list.push({
        id: 'grade-alert',
        type: 'warning',
        title: 'Overall Grade: C — Code quality needs improvement',
        message: 'Review bugs, vulnerabilities, and code smells.',
      });
    }
    if (m.alert_status === 'ERROR') {
      list.push({
        id: 'qgate-alert',
        type: 'danger',
        title: 'Quality Gate: FAILED',
        message: 'This project has failed its SonarQube quality gate.',
      });
    }
    setAlerts(list);
  };

  useEffect(() => { load(); }, [projectKey]);

  if (!projectKey) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-fade-in">
        <div className="w-20 h-20 rounded-3xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-6">
          <Code2 size={36} className="text-brand-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Select a Project</h2>
        <p className="text-slate-400 max-w-sm">
          Choose a SonarQube project from the selector above, or type a project key manually to analyze its code quality.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">{projectName || projectKey}</h2>
          <p className="text-xs text-slate-500 mt-0.5 font-mono">{projectKey}</p>
        </div>
        <div className="flex items-center gap-3">
          {lastRefresh && (
            <span className="text-xs text-slate-500">
              Updated {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <button onClick={load} disabled={loading} className="btn-secondary flex items-center gap-2 text-sm">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Quality Gate status */}
      {measures && (
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-semibold ${
            measures.alert_status === 'OK'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : measures.alert_status === 'ERROR'
              ? 'bg-red-500/10 border-red-500/30 text-red-400'
              : 'bg-slate-700/30 border-slate-600/30 text-slate-400'
          }`}
        >
          {measures.alert_status === 'OK' ? (
            <CheckCircle2 size={16} />
          ) : (
            <XCircle size={16} />
          )}
          Quality Gate:{' '}
          {measures.alert_status === 'OK'
            ? 'PASSED'
            : measures.alert_status === 'ERROR'
            ? 'FAILED'
            : 'Not Available'}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Alert banners */}
      <AlertBanner alerts={alerts} />

      {/* Metric cards + grade */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Bugs"
          value={loading ? null : measures?.bugs ?? '—'}
          icon={Bug}
          grade={grades?.bugs}
          sublabel="Reliability issues"
          loading={loading}
          color="bg-red-500/20"
        />
        <MetricCard
          label="Vulnerabilities"
          value={loading ? null : measures?.vulnerabilities ?? '—'}
          icon={ShieldAlert}
          grade={grades?.vulnerabilities}
          sublabel="Security issues"
          loading={loading}
          color="bg-orange-500/20"
        />
        <MetricCard
          label="Code Smells"
          value={loading ? null : measures?.code_smells ?? '—'}
          icon={Wind}
          grade={grades?.code_smells}
          sublabel="Maintainability"
          loading={loading}
          color="bg-yellow-500/20"
        />
        <MetricCard
          label="Coverage"
          value={loading ? null : measures?.coverage ? `${parseFloat(measures.coverage).toFixed(1)}%` : '—'}
          icon={Percent}
          grade={grades?.coverage}
          sublabel="Test coverage"
          loading={loading}
          color="bg-emerald-500/20"
        />
      </div>

      {/* Overall grade + secondary stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Grade panel */}
        <div className="glass-card p-6 flex flex-col items-center justify-center gap-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Grade</p>
          {grades ? (
            <GradeBadge grade={grades.overall} size="lg" />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-navy-700 animate-pulse" />
          )}
        </div>

        {/* Secondary metrics */}
        <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: 'Lines of Code', key: 'ncloc', icon: Code2 },
            { label: 'Duplication', key: 'duplicated_lines_density', suffix: '%' },
            { label: 'Reliability Rating', key: 'reliability_rating' },
            { label: 'Security Rating', key: 'security_rating' },
            { label: 'Maintainability', key: 'sqale_rating' },
          ].map(({ label, key, icon: Ic, suffix = '' }) => (
            <div key={key} className="glass-card px-5 py-4">
              <p className="text-xs text-slate-500 mb-1">{label}</p>
              {loading ? (
                <div className="h-7 w-16 bg-navy-700 rounded animate-pulse" />
              ) : (
                <p className="text-xl font-bold text-white">
                  {measures?.[key] != null
                    ? `${parseFloat(measures[key]).toFixed(measures[key] % 1 !== 0 ? 1 : 0)}${suffix}`
                    : '—'}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MetricsBarChart measures={measures || {}} />
        <IssuesPieChart measures={measures || {}} />
      </div>

      {/* Trend chart (placeholder — no history API available by default) */}
      <TrendLineChart history={[]} />
    </div>
  );
}
