import { useState } from 'react';
import { AlertTriangle, ShieldAlert, X, Info } from 'lucide-react';

const alertConfig = {
  danger: {
    icon: ShieldAlert,
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-400',
    iconColor: 'text-red-400',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    iconColor: 'text-amber-400',
  },
  info: {
    icon: Info,
    bg: 'bg-brand-500/10',
    border: 'border-brand-500/30',
    text: 'text-brand-400',
    iconColor: 'text-brand-400',
  },
};

export default function AlertBanner({ alerts = [] }) {
  const [dismissed, setDismissed] = useState([]);

  const visible = alerts.filter((a) => !dismissed.includes(a.id));
  if (!visible.length) return null;

  return (
    <div className="space-y-2 mb-6">
      {visible.map((alert) => {
        const cfg = alertConfig[alert.type] || alertConfig.info;
        const Icon = cfg.icon;
        return (
          <div
            key={alert.id}
            className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${cfg.bg} ${cfg.border} animate-slide-up`}
          >
            <Icon size={18} className={`${cfg.iconColor} shrink-0 mt-0.5`} />
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${cfg.text}`}>{alert.title}</p>
              {alert.message && (
                <p className="text-xs text-slate-400 mt-0.5">{alert.message}</p>
              )}
            </div>
            <button
              onClick={() => setDismissed((d) => [...d, alert.id])}
              className="text-slate-500 hover:text-slate-300 shrink-0 transition-colors"
              aria-label="Dismiss alert"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
