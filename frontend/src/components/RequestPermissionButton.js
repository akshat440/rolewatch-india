import React, { useState } from 'react';
import axios from 'axios';
import { getUserSession } from '../services/sessionManager';

function RequestPermissionButton({ permission, resourceName }) {
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    console.log('🔵 Submitting permission request...');
    console.log('Permission:', permission);
    console.log('Resource:', resourceName);
    console.log('Reason:', reason);

    if (!reason.trim()) {
      alert('Please provide a reason for your request');
      return;
    }

    setSubmitting(true);

    try {
      const session = getUserSession();
      console.log('Session:', session ? 'Found' : 'Not found');
      console.log('Token:', session?.token ? 'Present' : 'Missing');

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/permission-requests/create`,
        {
          requestedPermission: permission,
          resourceName,
          reason
        },
        { 
          headers: { 
            Authorization: `Bearer ${session?.token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      console.log('✅ Request successful:', response.data);

      alert(`✅ Permission request sent successfully!\n\nYour request for "${resourceName}" has been sent to the administrator.\n\nYou will be notified when it is reviewed.`);
      setShowModal(false);
      setReason('');
    } catch (error) {
      console.error('❌ Error sending request:', error);
      console.error('Response:', error.response?.data);
      
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
      alert(`❌ Error sending permission request:\n\n${errorMsg}\n\nPlease try again or contact administrator.`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation(); // Prevent parent click events
          setShowModal(true);
        }}
        style={{
          padding: '10px 20px',
          background: '#f59e0b',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: '600',
          fontSize: '14px',
          marginTop: '12px',
          width: '100%'
        }}
      >
        📩 Request Permission
      </button>

      {showModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false);
            }
          }}
        >
          <div style={{
            background: 'white',
            padding: '32px',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px', color: '#1a2332' }}>
              Request Permission
            </h3>
            
            <div style={{
              background: '#f0f9ff',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '16px',
              border: '1px solid #bfdbfe'
            }}>
              <div style={{ fontSize: '14px', color: '#1e40af', marginBottom: '8px' }}>
                <strong>Resource:</strong> {resourceName}
              </div>
              <div style={{ fontSize: '14px', color: '#1e40af' }}>
                <strong>Permission needed:</strong> {permission}
              </div>
            </div>

            <label style={{ 
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Why do you need this permission?
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Example: I need to process customer transactions as part of my daily duties..."
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                resize: 'vertical',
                minHeight: '120px',
                marginBottom: '20px',
                fontFamily: 'inherit'
              }}
              autoFocus
            />

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleSubmit}
                disabled={submitting || !reason.trim()}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: submitting || !reason.trim() ? '#9ca3af' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: submitting || !reason.trim() ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '15px'
                }}
              >
                {submitting ? 'Sending...' : 'Send Request to Admin'}
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setReason('');
                }}
                disabled={submitting}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: '#f1f5f9',
                  color: '#475569',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '15px'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default RequestPermissionButton;
