import React, { useState, useEffect } from 'react';
import Icon from '../components/common/Icon';
import { getUserSession } from '../services/sessionManager';

function Settings() {
  const [demoMode, setDemoMode] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    biometric: false,
    autoLogout: true,
    darkMode: false
  });

  const session = getUserSession();
  const user = session?.user;

  useEffect(() => {
    const savedDemoMode = localStorage.getItem('demoMode') === 'true';
    setDemoMode(savedDemoMode);
  }, []);

  const toggleDemoMode = () => {
    const newValue = !demoMode;
    setDemoMode(newValue);
    localStorage.setItem('demoMode', newValue.toString());
    
    if (newValue) {
      alert('🎭 DEMO MODE ENABLED\n\nAll features will work with simulated data for quick demonstrations.\n\n✓ Instant responses\n✓ Pre-loaded scenarios\n✓ Perfect for presentations');
    } else {
      alert('✅ LIVE MODE ENABLED\n\nUsing real database and actual processing.');
    }
  };

  const toggleSetting = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
        System Settings
      </h1>
      <p style={{ color: '#6b7280', marginBottom: '32px' }}>
        Configure your RoleWatch experience
      </p>

      {/* Demo Mode Toggle */}
      {user?.role === 'admin' && (
        <div style={{
          background: demoMode ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'white',
          border: '3px solid ' + (demoMode ? '#667eea' : '#e5e7eb'),
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '24px',
          color: demoMode ? 'white' : 'inherit'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <Icon name="dashboard" size={32} style={{ color: demoMode ? 'white' : '#667eea' }} />
                <h3 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>
                  Demo Mode
                </h3>
              </div>
              <p style={{ fontSize: '15px', opacity: demoMode ? 0.9 : 1, marginBottom: '16px' }}>
                {demoMode 
                  ? '🎭 Demo mode is ACTIVE - Perfect for presentations and hackathon demos'
                  : 'Enable demo mode for quick demonstrations with simulated data'}
              </p>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '12px',
                fontSize: '13px',
                opacity: demoMode ? 0.9 : 0.7
              }}>
                <div>✓ Instant responses</div>
                <div>✓ No waiting times</div>
                <div>✓ Pre-configured scenarios</div>
                <div>✓ All features work</div>
              </div>
            </div>
            
            <button
              onClick={toggleDemoMode}
              style={{
                padding: '16px 32px',
                background: demoMode ? 'white' : '#667eea',
                color: demoMode ? '#667eea' : 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {demoMode ? 'Switch to Live' : 'Enable Demo'}
            </button>
          </div>
        </div>
      )}

      {/* General Settings */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '32px', border: '1px solid #e5e7eb' }}>
        <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px' }}>
          General Settings
        </h3>

        <div style={{ display: 'grid', gap: '20px' }}>
          {Object.entries({
            notifications: { label: 'Push Notifications', desc: 'Receive alerts for permission changes' },
            biometric: { label: 'Biometric Login', desc: 'Use face or fingerprint to login' },
            autoLogout: { label: 'Auto Logout', desc: 'Automatically logout after 30 minutes of inactivity' },
            darkMode: { label: 'Dark Mode', desc: 'Switch to dark theme (coming soon)' }
          }).map(([key, { label, desc }]) => (
            <div
              key={key}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px',
                background: '#f8fafc',
                borderRadius: '12px'
              }}
            >
              <div>
                <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '4px' }}>
                  {label}
                </div>
                <div style={{ fontSize: '13px', color: '#6b7280' }}>
                  {desc}
                </div>
              </div>
              
              <button
                onClick={() => toggleSetting(key)}
                style={{
                  width: '56px',
                  height: '32px',
                  background: settings[key] ? '#10b981' : '#e5e7eb',
                  borderRadius: '16px',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background 0.3s'
                }}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  background: 'white',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: '4px',
                  left: settings[key] ? '28px' : '4px',
                  transition: 'left 0.3s'
                }} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Account Info */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '32px',
        border: '1px solid #e5e7eb',
        marginTop: '24px'
      }}>
        <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px' }}>
          Account Information
        </h3>
        
        <div style={{ display: 'grid', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
            <span style={{ color: '#6b7280' }}>Name:</span>
            <span style={{ fontWeight: '600' }}>{user?.firstName} {user?.lastName}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
            <span style={{ color: '#6b7280' }}>Email:</span>
            <span style={{ fontWeight: '600' }}>{user?.email}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
            <span style={{ color: '#6b7280' }}>Role:</span>
            <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>{user?.role}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
            <span style={{ color: '#6b7280' }}>Industry:</span>
            <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>{user?.industry}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
            <span style={{ color: '#6b7280' }}>Department:</span>
            <span style={{ fontWeight: '600' }}>{user?.department}</span>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div style={{
        background: '#f0f9ff',
        borderRadius: '16px',
        padding: '24px',
        border: '2px solid #bfdbfe',
        marginTop: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <Icon name="shield" size={24} style={{ color: '#1e40af' }} />
          <h4 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: '#1e40af' }}>
            System Information
          </h4>
        </div>
        <div style={{ color: '#1e40af', fontSize: '14px', lineHeight: '1.8' }}>
          <div><strong>Version:</strong> RoleWatch India v3.0</div>
          <div><strong>Build:</strong> Production Ready</div>
          <div><strong>Status:</strong> All Systems Operational</div>
          <div><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
