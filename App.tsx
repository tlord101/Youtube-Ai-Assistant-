
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import History from './components/History';
import Assistant from './components/Assistant';
import { ProjectsProvider } from './contexts/ProjectsContext';

const App: React.FC = () => {
  return (
    <ProjectsProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/new" replace />} />
            <Route path="new" element={<Onboarding />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="history" element={<History />} />
            <Route path="assistant" element={<Assistant />} />
          </Route>
        </Routes>
      </HashRouter>
    </ProjectsProvider>
  );
};

export default App;
