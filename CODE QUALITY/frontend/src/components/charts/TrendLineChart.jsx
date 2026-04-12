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

export default function TrendLineChart({ history = [] }) {
  if (!history || history.length < 2) {
    return (
      <div className="glass-card p-6 flex flex-col items-center justify-center min-h-[200px]">
        <p className="text-slate-400 text-sm font-medium">Trend data not available</p>
        <p className="text-slate-600 text-xs mt-1">Analyze the project multiple times to see trends.</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <h3 className="text-sm font-semibold text-slate-300 mb-5">Quality Trend</h3>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={history} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2a47" vertical={false} />
          <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
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
