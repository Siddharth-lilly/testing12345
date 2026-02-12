// src/App.jsx - UPDATED WITH NEW ROUTES
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProjectsPage from './pages/ProjectsPage';
import WorkspaceView from './pages/WorkspaceView';
import AuthPage from './pages/AuthPage';
import './styles/globals.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing page - Projects list */}
        <Route path="/" element={<ProjectsPage />} />
        
        {/* Workspace with project ID */}
        <Route path="/workspace/:projectId" element={<WorkspaceView />} />
        
        {/* Auth page (optional) */}
        <Route path="/auth" element={<AuthPage />} />
        
        {/* Redirect old dashboard route */}
        <Route path="/dashboard" element={<Navigate to="/" replace />} />
        
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;