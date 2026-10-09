import { useState } from 'react';
import { Save, RefreshCw, Wifi, WifiOff, Settings as SettingsIcon } from 'lucide-react';
import { API_URL, checkConnection } from '../services/api';
import { errorMessage } from '../hooks/useApi';
import { loadThresholds, saveThresholds } from '../utils/thresholds';

const toCount = (value) => Math.max(0, Number.parseInt(value, 10) || 0);

export default function Settings() {
  const [thresholds, setThresholds] = useState(loadThresholds);
  const [saveState, setSaveState] = useState(null); // 'saved' | 'failed' | null
  const [connStatus, setConnStatus] = useState(null);
  const [connLoading, setConnLoading] = useState(false);

  const save = () => {
    setSaveState(saveThresholds(thresholds) ? 'saved' : 'failed');
    setTimeout(() => setSaveState(null), 2500);
  };

  const testConn = async () => {
    setConnLoading(true);
    setConnStatus(null);
    try {
      const data = await checkConnection();
      setConnStatus({ ok: true, version: data.version, status: data.status, mode: data.mode });
    } catch (err) {
      setConnStatus({ ok: false, error: errorMessage(err) });
    } finally {
      setConnLoading(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Settings</h2>
        <p className="text-slate-400 text-sm mt-1">Configure alert thresholds and connection settings.</p>
      </div>

      {/* Alert Thresholds */}
      <div className="glass-card p-6 space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <SettingsIcon size={16} className="text-brand-400" />
          <h3 className="text-sm font-semibold text-slate-200">Alert Thresholds</h3>
        </div>
        <p className="text-xs text-slate-500 -mt-3">
          Alerts will fire on the dashboard when these thresholds are exceeded.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="threshold-bugs" className="block text-xs font-medium text-slate-400 mb-2">
              Bug Count Threshold
            </label>
            <input
              id="threshold-bugs"
              type="number"
              min={0}
              value={thresholds.bugs}
              onChange={(e) => setThresholds((t) => ({ ...t, bugs: toCount(e.target.value) }))}
              className="input-field w-full"
            />
            <p className="text-xs text-slate-600 mt-1">Alert if bugs &gt; this value</p>
          </div>
          <div>
            <label htmlFor="threshold-vulns" className="block text-xs font-medium text-slate-400 mb-2">
              Vulnerability Threshold
            </label>
            <input
              id="threshold-vulns"
              type="number"
              min={0}
              value={thresholds.vulnerabilities}
              onChange={(e) => setThresholds((t) => ({ ...t, vulnerabilities: toCount(e.target.value) }))}
              className="input-field w-full"
            />
            <p className="text-xs text-slate-600 mt-1">Alert if vulnerabilities &gt; this value</p>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button onClick={save} className="btn-primary flex items-center gap-2 text-sm">
            <Save size={14} />
            Save Thresholds
          </button>
          {saveState === 'saved' && (
            <span className="text-xs text-emerald-400 animate-fade-in">✓ Saved</span>
          )}
          {saveState === 'failed' && (
            <span className="text-xs text-red-400 animate-fade-in">Could not save in this browser</span>
          )}
        </div>
      </div>

      {/* Connection test */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Wifi size={16} className="text-brand-400" />
          <h3 className="text-sm font-semibold text-slate-200">SonarQube Connection</h3>
        </div>

        <div className="bg-navy-700 rounded-xl p-4 space-y-2 text-xs font-mono">
          <p className="text-slate-400">
            Backend URL:{' '}
            <span className="text-brand-400">{API_URL}</span>
          </p>
          <p className="text-slate-500 text-xs">
            To change the SonarQube URL or token, or to switch demo mode on or off, edit{' '}
            <code className="text-slate-300">backend/.env</code>
          </p>
        </div>

        <button
          onClick={testConn}
          disabled={connLoading}
          className="btn-secondary flex items-center gap-2 text-sm"
        >
          <RefreshCw size={14} className={connLoading ? 'animate-spin' : ''} />
          Test Connection
        </button>

        {connStatus && (
          <div
            className={`rounded-xl px-4 py-3 text-sm border animate-fade-in ${
              connStatus.ok
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}
          >
            {connStatus.ok ? (
              <div className="flex items-center gap-2">
                <Wifi size={14} />
                <span>
                  {connStatus.mode === 'demo'
                    ? 'Connected to the API in demo mode (sample data).'
                    : `Connected to SonarQube ${connStatus.version} (status: ${connStatus.status})`}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <WifiOff size={14} />
                <span>Connection failed: {connStatus.error}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Grading reference */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-slate-200 mb-4">Grading Reference</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-500 border-b border-slate-700">
                <th className="text-left py-2 pr-4 font-semibold">Metric</th>
                <th className="text-center py-2 px-4 font-semibold text-emerald-400">A — Excellent</th>
                <th className="text-center py-2 px-4 font-semibold text-amber-400">B — Good</th>
                <th className="text-center py-2 px-4 font-semibold text-red-400">C — Needs Work</th>
              </tr>
            </thead>
            <tbody className="text-slate-300 divide-y divide-slate-700/50">
              {[
                ['Bugs', '0', '1–5', '>5'],
                ['Vulnerabilities', '0', '1–2', '>2'],
                ['Code Smells', '0–10', '11–50', '>50'],
                ['Coverage', '≥80%', '50–79%', '<50%'],
              ].map(([metric, a, b, c]) => (
                <tr key={metric} className="hover:bg-navy-700/30 transition-colors">
                  <td className="py-2.5 pr-4 font-medium text-slate-200">{metric}</td>
                  <td className="py-2.5 px-4 text-center text-emerald-400">{a}</td>
                  <td className="py-2.5 px-4 text-center text-amber-400">{b}</td>
                  <td className="py-2.5 px-4 text-center text-red-400">{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
