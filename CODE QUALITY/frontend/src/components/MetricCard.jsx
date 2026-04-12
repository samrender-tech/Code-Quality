import { gradeColors } from '../utils/grading';

export default function MetricCard({ label, value, icon: Icon, grade, sublabel, loading, color }) {
  const colors = grade ? gradeColors[grade] : null;

  return (
    <div className="glass-card p-6 flex flex-col gap-3 animate-fade-in">
      <div className="flex items-start justify-between">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            color || 'bg-brand-500/20'
          }`}
        >
          {Icon && <Icon size={20} className={colors ? colors.text : 'text-brand-400'} />}
        </div>
        {grade && (
          <span
            className={`badge ${colors.bg} ${colors.text} ${colors.border} border text-sm font-bold`}
          >
            {grade}
          </span>
        )}
      </div>

      <div>
        {loading ? (
          <div className="h-9 w-24 bg-navy-700 rounded-lg animate-pulse" />
        ) : (
          <p className="text-3xl font-extrabold text-white tracking-tight">
            {value ?? '—'}
          </p>
        )}
        <p className="text-sm text-slate-400 mt-1 font-medium">{label}</p>
        {sublabel && <p className="text-xs text-slate-500 mt-0.5">{sublabel}</p>}
      </div>

      {/* Bottom gradient bar */}
      <div
        className={`h-1 rounded-full mt-1 ${
          grade === 'A'
            ? 'bg-emerald-500'
            : grade === 'B'
            ? 'bg-amber-500'
            : grade === 'C'
            ? 'bg-red-500'
            : 'bg-brand-500'
        } bg-opacity-60`}
        style={{ width: '100%' }}
      />
    </div>
  );
}
