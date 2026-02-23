import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getUserSession } from '../services/sessionManager';
import { connectWebSocket } from '../services/websocket';

function PermissionRequests() {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [reviewingId, setReviewingId] = useState(null);
  const [notification, setNotification] = useState(null);

  const session = getUserSession();

  useEffect(() => {
    if (session?.user?.role !== 'admin') {
      window.location.href = '/dashboard';
      return;
    }

    loadRequests();

    // Connect WebSocket for real-time notifications
    const socket = connectWebSocket(session.user.id);
    
    if (socket) {
      // Listen for new permission requests
      socket.on(`${session.user.industry}:new_permission_request`, (data) => {
        console.log('🔔 NEW PERMISSION REQUEST:', data);
        
        // Show notification
        setNotification({
          userName: data.userName,
          resourceName: data.resourceName,
          timestamp: new Date().toISOString()
        });

        // Play sound
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ldvyxnMpBSl+zPLaizsIGGS57OihUQwKTKXh8bllHAU2jdXzzn0vBSF1xe/glEILElyx6OyrWBUIQ5zd8sFuJAUuhM/z1YU2Bhxqvu7mnEoPDlOq5O+zYBoGPJPY88p2KwUme8rx3I4+CRZiturqpVINCkii3/K8aB8FM4nU8tGAMQYfcsLu45ZFDBFYr+ftrVoXCECY3PLEcSYELIHO8diJOQcZaLvt559NEAxPqOPxt2IdBjiP1/PMeS0GI3fH8N2RQAoUXrTp66hVFApGnuDyvmwhBTGH0fPTgjMGHm7A7eSZSQ0PVqzn77BdGAg+ldvyxnMpBSl+zPDaizsIGGS57OihUQwKTKXh8bllHAU2jdXzzn0vBSF1xe/glEILElyx6OyrWRUIQ5zd8sFuJAUuhM/z1YU2Bhxqvu7mnEoPDlOq5O+zYBoGPJPY88p2KwUme8rx3I4+CRZiturqpVINCkii3/K8aB8FM4nU8tGAMQYfcsLu45ZFDBFYr+ftrVoXCECY3PLEcSYELIHO8diJOQcZaLvt559NEAxPqOPxt2IdBjiP1/PMeS0GI3fH8N2RQAoUXrTp66hVFApGnuDyvmwhBTGH0fPTgjMGHm7A7eSZSQ0PVqzn77BdGAg+ldvyxnMpBSl+zPDaizsIGGS57OihUQwKTKXh8bllHAU2jdXzzn0vBSF1xe/glEILElyx6OyrWRUIQ5zd8sFuJAUuhM/z1YU2Bhxqvu7mnEoPDlOq5O+zYBoGPJPY88p2KwUme8rx3I4+CRZiturqpVINCkii3/K8aB8FM4nU8tGAMQYfcsLu45ZFDBFYr+ftrVoXCECY3PLEcSYELIHO8diJOQcZaLvt559NEAxPqOPxt2IdBjiP1/PMeS0GI3fH8N2RQAoUXrTp66hVFApGnuDyvmwhBTGH0fPTgjMGHm7A7eSZSQ0PVqzn77BdGAg+ldvyxnMpBSl+zPDaizsIGGS57OihUQwKTKXh8bllHAU2jdXzzn0vBSF1xe/glEILElyx6OyrWRUIQ5zd8sFuJAUuhM/z1YU2Bhxqvu7mnEoPDlOq5O+zYBoGPJPY88p2KwUme8rx3I4+CRZiturqpVINCkii3/K8aB8FM4nU8tGAMQYfcsLu45ZFDBFYr+ftrVoXCECY3PLEcSYELIHO8diJOQcZaLvt559NEAxPqOPxt2IdBjiP1/PMeS0GI3fH8N2RQAoUXrTp66hVFApGnuDyvmwhBTGH0fPTgjMGHm7A7eSZSQ0PVqzn77BdGAg+ldvyxnMpBSl+zPDaizsIGGS57OihUQwKTKXh8bllHAU2jdXzzn0vBSF1xe/glEILElyx6OyrWRUIQ5zd8sFuJAUuhM/z1YU2Bhxqvu7mnEoPDlOq5O+zYBoGPJPY88p2KwUme8rx3I4+CRZiturqpVINCkii3/K8aB8FM4nU8tGAMQYfcsLu45ZFDBFYr+ftrVoXCECY3PLEcSYELIHO8diJOQcZaLvt559NEAxPqOPxt2IdBjiP1/PMeS0GI3fH8N2RQAoUXrTp66hVFApGnuDyvmwhBTGH0fPTgjMGHm7A7eSZSQ0PVqzn77BdGAg=');
        audio.play().catch(e => console.log('Audio play failed:', e));

        // Auto-hide notification after 5 seconds
        setTimeout(() => setNotification(null), 5000);

        // Reload requests to show the new one
        loadRequests();

        // Show browser notification if permission granted
        if (Notification.permission === 'granted') {
          new Notification('New Permission Request', {
            body: `${data.userName} requested ${data.resourceName}`,
            icon: '/logo192.png',
            badge: '/logo192.png'
          });
        }
      });
    }

    // Request browser notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      if (socket) {
        socket.off(`${session.user.industry}:new_permission_request`);
      }
    };
  }, [session]);

  const loadRequests = async () => {
    try {
      const token = session?.token;
      
      const [pendingRes, allRes] = await Promise.all([
        axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/permission-requests/pending`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/permission-requests/all`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
      ]);

      setPendingRequests(pendingRes.data.data || []);
      setAllRequests(allRes.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const handleReview = async (requestId, action) => {
    const notes = action === 'reject' 
      ? prompt('Reason for rejection:')
      : prompt('Add notes (optional):') || '';

    if (action === 'reject' && !notes) {
      return;
    }

    setReviewingId(requestId);

    try {
      const token = session?.token;
      
      await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/permission-requests/review/${requestId}`,
        { action, notes },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`✅ Request ${action}d successfully!${action === 'approve' ? '\n\nThe user has been notified and can now access the resource.' : ''}`);
      loadRequests();
    } catch (error) {
      alert('Error processing request');
    } finally {
      setReviewingId(null);
    }
  };

  if (loading) {
    return <div style={{ padding: '32px' }}>Loading...</div>;
  }

  const displayRequests = activeTab === 'pending' ? pendingRequests : allRequests;

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Real-Time Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          color: 'white',
          padding: '24px',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
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
              🔔
            </div>
            <strong style={{ fontSize: '18px' }}>NEW REQUEST!</strong>
          </div>
          <div style={{ fontSize: '14px', marginBottom: '4px' }}>
            <strong>{notification.userName}</strong> requested permission
          </div>
          <div style={{ fontSize: '13px', opacity: 0.9 }}>
            Resource: {notification.resourceName}
          </div>
        </div>
      )}

      <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
        Permission Requests
        {pendingRequests.length > 0 && (
          <span style={{
            marginLeft: '16px',
            padding: '8px 16px',
            background: '#ef4444',
            color: 'white',
            borderRadius: '12px',
            fontSize: '14px',
            animation: 'pulse 2s infinite'
          }}>
            {pendingRequests.length} Pending
          </span>
        )}
      </h1>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('pending')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'pending' ? '#667eea' : 'white',
            color: activeTab === 'pending' ? 'white' : '#6b7280',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Pending ({pendingRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('all')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'all' ? '#667eea' : 'white',
            color: activeTab === 'all' ? 'white' : '#6b7280',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          All ({allRequests.length})
        </button>
        <button
          onClick={loadRequests}
          style={{
            marginLeft: 'auto',
            padding: '12px 24px',
            background: '#f8fafc',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          🔄 Refresh
        </button>
      </div>

      <div style={{ display: 'grid', gap: '16px' }}>
        {displayRequests.length === 0 ? (
          <div style={{ 
            background: 'white', 
            padding: '60px', 
            borderRadius: '12px', 
            textAlign: 'center',
            border: '2px dashed #e5e7eb'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#6b7280' }}>
              No {activeTab} requests
            </div>
          </div>
        ) : (
          displayRequests.map(request => (
            <div
              key={request.id}
              style={{
                background: 'white',
                border: `3px solid ${
                  request.status === 'pending' ? '#f59e0b' :
                  request.status === 'approved' ? '#10b981' : '#ef4444'
                }`,
                borderRadius: '12px',
                padding: '24px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '18px',
                      fontWeight: '700'
                    }}>
                      {request.user?.firstName?.charAt(0)}{request.user?.lastName?.charAt(0)}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>
                        {request.user?.firstName} {request.user?.lastName}
                      </h3>
                      <div style={{ fontSize: '13px', color: '#6b7280' }}>
                        {request.user?.email} • {request.user?.role}
                      </div>
                    </div>
                    <span style={{
                      padding: '6px 12px',
                      background: request.status === 'pending' ? '#fef3c7' :
                                  request.status === 'approved' ? '#d1fae5' : '#fee2e2',
                      color: request.status === 'pending' ? '#92400e' :
                             request.status === 'approved' ? '#065f46' : '#991b1b',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '700'
                    }}>
                      {request.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '12px' }}>
                    <div style={{ fontWeight: '700', marginBottom: '8px' }}>
                      📦 {request.resourceName}
                    </div>
                    <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>
                      🔑 Permission: <code style={{ background: '#e2e8f0', padding: '2px 8px', borderRadius: '4px' }}>{request.requestedPermission}</code>
                    </div>
                    <div style={{ fontSize: '14px', padding: '12px', background: 'white', borderRadius: '6px' }}>
                      <strong>Reason:</strong> "{request.reason}"
                    </div>
                  </div>

                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                    📅 {new Date(request.createdAt).toLocaleString()}
                  </div>
                </div>

                {request.status === 'pending' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button
                      onClick={() => handleReview(request.id, 'approve')}
                      disabled={reviewingId === request.id}
                      style={{
                        padding: '12px 24px',
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '700',
                        minWidth: '140px'
                      }}
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => handleReview(request.id, 'reject')}
                      disabled={reviewingId === request.id}
                      style={{
                        padding: '12px 24px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '700',
                        minWidth: '140px'
                      }}
                    >
                      ✗ Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
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

export default PermissionRequests;
