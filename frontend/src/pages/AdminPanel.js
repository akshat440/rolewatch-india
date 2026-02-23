import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { getUserSession } from '../services/sessionManager';

function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [error, setError] = useState('');

  const session = getUserSession();
  const currentUser = session?.user;

  const loadUsers = useCallback(async () => {
    try {
      const token = session?.token;
      
      if (!token) {
        setError('No authentication token');
        setLoading(false);
        return;
      }
      
      console.log('Loading users...');
      
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/admin/users`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('Users loaded:', response.data.data.length);
      setUsers(response.data.data || []);
      setError('');
      setLoading(false);
    } catch (error) {
      console.error('Error loading users:', error.response || error);
      
      if (error.response?.status === 429) {
        setError('Too many requests. Please wait a moment and refresh the page.');
      } else if (error.response?.status === 403) {
        setError('Access denied. Admin privileges required.');
      } else {
        setError(error.response?.data?.message || 'Error loading users');
      }
      
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      window.location.href = '/dashboard';
      return;
    }
    loadUsers();
  }, [currentUser, loadUsers]);

  const updatePermissions = async (userId, permissions) => {
    try {
      const token = session?.token;
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/admin/update-permissions`,
        { userId, permissions },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('Permissions updated:', response.data);
      
      setUsers(users.map(u => 
        u.id === userId ? { ...u, permissions } : u
      ));
      
      alert('✅ Permissions updated successfully! Changes are live.');
      setEditingUser(null);
      setSelectedPermissions([]);
    } catch (error) {
      console.error('Error updating permissions:', error.response || error);
      alert('❌ Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const toggleUserStatus = async (userId) => {
    try {
      const token = session?.token;
      
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/admin/toggle-user-status`,
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      loadUsers();
      alert('✅ User status updated!');
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error updating status');
    }
  };

  const availablePermissions = {
    bank: ['view_all', 'manage_users', 'approve_transactions', 'view_reports', 'system_settings', 'manage_permissions'],
    hospital: ['view_all', 'manage_staff', 'system_settings', 'all_records', 'view_patients', 'update_records'],
    police: ['view_all', 'manage_officers', 'system_access', 'classified_cases', 'view_cases', 'update_cases'],
    government: ['view_all', 'manage_users', 'system_settings', 'classified_docs', 'view_files', 'approve_requests'],
    college: ['view_all', 'manage_faculty', 'system_settings', 'all_records', 'view_students', 'enter_grades']
  };

  const industryPerms = availablePermissions[currentUser?.industry] || [];

  if (loading) {
    return (
      <div style={{ padding: '32px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading admin panel...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '32px' }}>
        <div style={{ 
          background: '#fee2e2', 
          color: '#991b1b', 
          padding: '20px', 
          borderRadius: '12px',
          marginBottom: '20px',
          border: '2px solid #ef4444'
        }}>
          <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
            ⚠️ Error Loading Admin Panel
          </div>
          <div style={{ marginBottom: '16px' }}>{error}</div>
          <button 
            onClick={() => {
              setError('');
              setLoading(true);
              setTimeout(loadUsers, 1000);
            }}
            style={{
              padding: '10px 20px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
          Admin Panel - {currentUser?.industry?.toUpperCase()}
        </h1>
        <p style={{ color: '#6b7280' }}>
          Real-time permission management • {users.length} users
        </p>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f8fafc' }}>
            <tr>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: '#6b7280' }}>USER</th>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: '#6b7280' }}>EMAIL</th>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: '#6b7280' }}>ROLE</th>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: '#6b7280' }}>PERMISSIONS</th>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: '#6b7280' }}>STATUS</th>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: '#6b7280' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} style={{ borderBottom: '1px solid #f1f3f5' }}>
                <td style={{ padding: '16px' }}>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                    {user.firstName} {user.lastName}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    {user.department}
                  </div>
                </td>
                <td style={{ padding: '16px', fontSize: '14px', color: '#6b7280' }}>{user.email}</td>
                <td style={{ padding: '16px' }}>
                  <span style={{
                    padding: '4px 12px',
                    background: user.role === 'admin' ? '#dbeafe' : '#f0fdf4',
                    color: user.role === 'admin' ? '#1e40af' : '#166534',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {user.role}
                  </span>
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>
                    {user.permissions?.length || 0} permissions
                  </div>
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      background: user.isActive ? '#10b981' : '#ef4444',
                      borderRadius: '50%'
                    }}></div>
                    <span style={{ fontSize: '13px', fontWeight: '500' }}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        setEditingUser(user);
                        setSelectedPermissions(user.permissions || []);
                      }}
                      style={{
                        padding: '8px 16px',
                        background: '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '600'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleUserStatus(user.id)}
                      style={{
                        padding: '8px 16px',
                        background: user.isActive ? '#ef4444' : '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '600'
                      }}
                    >
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '32px',
            borderRadius: '16px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>
              Edit Permissions - {editingUser.firstName} {editingUser.lastName}
            </h3>
            
            <div style={{ marginBottom: '24px' }}>
              {industryPerms.map(perm => (
                <div key={perm} style={{ 
                  padding: '12px',
                  marginBottom: '8px',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(perm)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPermissions([...selectedPermissions, perm]);
                      } else {
                        setSelectedPermissions(selectedPermissions.filter(p => p !== perm));
                      }
                    }}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                  <label style={{ fontWeight: '500', cursor: 'pointer', flex: 1 }}>
                    {perm.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </label>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => updatePermissions(editingUser.id, selectedPermissions)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setEditingUser(null);
                  setSelectedPermissions([]);
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#f1f5f9',
                  color: '#475569',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
