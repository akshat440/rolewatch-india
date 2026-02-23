import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import AuditLogs from './pages/AuditLogs';
import Permissions from './pages/Permissions';
import AIDetection from './pages/AIDetection';
import AdminPanel from './pages/AdminPanel';
import Blockchain from './pages/Blockchain';
import ProtectedResources from './pages/ProtectedResources';
import ResourceDetail from './pages/ResourceDetail';
import PermissionRequests from './pages/PermissionRequests';
import BiometricSetup from './pages/BiometricSetup';
import Settings from './pages/Settings';
import LiveMonitoring from './pages/LiveMonitoring';
import { getUserSession } from './services/sessionManager';
import './App.css';

function App() {
  const isAuthenticated = () => {
    const session = getUserSession();
    return session !== null && session.token !== null;
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route 
            path="/dashboard" 
            element={isAuthenticated() ? <Dashboard /> : <Navigate to="/" />} 
          />
          <Route 
            path="/live-monitoring" 
            element={isAuthenticated() ? <LiveMonitoring /> : <Navigate to="/" />} 
          />
          <Route 
            path="/admin" 
            element={isAuthenticated() ? <AdminPanel /> : <Navigate to="/" />} 
          />
          <Route 
            path="/permission-requests" 
            element={isAuthenticated() ? <PermissionRequests /> : <Navigate to="/" />} 
          />
          <Route 
            path="/permissions" 
            element={isAuthenticated() ? <Permissions /> : <Navigate to="/" />} 
          />
          <Route 
            path="/biometric" 
            element={isAuthenticated() ? <BiometricSetup /> : <Navigate to="/" />} 
          />
          <Route 
            path="/resources" 
            element={isAuthenticated() ? <ProtectedResources /> : <Navigate to="/" />} 
          />
          <Route 
            path="/resource/:resourceKey" 
            element={isAuthenticated() ? <ResourceDetail /> : <Navigate to="/" />} 
          />
          <Route 
            path="/users" 
            element={isAuthenticated() ? <Users /> : <Navigate to="/" />} 
          />
          <Route 
            path="/audit" 
            element={isAuthenticated() ? <AuditLogs /> : <Navigate to="/" />} 
          />
          <Route 
            path="/ai-detection" 
            element={isAuthenticated() ? <AIDetection /> : <Navigate to="/" />} 
          />
          <Route 
            path="/blockchain" 
            element={isAuthenticated() ? <Blockchain /> : <Navigate to="/" />} 
          />
          <Route 
            path="/settings" 
            element={isAuthenticated() ? <Settings /> : <Navigate to="/" />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
