import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-navy-800 border border-slate-600 rounded-xl px-4 py-3 shadow-card">
        <p className="text-xs text-slate-400 mb-2">{label}</p>
        {payload.map((p) => (
          <p key={p.name} className="text-sm font-semibold" style={{ color: p.color }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// SonarQube dates look like 2026-09-30T10:15:00+0000; add the colon so every browser parses them.
function formatDate(value) {
  const date = new Date(String(value).replace(/([+-]\d{2})(\d{2})$/, '$1:$2'));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function TrendLineChart({ history = [], loading = false }) {
  if (loading) {
    return <div className="glass-card p-6 min-h-[200px] animate-pulse" aria-busy="true" />;
  }

  if (!history || history.length < 2) {
    return (
      <div className="glass-card p-6 flex flex-col items-center justify-center min-h-[200px]">
        <p className="text-slate-400 text-sm font-medium">Trend data not available yet</p>
        <p className="text-slate-600 text-xs mt-1">Analyze the project at least twice to see how it changes.</p>
      </div>
    );
  }

  const data = history.map((point) => ({ ...point, label: formatDate(point.date) }));

  return (
    <div className="glass-card p-6">
      <h3 className="text-sm font-semibold text-slate-300 mb-5">Quality Trend</h3>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2a47" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
          <Line type="monotone" dataKey="bugs" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} name="Bugs" />
          <Line type="monotone" dataKey="vulnerabilities" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} name="Vulns" />
          <Line type="monotone" dataKey="code_smells" stroke="#eab308" strokeWidth={2} dot={{ r: 3 }} name="Smells" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
