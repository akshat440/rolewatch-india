import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Icon from '../components/common/Icon';
import './Users.css';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/users?page=1&limit=50`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const getIndustryColor = (userId) => {
    if (userId?.startsWith('BANK')) return '#2563eb';
    if (userId?.startsWith('MED')) return '#dc2626';
    if (userId?.startsWith('POL')) return '#0891b2';
    if (userId?.startsWith('GOV')) return '#7c3aed';
    if (userId?.startsWith('EDU')) return '#ea580c';
    return '#6b7280';
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '24px' }}>
        User Management - {users.length} Indian Users
      </h1>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f8fafc' }}>
              <tr>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#6b7280' }}>USER ID</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#6b7280' }}>NAME</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#6b7280' }}>EMAIL</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#6b7280' }}>DEPARTMENT</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#6b7280' }}>LOCATION</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.user_id} style={{ borderBottom: '1px solid #f1f3f5' }}>
                  <td style={{ padding: '16px' }}>
                    <code style={{ 
                      background: '#f1f5f9', 
                      padding: '4px 8px', 
                      borderRadius: '4px',
                      color: getIndustryColor(user.user_id),
                      fontWeight: '600'
                    }}>
                      {user.user_id}
                    </code>
                  </td>
                  <td style={{ padding: '16px', fontWeight: '600' }}>
                    {user.first_name} {user.last_name}
                  </td>
                  <td style={{ padding: '16px', color: '#6b7280' }}>{user.email}</td>
                  <td style={{ padding: '16px' }}>{user.department}</td>
                  <td style={{ padding: '16px' }}>
                    {user.branch_location || user.hospital_location || 
                     user.station_location || user.office_location || 
                     user.campus_location || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Users;