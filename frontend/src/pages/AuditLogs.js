import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/audit/logs?page=1&limit=50`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLogs(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const getRiskColor = (score) => {
    if (score >= 70) return '#ef4444';
    if (score >= 40) return '#f59e0b';
    return '#10b981';
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '24px' }}>
        Audit Logs - {logs.length} Activities
      </h1>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f8fafc' }}>
              <tr>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#6b7280' }}>USER</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#6b7280' }}>ACTION</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#6b7280' }}>LOCATION</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#6b7280' }}>RISK</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#6b7280' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #f1f3f5' }}>
                  <td style={{ padding: '16px' }}>
                    <code style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px' }}>
                      {log.user_id}
                    </code>
                  </td>
                  <td style={{ padding: '16px', fontFamily: 'monospace', fontSize: '13px' }}>{log.action}</td>
                  <td style={{ padding: '16px' }}>{log.location}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      color: getRiskColor(log.risk_score),
                      fontWeight: '600'
                    }}>
                      {log.risk_score}/100
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: log.status === 'success' ? '#d1fae5' : '#fee2e2',
                      color: log.status === 'success' ? '#065f46' : '#991b1b'
                    }}>
                      {log.status}
                    </span>
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

export default AuditLogs;