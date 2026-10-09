import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, FolderOpen, Clock } from 'lucide-react';

export default function ProjectSelector({ projects, selected, onSelect, onManualSubmit, loading }) {
  const [open, setOpen] = useState(false);
  const [manualKey, setManualKey] = useState('');
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.key.toLowerCase().includes(search.toLowerCase())
  );

  const handleManual = (e) => {
    e.preventDefault();
    if (manualKey.trim()) {
      onManualSubmit(manualKey.trim());
      setManualKey('');
      setOpen(false);
    }
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Dropdown */}
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 bg-navy-700 border border-slate-600 rounded-xl px-4 py-2.5
                     text-sm text-slate-200 hover:border-brand-500 transition-all duration-200 min-w-[220px]"
        >
          <FolderOpen size={16} className="text-brand-400 shrink-0" />
          <span className="flex-1 text-left truncate">
            {selected?.name || selected?.key || 'Select a project…'}
          </span>
          <ChevronDown size={16} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="absolute top-full left-0 mt-2 w-80 bg-navy-800 border border-slate-600 rounded-2xl
                          shadow-card z-50 overflow-hidden animate-fade-in">
            {/* Search */}
            <div className="p-3 border-b border-slate-700">
              <div className="flex items-center gap-2 bg-navy-700 rounded-xl px-3 py-2">
                <Search size={14} className="text-slate-400" />
                <input
                  type="text"
                  placeholder="Search projects…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent text-sm text-slate-200 outline-none flex-1 placeholder-slate-500"
                  autoFocus
                />
              </div>
            </div>

            {/* Project list */}
            <div className="max-h-56 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-sm text-slate-400">Loading projects…</div>
              ) : filtered.length === 0 ? (
                <div className="p-4 text-center text-sm text-slate-500">No projects found</div>
              ) : (
                filtered.map((p) => (
                  <button
                    key={p.key}
                    onClick={() => { onSelect(p); setOpen(false); setSearch(''); }}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-navy-700
                                transition-colors ${selected?.key === p.key ? 'bg-brand-500/10 border-l-2 border-brand-500' : ''}`}
                  >
                    <FolderOpen size={15} className="text-brand-400 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-100 truncate">{p.name}</p>
                      <p className="text-xs text-slate-500 truncate">{p.key}</p>
                      {p.lastAnalysisDate && (
                        <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                          <Clock size={10} />
                          {new Date(p.lastAnalysisDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Manual entry */}
            <div className="p-3 border-t border-slate-700">
              <form onSubmit={handleManual} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Or enter project key…"
                  value={manualKey}
                  onChange={(e) => setManualKey(e.target.value)}
                  className="input-field flex-1 text-sm py-2 text-sm"
                />
                <button type="submit" className="btn-primary text-sm px-3 py-2">Go</button>
              </form>
            </div>
          </div>
        )}
      </div>

      {selected && (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span className="text-slate-600">|</span>
          <span className="text-brand-400 font-mono text-xs bg-brand-500/10 px-2 py-1 rounded-lg">
            {selected.key}
          </span>
        </div>
      )}
    </div>
  );
}
