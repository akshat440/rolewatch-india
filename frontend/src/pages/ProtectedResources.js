import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Icon from '../components/common/Icon';
import RequestPermissionButton from '../components/RequestPermissionButton';
import { getUserSession } from '../services/sessionManager';

function ProtectedResources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accessingResource, setAccessingResource] = useState(null);
  const navigate = useNavigate();

  const session = getUserSession();

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      const token = session?.token;
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/access/resources`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setResources(response.data.resources);
      setLoading(false);
    } catch (error) {
      console.error('Error loading resources:', error);
      setLoading(false);
    }
  };

  const handleAccessResource = async (resourceKey) => {
    setAccessingResource(resourceKey);

    try {
      const token = session?.token;
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/access/check`,
        { resource: resourceKey },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.canAccess) {
        navigate(`/resource/${resourceKey}`);
      } else {
        alert(`❌ ACCESS DENIED\n\n${response.data.reason}\n\nYou need the "${response.data.resource.requiredPermission}" permission.\n\nClick "Request Permission" button to ask administrator.`);
      }
    } catch (error) {
      alert('Error checking access');
    } finally {
      setAccessingResource(null);
    }
  };

  if (loading) {
    return <div style={{ padding: '32px' }}>Loading resources...</div>;
  }

  const grantedResources = resources.filter(r => r.canAccess);
  const deniedResources = resources.filter(r => !r.canAccess);

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
        Protected Resources
      </h1>
      <p style={{ color: '#6b7280', marginBottom: '32px' }}>
        Click on resources to access them. Click "Request Permission" if you need access to denied resources.
      </p>

      {/* Granted Access */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ 
          fontSize: '20px', 
          fontWeight: '700', 
          marginBottom: '16px',
          color: '#10b981'
        }}>
          ✅ Access Granted ({grantedResources.length})
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '16px'
        }}>
          {grantedResources.map(resource => (
            <div
              key={resource.key}
              onClick={() => handleAccessResource(resource.key)}
              style={{
                background: 'white',
                border: '3px solid #10b981',
                borderRadius: '12px',
                padding: '24px',
                cursor: 'pointer',
                transition: 'all 0.3s',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {accessingResource === resource.key && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#10b981'
                }}>
                  Checking access...
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: '#d1fae5',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Icon name={resource.icon} size={24} style={{ color: '#10b981' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: '700',
                    marginBottom: '8px',
                    color: '#1a2332'
                  }}>
                    {resource.name}
                  </h3>
                  <p style={{ 
                    fontSize: '13px',
                    color: '#6b7280',
                    marginBottom: '12px',
                    lineHeight: '1.5'
                  }}>
                    {resource.description}
                  </p>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '12px',
                    color: '#10b981',
                    fontWeight: '600'
                  }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      background: '#10b981',
                      borderRadius: '50%'
                    }}></div>
                    ACCESS GRANTED - CLICK TO OPEN
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Denied Access */}
      <div>
        <h2 style={{ 
          fontSize: '20px', 
          fontWeight: '700', 
          marginBottom: '16px',
          color: '#ef4444'
        }}>
          🔒 Access Denied ({deniedResources.length})
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '16px'
        }}>
          {deniedResources.map(resource => (
            <div
              key={resource.key}
              style={{
                background: '#fee2e2',
                border: '3px solid #ef4444',
                borderRadius: '12px',
                padding: '24px',
                opacity: 0.9
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: '#fee2e2',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Icon name="lock" size={24} style={{ color: '#ef4444' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: '700',
                    marginBottom: '8px',
                    color: '#991b1b'
                  }}>
                    {resource.name}
                  </h3>
                  <p style={{ 
                    fontSize: '13px',
                    color: '#991b1b',
                    marginBottom: '12px',
                    lineHeight: '1.5'
                  }}>
                    {resource.description}
                  </p>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '12px',
                    color: '#ef4444',
                    fontWeight: '600',
                    marginBottom: '12px'
                  }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      background: '#ef4444',
                      borderRadius: '50%'
                    }}></div>
                    PERMISSION REQUIRED: {resource.requiredPermission}
                  </div>
                  <RequestPermissionButton 
                    permission={resource.requiredPermission}
                    resourceName={resource.name}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProtectedResources;
