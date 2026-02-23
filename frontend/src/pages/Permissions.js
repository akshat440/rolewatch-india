import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Icon from '../components/common/Icon';
import { getIndustryConfig } from '../config/industries';
import { getUserSession, updatePermissions as updateSessionPermissions } from '../services/sessionManager';
import { connectWebSocket, onPermissionsUpdated, offPermissionsUpdated } from '../services/websocket';

function Permissions() {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState({ granted: [], all: [] });
  const [loading, setLoading] = useState(true);
  const [updateNotification, setUpdateNotification] = useState(null);

  useEffect(() => {
    loadPermissionsFromServer();
  }, []);

  const loadPermissionsFromServer = async () => {
    const session = getUserSession();
    
    if (!session) {
      window.location.href = '/';
      return;
    }

    try {
      // Fetch fresh permissions from server
      const token = session.token;
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/users/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const freshUser = response.data.data.user;
      const freshPermissions = {
        granted: freshUser.permissions || [],
        all: session.permissions.all || []
      };

      setUser(freshUser);
      setPermissions(freshPermissions);
      
      // Update session storage with fresh data
      updateSessionPermissions(freshPermissions);
      
      setLoading(false);

      // Connect WebSocket
      connectWebSocket(freshUser.id);

      // Listen for real-time updates
      onPermissionsUpdated((data) => {
        console.log('🔴 REAL-TIME UPDATE: Permissions changed!', data);
        
        // Update state immediately
        setPermissions(prevPerms => ({
          ...prevPerms,
          granted: data.permissions
        }));

        // Update session storage
        updateSessionPermissions({
          granted: data.permissions,
          all: permissions.all
        });

        // Show notification
        setUpdateNotification({
          message: data.message,
          updatedBy: data.updatedBy,
          timestamp: data.timestamp
        });

        // Auto-hide notification
        setTimeout(() => setUpdateNotification(null), 5000);
      });

    } catch (error) {
      console.error('Error loading permissions:', error);
      setLoading(false);
    }

    return () => {
      offPermissionsUpdated();
    };
  };

  if (loading || !user) {
    return <div style={{ padding: '32px' }}>Loading permissions...</div>;
  }

  const industryConfig = getIndustryConfig(user.industry);
  const grantedPerms = permissions.granted || [];
  const allPerms = permissions.all || [];
  const deniedPerms = allPerms.filter(p => !grantedPerms.includes(p));

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Real-Time Update Notification */}
      {updateNotification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#10b981',
          color: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)',
          zIndex: 9999,
          maxWidth: '400px',
          animation: 'slideInRight 0.3s ease-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'rgba(255,255,255,0.3)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>
              ⚡
            </div>
            <strong style={{ fontSize: '18px' }}>PERMISSIONS UPDATED!</strong>
          </div>
          <div style={{ fontSize: '14px', marginBottom: '4px' }}>
            {updateNotification.message}
          </div>
          <div style={{ fontSize: '12px', opacity: 0.9 }}>
            Updated by: {updateNotification.updatedBy}
          </div>
        </div>
      )}

      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
          My Permissions
          <span style={{
            marginLeft: '16px',
            padding: '6px 16px',
            background: '#10b981',
            color: 'white',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '600',
            animation: 'pulse 2s infinite'
          }}>
            ⚡ REAL-TIME
          </span>
        </h1>
        <p style={{ color: '#6b7280' }}>
          Your permissions for {industryConfig.name} - Updates automatically
        </p>
      </div>

      {/* User Info */}
      <div style={{ 
        background: 'white', 
        padding: '24px', 
        borderRadius: '16px',
        marginBottom: '32px',
        border: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>
            {user.firstName} {user.lastName}
          </h2>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>
            {user.role} • {user.department} • {user.city}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '32px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '36px', fontWeight: '800', color: '#10b981' }}>
              {grantedPerms.length}
            </div>
            <div style={{ fontSize: '13px', color: '#6b7280' }}>Granted</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '36px', fontWeight: '800', color: '#ef4444' }}>
              {deniedPerms.length}
            </div>
            <div style={{ fontSize: '13px', color: '#6b7280' }}>Denied</div>
          </div>
        </div>
      </div>

      {/* Granted */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px', color: '#10b981' }}>
          ✅ Granted Permissions ({grantedPerms.length})
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px'
        }}>
          {grantedPerms.map(perm => (
            <div key={perm} style={{
              background: 'white',
              border: '2px solid #10b981',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <div style={{ fontWeight: '600', color: '#1a2332', marginBottom: '4px', fontSize: '15px' }}>
                {perm.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </div>
              <div style={{ fontSize: '12px', color: '#10b981', fontWeight: '600' }}>
                ✓ GRANTED
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Denied */}
      <div>
        <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px', color: '#ef4444' }}>
          🔒 Denied Permissions ({deniedPerms.length})
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px'
        }}>
          {deniedPerms.map(perm => (
            <div key={perm} style={{
              background: '#fee2e2',
              border: '2px solid #ef4444',
              borderRadius: '12px',
              padding: '20px',
              opacity: 0.7
            }}>
              <div style={{ fontWeight: '600', color: '#991b1b', marginBottom: '4px', fontSize: '15px' }}>
                {perm.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </div>
              <div style={{ fontSize: '12px', color: '#ef4444', fontWeight: '600' }}>
                ✗ DENIED
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(400px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}

export default Permissions;
