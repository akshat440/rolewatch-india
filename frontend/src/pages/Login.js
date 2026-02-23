import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Icon from '../components/common/Icon';
import { INDUSTRIES } from '../config/industries';
import { setUserSession, clearSession } from '../services/sessionManager';
import './Login.css';

function Login() {
  const [loginMode, setLoginMode] = useState('dropdown');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualPassword, setManualPassword] = useState('');
  const [password, setPassword] = useState('Demo@2024');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showBiometric, setShowBiometric] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    clearSession();
  }, []);

  useEffect(() => {
    if (selectedIndustry && loginMode === 'dropdown') {
      loadUsersForIndustry(selectedIndustry);
    }
  }, [selectedIndustry, loginMode]);

  const loadUsersForIndustry = async (industry) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/auth/users-by-industry/${industry}`
      );
      setAvailableUsers(response.data.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let loginData;
      
      if (loginMode === 'manual') {
        loginData = { email: manualEmail, password: manualPassword };
      } else {
        if (!selectedIndustry || !selectedUser) {
          setError('Please select industry and user');
          setLoading(false);
          return;
        }
        loginData = { email: selectedUser, password: password };
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/login`,
        loginData
      );
      
      setUserSession(
        response.data.token,
        response.data.user,
        response.data.permissions
      );
      
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async (type) => {
    setLoading(true);
    
    try {
      let biometricData;
      
      if (type === 'face') {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        videoRef.current.srcObject = stream;
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        biometricData = canvas.toDataURL('image/jpeg');
        
        stream.getTracks().forEach(track => track.stop());
      } else {
        biometricData = `fingerprint_${Date.now()}`;
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/login`,
        {
          email: selectedUser || manualEmail,
          password: password || manualPassword,
          biometric: {
            type,
            data: biometricData
          }
        }
      );
      
      setUserSession(
        response.data.token,
        response.data.user,
        response.data.permissions
      );
      
      window.location.href = '/dashboard';
      
    } catch (error) {
      setError('Biometric authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card-large">
        <div className="login-header">
          <div className="logo">
            <Icon name="shield" size={48} style={{ color: '#667eea' }} />
            <h1>RoleWatch India</h1>
          </div>
          <p className="subtitle">Advanced Access Control - Multi-Tab Support</p>
          <div style={{
            background: '#dbeafe',
            color: '#1e40af',
            padding: '12px',
            borderRadius: '8px',
            marginTop: '16px',
            fontSize: '13px',
            fontWeight: '500'
          }}>
            ⚡ Login with password or biometric authentication
          </div>
        </div>

        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          marginBottom: '32px',
          background: '#f8fafc',
          padding: '6px',
          borderRadius: '10px'
        }}>
          <button
            type="button"
            onClick={() => setLoginMode('dropdown')}
            style={{
              flex: 1,
              padding: '12px',
              background: loginMode === 'dropdown' ? '#667eea' : 'transparent',
              color: loginMode === 'dropdown' ? 'white' : '#6b7280',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Regular User
          </button>
          <button
            type="button"
            onClick={() => setLoginMode('manual')}
            style={{
              flex: 1,
              padding: '12px',
              background: loginMode === 'manual' ? '#667eea' : 'transparent',
              color: loginMode === 'manual' ? 'white' : '#6b7280',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Admin Login
          </button>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          {loginMode === 'dropdown' ? (
            <>
              <div className="form-step">
                <label className="step-label">
                  <span className="step-number">1</span>
                  Select Industry
                </label>
                <div className="industry-grid">
                  {Object.values(INDUSTRIES).map(industry => (
                    <button
                      key={industry.id}
                      type="button"
                      className={`industry-card ${selectedIndustry === industry.id ? 'selected' : ''}`}
                      onClick={() => setSelectedIndustry(industry.id)}
                      style={{ borderColor: selectedIndustry === industry.id ? industry.color : '#e5e7eb' }}
                    >
                      <Icon name={industry.icon} size={32} style={{ color: industry.color }} />
                      <div className="industry-name">{industry.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {selectedIndustry && (
                <div className="form-step">
                  <label className="step-label">
                    <span className="step-number">2</span>
                    Select User
                  </label>
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="user-select"
                    required
                  >
                    <option value="">Choose user...</option>
                    {availableUsers.map(user => (
                      <option key={user.email} value={user.email}>
                        {user.firstName} {user.lastName} - {user.role}
                      </option>
                    ))}
                  </select>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password: Demo@2024"
                    className="password-input"
                    style={{ marginTop: '12px' }}
                    required
                  />
                </div>
              )}
            </>
          ) : (
            <div className="form-step">
              <input
                type="email"
                value={manualEmail}
                onChange={(e) => setManualEmail(e.target.value)}
                placeholder="admin.bank@rolewatch.in"
                className="password-input"
                required
                style={{ marginBottom: '12px' }}
              />
              <input
                type="password"
                value={manualPassword}
                onChange={(e) => setManualPassword(e.target.value)}
                placeholder="Admin@2024"
                className="password-input"
                required
              />
              <p className="hint" style={{ marginTop: '8px' }}>
                Admin accounts: admin.bank@rolewatch.in, admin.hospital@rolewatch.in, etc.
              </p>
            </div>
          )}

          {error && (
            <div className="error-message">
              <Icon name="alert" size={16} />
              {error}
            </div>
          )}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Logging in...' : '🔑 Login with Password'}
          </button>

          {/* Biometric Options */}
          {(selectedUser || manualEmail) && (
            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <div style={{ 
                fontSize: '13px', 
                color: '#6b7280',
                marginBottom: '12px'
              }}>
                Or login with biometric
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => handleBiometricLogin('face')}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  👤 Face ID
                </button>
                <button
                  type="button"
                  onClick={() => handleBiometricLogin('fingerprint')}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#f59e0b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  👆 Fingerprint
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Hidden video/canvas */}
        <div style={{ display: 'none' }}>
          <video ref={videoRef} autoPlay playsInline />
          <canvas ref={canvasRef} />
        </div>
      </div>
    </div>
  );
}

export default Login;
