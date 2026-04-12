import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Bug,
  Settings,
  Activity,
  GitBranch,
  Zap,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/issues', icon: Bug, label: 'Issues' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ connected, projectName }) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-navy-900 border-r border-slate-700/50 flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-glow">
            <Activity size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight">Code Quality</h1>
            <p className="text-xs text-slate-400">Analyzer</p>
          </div>
        </div>
      </div>

      {/* Connection status */}
      <div className="px-4 py-3 mx-3 mt-4 rounded-xl bg-navy-800 border border-slate-700/30">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full animate-pulse-slow ${
              connected ? 'bg-emerald-400' : 'bg-red-400'
            }`}
          />
          <span className="text-xs text-slate-400">
            {connected ? 'SonarQube Connected' : 'Not Connected'}
          </span>
        </div>
        {projectName && (
          <p className="text-xs text-slate-500 mt-1 truncate pl-4">{projectName}</p>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 mb-3">
          Navigation
        </p>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
            <ChevronRight size={14} className="ml-auto opacity-40" />
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700/50">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Zap size={13} className="text-brand-400" />
          <span>Powered by SonarQube</span>
        </div>
        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
          <GitBranch size={13} />
          <span>v1.0.0</span>
        </div>
      </div>
    </aside>
  );
}
