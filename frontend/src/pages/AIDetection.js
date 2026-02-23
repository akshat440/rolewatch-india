import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Icon from '../components/common/Icon';
import './AIDetection.css';

function AIDetection() {
  const [user, setUser] = useState(null);
  const [riskScore, setRiskScore] = useState(0);
  const [anomalies, setAnomalies] = useState([]);
  const [behaviorBaseline, setBehaviorBaseline] = useState(null);
  const [currentActivity, setCurrentActivity] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      loadAIData(JSON.parse(userData));
    }
  }, []);

  const loadAIData = async (userData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/ai/user-profile/${userData.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRiskScore(response.data.riskScore || calculateMockRiskScore());
      setAnomalies(response.data.anomalies || generateMockAnomalies());
      setBehaviorBaseline(response.data.baseline || generateMockBaseline(userData));
      setCurrentActivity(generateMockCurrentActivity(userData));
    } catch (error) {
      // Use mock data for demo
      setRiskScore(calculateMockRiskScore());
      setAnomalies(generateMockAnomalies());
      setBehaviorBaseline(generateMockBaseline(userData));
      setCurrentActivity(generateMockCurrentActivity(userData));
    }
  };

  const calculateMockRiskScore = () => {
    const hour = new Date().getHours();
    if (hour >= 22 || hour <= 6) return Math.floor(Math.random() * 30) + 60; // Night: 60-90
    if (hour >= 9 && hour <= 18) return Math.floor(Math.random() * 30); // Work hours: 0-30
    return Math.floor(Math.random() * 30) + 30; // Other: 30-60
  };

  const generateMockBaseline = (userData) => {
    return {
      typicalLoginTimes: ['9:00 AM - 10:00 AM', '2:00 PM - 3:00 PM'],
      typicalLocations: [userData.city, 'Mumbai', 'Delhi'],
      typicalDevices: ['Chrome/MacOS', 'Safari/iOS'],
      avgActionsPerDay: Math.floor(Math.random() * 50) + 50,
      accountAge: Math.floor(Math.random() * 365) + 30,
      lastUpdated: new Date().toISOString()
    };
  };

  const generateMockCurrentActivity = (userData) => {
    const now = new Date();
    return {
      loginTime: now.toLocaleTimeString('en-IN'),
      location: userData.city,
      device: 'Chrome/MacOS',
      ipAddress: `103.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      actionsToday: Math.floor(Math.random() * 30) + 20
    };
  };

  const generateMockAnomalies = () => {
    return [
      {
        type: 'time',
        severity: 'low',
        message: 'Login during typical working hours',
        score: 0,
        timestamp: new Date().toISOString()
      },
      {
        type: 'location',
        severity: 'low',
        message: 'Access from known location',
        score: 0,
        timestamp: new Date().toISOString()
      }
    ];
  };

  const getRiskColor = (score) => {
    if (score >= 70) return '#ef4444';
    if (score >= 40) return '#f59e0b';
    return '#10b981';
  };

  const getRiskLevel = (score) => {
    if (score >= 70) return 'HIGH RISK';
    if (score >= 40) return 'MEDIUM RISK';
    return 'LOW RISK';
  };

  if (!user) return <div>Loading...</div>;

  const riskColor = getRiskColor(riskScore);

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
        AI Anomaly Detection
      </h1>
      <p style={{ color: '#6b7280', marginBottom: '32px' }}>
        Real-time behavioral analysis and risk scoring
      </p>

      {/* Risk Score Card */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '32px',
        border: `3px solid ${riskColor}`,
        display: 'flex',
        alignItems: 'center',
        gap: '32px'
      }}>
        <div style={{ position: 'relative', width: '200px', height: '200px' }}>
          <svg viewBox="0 0 200 200" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="#f1f5f9"
              strokeWidth="20"
            />
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke={riskColor}
              strokeWidth="20"
              strokeDasharray={`${(riskScore / 100) * 565} 565`}
              strokeLinecap="round"
            />
          </svg>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', fontWeight: '800', color: riskColor }}>
              {riskScore}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '600' }}>
              / 100
            </div>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '32px',
            fontWeight: '700',
            color: riskColor,
            marginBottom: '8px'
          }}>
            {getRiskLevel(riskScore)}
          </div>
          <p style={{ color: '#6b7280', marginBottom: '16px' }}>
            Current security risk score based on behavioral analysis
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{
              padding: '8px 16px',
              background: riskScore < 40 ? '#d1fae5' : '#fee2e2',
              color: riskScore < 40 ? '#065f46' : '#991b1b',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600'
            }}>
              {riskScore < 40 ? 'No Action Required' : 'Monitoring Active'}
            </div>
            <div style={{
              padding: '8px 16px',
              background: '#f0f9ff',
              color: '#0c4a6e',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600'
            }}>
              AI Learning Active
            </div>
          </div>
        </div>
      </div>

      {/* Current Activity */}
      {currentActivity && (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '32px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>
            Current Session Analysis
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Login Time</div>
              <div style={{ fontWeight: '600', color: '#1a2332' }}>{currentActivity.loginTime}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Location</div>
              <div style={{ fontWeight: '600', color: '#1a2332' }}>{currentActivity.location}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Device</div>
              <div style={{ fontWeight: '600', color: '#1a2332' }}>{currentActivity.device}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>IP Address</div>
              <div style={{ fontWeight: '600', color: '#1a2332', fontFamily: 'monospace' }}>
                {currentActivity.ipAddress}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Actions Today</div>
              <div style={{ fontWeight: '600', color: '#1a2332' }}>{currentActivity.actionsToday}</div>
            </div>
          </div>
        </div>
      )}

      {/* Behavioral Baseline */}
      {behaviorBaseline && (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '32px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>
            Learned Behavior Baseline
          </h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px', fontWeight: '600' }}>
                Typical Login Times
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {behaviorBaseline.typicalLoginTimes.map((time, i) => (
                  <span key={i} style={{
                    padding: '6px 12px',
                    background: '#dbeafe',
                    color: '#1e40af',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '500'
                  }}>
                    {time}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px', fontWeight: '600' }}>
                Typical Locations
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {behaviorBaseline.typicalLocations.map((loc, i) => (
                  <span key={i} style={{
                    padding: '6px 12px',
                    background: '#dcfce7',
                    color: '#166534',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '500'
                  }}>
                    {loc}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px', fontWeight: '600' }}>
                Typical Devices
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {behaviorBaseline.typicalDevices.map((device, i) => (
                  <span key={i} style={{
                    padding: '6px 12px',
                    background: '#fef3c7',
                    color: '#92400e',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '500'
                  }}>
                    {device}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* How It Works */}
      <div style={{
        background: '#f8fafc',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>
          How AI Anomaly Detection Works
        </h3>
        <div style={{ display: 'grid', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: '#667eea',
              color: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              flexShrink: 0
            }}>1</div>
            <div>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>Learning Phase</div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                System learns your typical login times, locations, devices, and access patterns over 2 weeks
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: '#667eea',
              color: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              flexShrink: 0
            }}>2</div>
            <div>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>Real-Time Analysis</div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                Every access is compared against baseline. Anomalies receive risk scores (0-100)
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: '#667eea',
              color: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              flexShrink: 0
            }}>3</div>
            <div>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>Automated Response</div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                0-30: Allow | 30-60: Require 2FA | 60-100: Block + Alert Admin
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIDetection;
