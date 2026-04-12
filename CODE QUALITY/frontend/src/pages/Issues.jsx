import { useState, useEffect, useCallback } from 'react';
import {
  Bug, ShieldAlert, Wind, ChevronLeft, ChevronRight,
  SlidersHorizontal, AlertCircle, ExternalLink,
} from 'lucide-react';
import { fetchIssues } from '../services/api';

const TYPE_CONFIG = {
  BUG: { icon: Bug, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'Bug' },
  VULNERABILITY: { icon: ShieldAlert, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', label: 'Vulnerability' },
  CODE_SMELL: { icon: Wind, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', label: 'Code Smell' },
  SECURITY_HOTSPOT: { icon: AlertCircle, color: 'text-brand-400', bg: 'bg-brand-500/10', border: 'border-brand-500/20', label: 'Hotspot' },
};

const SEVERITY_COLORS = {
  BLOCKER: 'bg-red-600 text-white',
  CRITICAL: 'bg-red-500/20 text-red-400 border border-red-500/30',
  MAJOR: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
  MINOR: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  INFO: 'bg-slate-700 text-slate-300',
};

const PAGE_SIZE = 20;

export default function Issues({ projectKey }) {
  const [issues, setIssues] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [typeFilter, setTypeFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');

  const load = useCallback(async () => {
    if (!projectKey) return;
    setLoading(true);
    setError(null);
    try {
      const filters = {
        ...(typeFilter && { types: typeFilter }),
        ...(severityFilter && { severities: severityFilter }),
        p: page,
        ps: PAGE_SIZE,
      };
      const data = await fetchIssues(projectKey, filters);
      setIssues(data.issues || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, [projectKey, typeFilter, severityFilter, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [typeFilter, severityFilter, projectKey]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  if (!projectKey) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <AlertCircle size={48} className="text-slate-600 mb-4" />
        <p className="text-slate-400 font-medium">No project selected</p>
        <p className="text-slate-600 text-sm mt-1">Select a project from the dashboard first.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Issues</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {total > 0 ? `${total.toLocaleString()} issues found` : 'No issues found'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card px-5 py-4 flex flex-wrap gap-3 items-center">
        <SlidersHorizontal size={16} className="text-slate-400" />
        <span className="text-sm text-slate-400 font-medium mr-1">Filter by:</span>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="input-field text-sm py-1.5 pr-8"
        >
          <option value="">All Types</option>
          <option value="BUG">Bug</option>
          <option value="VULNERABILITY">Vulnerability</option>
          <option value="CODE_SMELL">Code Smell</option>
          <option value="SECURITY_HOTSPOT">Security Hotspot</option>
        </select>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="input-field text-sm py-1.5 pr-8"
        >
          <option value="">All Severities</option>
          <option value="BLOCKER">Blocker</option>
          <option value="CRITICAL">Critical</option>
          <option value="MAJOR">Major</option>
          <option value="MINOR">Minor</option>
          <option value="INFO">Info</option>
        </select>

        {(typeFilter || severityFilter) && (
          <button
            onClick={() => { setTypeFilter(''); setSeverityFilter(''); }}
            className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Issues table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-14 bg-navy-700 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : issues.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-slate-300 font-semibold">No issues match your filters</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700/50">
            {/* Table header */}
            <div className="grid grid-cols-12 px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <div className="col-span-1">Type</div>
              <div className="col-span-2">Severity</div>
              <div className="col-span-5">Message</div>
              <div className="col-span-3">File</div>
              <div className="col-span-1">Line</div>
            </div>

            {issues.map((issue) => {
              const cfg = TYPE_CONFIG[issue.type] || TYPE_CONFIG.CODE_SMELL;
              const Icon = cfg.icon;
              const severityClass = SEVERITY_COLORS[issue.severity] || SEVERITY_COLORS.INFO;
              const fileName = issue.component?.split(':').pop() || issue.component;

              return (
                <div
                  key={issue.key}
                  className="grid grid-cols-12 px-5 py-3.5 items-center hover:bg-navy-700/50 transition-colors gap-x-2"
                >
                  <div className="col-span-1">
                    <span
                      className={`w-8 h-8 rounded-lg ${cfg.bg} ${cfg.border} border flex items-center justify-center`}
                      title={cfg.label}
                    >
                      <Icon size={14} className={cfg.color} />
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className={`badge text-xs ${severityClass}`}>
                      {issue.severity}
                    </span>
                  </div>
                  <div className="col-span-5">
                    <p className="text-sm text-slate-200 truncate" title={issue.message}>
                      {issue.message}
                    </p>
                    {issue.rule && (
                      <p className="text-xs text-slate-600 font-mono mt-0.5">{issue.rule}</p>
                    )}
                  </div>
                  <div className="col-span-3">
                    <p className="text-xs text-slate-400 font-mono truncate" title={fileName}>
                      {fileName}
                    </p>
                  </div>
                  <div className="col-span-1">
                    <span className="text-xs text-slate-500">{issue.line || '—'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Page {page} of {totalPages} ({total.toLocaleString()} total)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-secondary p-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const pg = i + Math.max(1, page - 2);
              if (pg > totalPages) return null;
              return (
                <button
                  key={pg}
                  onClick={() => setPage(pg)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    pg === page ? 'bg-brand-500 text-white' : 'btn-secondary'
                  }`}
                >
                  {pg}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn-secondary p-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
