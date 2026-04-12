import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ProjectSelector from './components/ProjectSelector';
import Dashboard from './pages/Dashboard';
import Issues from './pages/Issues';
import Settings from './pages/Settings';
import { fetchProjects, checkConnection } from './services/api';

function AppContent() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const location = useLocation();

  // Check SonarQube connection + load projects on mount
  useEffect(() => {
    const init = async () => {
      try {
        const status = await checkConnection();
        setConnected(status.connected);
      } catch {
        setConnected(false);
      }

      setProjectsLoading(true);
      try {
        const list = await fetchProjects();
        setProjects(list);
      } catch {
        // SonarQube not reachable — no projects
      } finally {
        setProjectsLoading(false);
      }
    };
    init();
  }, []);

  const handleManualKey = (key) => {
    const synthetic = { key, name: key };
    setSelectedProject(synthetic);
  };

  const pageTitle = {
    '/': 'Dashboard',
    '/issues': 'Issues',
    '/settings': 'Settings',
  }[location.pathname] || 'Dashboard';

  return (
    <div className="flex min-h-screen">
      <Sidebar
        connected={connected}
        projectName={selectedProject?.name || selectedProject?.key}
      />

      {/* Main content */}
      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-navy-900/80 backdrop-blur-md border-b border-slate-700/50 px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-lg font-bold text-white">{pageTitle}</h1>
            </div>

            {/* Project selector — shown on Dashboard and Issues pages */}
            {location.pathname !== '/settings' && (
              <ProjectSelector
                projects={projects}
                selected={selectedProject}
                onSelect={setSelectedProject}
                onManualSubmit={handleManualKey}
                loading={projectsLoading}
              />
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-8 py-7">
          <Routes>
            <Route
              path="/"
              element={
                <Dashboard
                  projectKey={selectedProject?.key}
                  projectName={selectedProject?.name}
                />
              }
            />
            <Route
              path="/issues"
              element={<Issues projectKey={selectedProject?.key} />}
            />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="px-8 py-4 border-t border-slate-700/30 text-xs text-slate-600 flex items-center justify-between">
          <span>Code Quality Analyzer © {new Date().getFullYear()}</span>
          <span>Powered by SonarQube REST API</span>
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
