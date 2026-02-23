import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../components/common/Icon';
import { getIndustryConfig } from '../config/industries';
import { getUserSession, clearSession } from '../services/sessionManager';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [tabId, setTabId] = useState('');
  const [stats] = useState({
    totalUsers: 650,
    activeUsers: 324,
    totalRoles: 45,
    alertsToday: 12
  });

  useEffect(() => {
    const session = getUserSession();
    
    if (session) {
      setUser(session.user);
      setTabId(session.tabId);
      console.log('Dashboard loaded for tab:', session.tabId);
    } else {
      navigate('/');
    }
  }, [navigate]);

  const handleLogout = () => {
    clearSession();
    navigate('/');
  };

  if (!user) {
    return <div style={{ padding: '32px' }}>Loading...</div>;
  }

  const industryConfig = getIndustryConfig(user.industry);

  const menuItems = [
  { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  ...(user.role === 'admin' ? [
    { path: '/live-monitoring', icon: 'alert', label: '🔴 Live Monitoring' },
    { path: '/admin', icon: 'shield', label: 'Admin Panel' },
    { path: '/permission-requests', icon: 'alert', label: 'Permission Requests' },
    { path: '/ai-detection', icon: 'alert', label: 'AI Detection' }
  ] : []),
  { path: '/biometric', icon: 'user', label: 'Biometric Setup' },
  { path: '/resources', icon: 'lock', label: 'Protected Resources' },
  { path: '/permissions', icon: 'shield', label: 'My Permissions' },
  { path: '/users', icon: 'user', label: 'Users' },
  { path: '/audit', icon: 'chart', label: 'Audit Logs' },
  { path: '/blockchain', icon: 'lock', label: 'Blockchain' },
  { path: '/settings', icon: 'dashboard', label: 'Settings' }
];

  return (
    <div className="app-layout">
      <div className="sidebar">
        <div className="sidebar-header">
          <Icon name="shield" size={32} style={{ color: '#667eea' }} />
          <h2>RoleWatch</h2>
        </div>

        {/* Tab Identifier */}
        <div style={{
          padding: '12px 16px',
          background: '#f0f9ff',
          margin: '0 16px 16px 16px',
          borderRadius: '8px',
          fontSize: '11px',
          color: '#0369a1',
          fontFamily: 'monospace'
        }}>
          Tab: {tabId.substring(4, 12)}...
        </div>

        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <button
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <Icon name={item.icon} size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
            </div>
            <div className="user-info">
              <div className="user-name">{user.firstName} {user.lastName}</div>
              <div className="user-role">{user.role}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <Icon name="logout" size={18} />
            Logout
          </button>
        </div>
      </div>

      <div className="main-content">
        <div className="content-header">
          <div className="industry-badge" style={{ background: `${industryConfig.color}15`, color: industryConfig.color }}>
            <Icon name={industryConfig.icon} size={20} />
            {industryConfig.name}
          </div>
          <div className="location-badge">
            <Icon name="building" size={16} />
            {user.city}
          </div>
        </div>

        {location.pathname === '/dashboard' && (
          <>
            <h1 className="page-title">Dashboard</h1>
            
            <div className="stats-grid">
              <div className="stat-card">
                <Icon name="user" size={24} style={{ color: '#667eea' }} />
                <div>
                  <div className="stat-value">{stats.totalUsers}</div>
                  <div className="stat-label">Total Users</div>
                </div>
              </div>
              <div className="stat-card">
                <Icon name="dashboard" size={24} style={{ color: '#10b981' }} />
                <div>
                  <div className="stat-value">{stats.activeUsers}</div>
                  <div className="stat-label">Active Users</div>
                </div>
              </div>
              <div className="stat-card">
                <Icon name="shield" size={24} style={{ color: '#f59e0b' }} />
                <div>
                  <div className="stat-value">{stats.totalRoles}</div>
                  <div className="stat-label">Total Roles</div>
                </div>
              </div>
              <div className="stat-card">
                <Icon name="alert" size={24} style={{ color: '#ef4444' }} />
                <div>
                  <div className="stat-value">{stats.alertsToday}</div>
                  <div className="stat-label">Alerts Today</div>
                </div>
              </div>
            </div>

            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              marginTop: '24px'
            }}>
              <h3 style={{ marginBottom: '16px' }}>Your Account (This Tab)</h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>Name:</span>
                  <span style={{ fontWeight: '600' }}>{user.firstName} {user.lastName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>Email:</span>
                  <span style={{ fontWeight: '600' }}>{user.email}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>Role:</span>
                  <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>{user.role}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>Tab ID:</span>
                  <span style={{ fontWeight: '600', fontFamily: 'monospace', fontSize: '12px' }}>{tabId}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
