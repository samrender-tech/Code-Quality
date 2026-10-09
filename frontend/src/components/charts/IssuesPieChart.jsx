import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

// Colour by issue type so a slice keeps its colour when another type has zero issues.
const TYPE_COLORS = {
  BUG: '#ef4444',
  VULNERABILITY: '#f97316',
  CODE_SMELL: '#eab308',
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-navy-800 border border-slate-600 rounded-xl px-4 py-3 shadow-card">
        <p className="text-xs text-slate-400">{payload[0].name}</p>
        <p className="text-lg font-bold text-white">{payload[0].value}</p>
        <p className="text-xs text-slate-500">{`${payload[0].payload.percent}%`}</p>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }) => (
  <div className="flex flex-wrap justify-center gap-3 mt-3">
    {payload.map((entry, i) => (
      <div key={i} className="flex items-center gap-1.5 text-xs text-slate-400">
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: entry.color }} />
        {entry.value}
      </div>
    ))}
  </div>
);

export default function IssuesPieChart({ measures }) {
  const bugs = parseInt(measures?.bugs) || 0;
  const vulns = parseInt(measures?.vulnerabilities) || 0;
  const smells = parseInt(measures?.code_smells) || 0;
  const total = bugs + vulns + smells || 1;

  const raw = [
    { name: 'Bugs', value: bugs, type: 'BUG' },
    { name: 'Vulnerabilities', value: vulns, type: 'VULNERABILITY' },
    { name: 'Code Smells', value: smells, type: 'CODE_SMELL' },
  ].filter((d) => d.value > 0);

  const data = raw.map((d) => ({
    ...d,
    percent: ((d.value / total) * 100).toFixed(1),
  }));

  if (data.length === 0) {
    return (
      <div className="glass-card p-6 flex flex-col items-center justify-center h-full min-h-[260px]">
        <div className="text-4xl mb-3">🎉</div>
        <p className="text-slate-300 font-semibold">No Issues Found!</p>
        <p className="text-slate-500 text-sm mt-1">This project looks clean.</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <h3 className="text-sm font-semibold text-slate-300 mb-4">Issue Distribution</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry) => (
              <Cell
                key={entry.type}
                fill={TYPE_COLORS[entry.type]}
                fillOpacity={0.9}
                stroke="transparent"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
