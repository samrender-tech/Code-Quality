import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LabelList,
} from 'recharts';

const COLORS = {
  bugs: '#ef4444',
  vulnerabilities: '#f97316',
  code_smells: '#eab308',
  coverage: '#10b981',
  duplicated_lines_density: '#6366f1',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-navy-800 border border-slate-600 rounded-xl px-4 py-3 shadow-card">
        <p className="text-xs text-slate-400 mb-1">{label}</p>
        <p className="text-lg font-bold text-white">{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export default function MetricsBarChart({ measures }) {
  const data = [
    { name: 'Bugs', value: parseInt(measures?.bugs) || 0, key: 'bugs' },
    { name: 'Vulns', value: parseInt(measures?.vulnerabilities) || 0, key: 'vulnerabilities' },
    { name: 'Smells', value: parseInt(measures?.code_smells) || 0, key: 'code_smells' },
    { name: 'Coverage %', value: parseFloat(measures?.coverage) || 0, key: 'coverage' },
    { name: 'Duplication %', value: parseFloat(measures?.duplicated_lines_density) || 0, key: 'duplicated_lines_density' },
  ];

  return (
    <div className="glass-card p-6">
      <h3 className="text-sm font-semibold text-slate-300 mb-5">Metrics Overview</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2a47" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.08)' }} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48}>
            {data.map((entry) => (
              <Cell key={entry.key} fill={COLORS[entry.key]} fillOpacity={0.85} />
            ))}
            <LabelList dataKey="value" position="top" style={{ fill: '#94a3b8', fontSize: 11 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
