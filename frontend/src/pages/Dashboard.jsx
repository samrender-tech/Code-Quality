import { useMemo } from 'react';
import { Bug, ShieldAlert, Wind, Percent, Code2, RefreshCw, CheckCircle2, XCircle, CircleDashed } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import GradeBadge from '../components/GradeBadge';
import AlertBanner from '../components/AlertBanner';
import MetricsBarChart from '../components/charts/MetricsBarChart';
import IssuesPieChart from '../components/charts/IssuesPieChart';
import TrendLineChart from '../components/charts/TrendLineChart';
import useApi from '../hooks/useApi';
import { fetchMeasures, fetchHistory } from '../services/api';
import { computeAllGrades, ratingLetter, ratingColors } from '../utils/grading';
import { buildAlerts } from '../utils/alerts';
import { loadThresholds } from '../utils/thresholds';

const SECONDARY_METRICS = [
  { label: 'Lines of Code', key: 'ncloc', format: (v) => Number(v).toLocaleString() },
  { label: 'Duplication', key: 'duplicated_lines_density', format: (v) => `${Number(v).toFixed(1)}%` },
  { label: 'Reliability Rating', key: 'reliability_rating', rating: true },
  { label: 'Security Rating', key: 'security_rating', rating: true },
  { label: 'Maintainability Rating', key: 'sqale_rating', rating: true },
];

const QUALITY_GATE = {
  OK: { label: 'PASSED', icon: CheckCircle2, className: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' },
  ERROR: { label: 'FAILED', icon: XCircle, className: 'bg-red-500/10 border-red-500/30 text-red-400' },
  NONE: { label: 'Not available', icon: CircleDashed, className: 'bg-slate-700/30 border-slate-600/30 text-slate-400' },
};

function SecondaryValue({ metric, value }) {
  if (value == null) return <span className="text-slate-500">—</span>;
  if (metric.rating) {
    const letter = ratingLetter(value);
    return <span className={letter ? ratingColors[letter] : 'text-white'}>{letter || value}</span>;
  }
  return <span className="text-white">{metric.format(value)}</span>;
}

export default function Dashboard({ projectKey, projectName }) {
  const measuresReq = useApi(
    () => fetchMeasures(projectKey).then((data) => ({ ...data, fetchedAt: new Date() })),
    projectKey ?? null,
  );
  const historyReq = useApi(() => fetchHistory(projectKey), projectKey ?? null);

  const loading = measuresReq.loading;
  const measures = measuresReq.data?.measures ?? null;
  const grades = useMemo(() => (measures ? computeAllGrades(measures) : null), [measures]);
  const alerts = useMemo(() => buildAlerts(measures, grades, loadThresholds()), [measures, grades]);

  const refresh = () => {
    measuresReq.reload();
    historyReq.reload();
  };

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

  const gate = QUALITY_GATE[measures?.alert_status] || QUALITY_GATE.NONE;
  const GateIcon = gate.icon;
  const metricValue = (key, format = (v) => v) => (measures?.[key] != null ? format(measures[key]) : '—');

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">{measuresReq.data?.projectName || projectName || projectKey}</h2>
          <p className="text-xs text-slate-500 mt-0.5 font-mono">{projectKey}</p>
        </div>
        <div className="flex items-center gap-3">
          {measuresReq.data?.fetchedAt && (
            <span className="text-xs text-slate-500">
              Updated {measuresReq.data.fetchedAt.toLocaleTimeString()}
            </span>
          )}
          <button onClick={refresh} disabled={loading} className="btn-secondary flex items-center gap-2 text-sm">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {measures && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-semibold ${gate.className}`}>
          <GateIcon size={16} />
          Quality Gate: {gate.label}
        </div>
      )}

      {measuresReq.error && (
        <div role="alert" className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
          {measuresReq.error}
        </div>
      )}

      <AlertBanner alerts={alerts} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Bugs"
          value={metricValue('bugs')}
          icon={Bug}
          grade={grades?.bugs}
          sublabel="Reliability issues"
          loading={loading}
          color="bg-red-500/20"
        />
        <MetricCard
          label="Vulnerabilities"
          value={metricValue('vulnerabilities')}
          icon={ShieldAlert}
          grade={grades?.vulnerabilities}
          sublabel="Security issues"
          loading={loading}
          color="bg-orange-500/20"
        />
        <MetricCard
          label="Code Smells"
          value={metricValue('code_smells')}
          icon={Wind}
          grade={grades?.code_smells}
          sublabel="Maintainability"
          loading={loading}
          color="bg-yellow-500/20"
        />
        <MetricCard
          label="Coverage"
          value={metricValue('coverage', (v) => `${Number(v).toFixed(1)}%`)}
          icon={Percent}
          grade={grades?.coverage}
          sublabel={measures && measures.coverage == null ? 'No coverage report' : 'Test coverage'}
          loading={loading}
          color="bg-emerald-500/20"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="glass-card p-6 flex flex-col items-center justify-center gap-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Grade</p>
          {grades?.overall ? (
            <GradeBadge grade={grades.overall} size="lg" />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-navy-700 animate-pulse" />
          )}
        </div>

        <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {SECONDARY_METRICS.map((metric) => (
            <div key={metric.key} className="glass-card px-5 py-4">
              <p className="text-xs text-slate-500 mb-1">{metric.label}</p>
              {loading ? (
                <div className="h-7 w-16 bg-navy-700 rounded animate-pulse" />
              ) : (
                <p className="text-xl font-bold">
                  <SecondaryValue metric={metric} value={measures?.[metric.key]} />
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MetricsBarChart measures={measures || {}} />
        <IssuesPieChart measures={measures || {}} />
      </div>

      <TrendLineChart history={historyReq.data || []} loading={historyReq.loading} />
    </div>
  );
}
