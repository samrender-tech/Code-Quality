import { gradeColors, gradeLabels } from '../utils/grading';
import { Award } from 'lucide-react';

export default function GradeBadge({ grade, size = 'md', showLabel = true }) {
  const colors = gradeColors[grade] || gradeColors['C'];

  const sizeClasses = {
    sm: 'text-lg w-10 h-10',
    md: 'text-3xl w-16 h-16',
    lg: 'text-5xl w-24 h-24',
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`
          ${sizeClasses[size]} ${colors.bg} ${colors.text} ${colors.border}
          border-2 rounded-2xl flex items-center justify-center font-extrabold
          shadow-lg transition-all duration-300
        `}
        title={`Grade ${grade}: ${gradeLabels[grade]}`}
      >
        {grade}
      </div>
      {showLabel && (
        <div className="flex items-center gap-1">
          <Award size={12} className={colors.text} />
          <span className={`text-xs font-semibold ${colors.text}`}>
            {gradeLabels[grade]}
          </span>
        </div>
      )}
    </div>
  );
}
