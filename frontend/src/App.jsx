import { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ProjectSelector from './components/ProjectSelector';
import Dashboard from './pages/Dashboard';
import Issues from './pages/Issues';
import Settings from './pages/Settings';
import useApi from './hooks/useApi';
import { fetchProjects, checkConnection } from './services/api';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/issues': 'Issues',
  '/settings': 'Settings',
};

const CURRENT_YEAR = new Date().getFullYear();

function AppContent() {
  const location = useLocation();
  const status = useApi(checkConnection, 'status');
  const projects = useApi(fetchProjects, 'projects');
  const [selectedProject, setSelectedProject] = useState(null);

  const projectList = projects.data || [];
  // Until the user picks one, show the first project so the dashboard is never empty.
  const activeProject = selectedProject ?? projectList[0] ?? null;
  const pageTitle = PAGE_TITLES[location.pathname] || 'Dashboard';

  return (
    <div className="flex min-h-screen">
      <Sidebar
        connected={status.data?.connected === true}
        mode={status.data?.mode}
        projectName={activeProject?.name || activeProject?.key}
      />

      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-navy-900/80 backdrop-blur-md border-b border-slate-700/50 px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h1 className="text-lg font-bold text-white">{pageTitle}</h1>

            {location.pathname !== '/settings' && (
              <ProjectSelector
                projects={projectList}
                selected={activeProject}
                onSelect={setSelectedProject}
                onManualSubmit={(key) => setSelectedProject({ key, name: key })}
                loading={projects.loading}
              />
            )}
          </div>
        </header>

        <main className="flex-1 px-8 py-7">
          <Routes>
            <Route
              path="/"
              element={
                <Dashboard
                  key={activeProject?.key}
                  projectKey={activeProject?.key}
                  projectName={activeProject?.name}
                />
              }
            />
            <Route
              path="/issues"
              element={<Issues key={activeProject?.key} projectKey={activeProject?.key} />}
            />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>

        <footer className="px-8 py-4 border-t border-slate-700/30 text-xs text-slate-600 flex items-center justify-between">
          <span>Code Quality Analyzer © {CURRENT_YEAR}</span>
          <span>Powered by the SonarQube Web API</span>
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
