import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Alert } from '../components/ui/Alert';
import { theme } from '../theme';
import Icon from '../components/common/Icon';
import { getUserSession } from '../services/sessionManager';
import { connectWebSocket } from '../services/websocket';

function LiveMonitoring() {
  const [activities, setActivities] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({
    totalActivity: 0,
    highRisk: 0,
    activeUsers: 0,
    blockedAttempts: 0
  });
  const [loading, setLoading] = useState(true);

  const session = getUserSession();

  useEffect(() => {
    if (session?.user?.role !== 'admin') {
      window.location.href = '/dashboard';
      return;
    }

    loadData();

    const socket = connectWebSocket(session.user.id);
    
    if (socket) {
      socket.on('security_alert', (data) => {
        console.log('🚨 Security Alert:', data);
        setAlerts(prev => [data, ...prev].slice(0, 10));
        loadData();
      });
    }

    const interval = setInterval(loadData, 10000);

    return () => {
      clearInterval(interval);
      if (socket) {
        socket.off('security_alert');
      }
    };
  }, [session]);

  const loadData = async () => {
    try {
      const token = session?.token;
      
      const [activitiesRes, alertsRes] = await Promise.all([
        axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/ai-detection/activity-feed`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/ai-detection/security-alerts`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
      ]);

      setActivities(activitiesRes.data.data || []);
      setAlerts(alertsRes.data.data || []);

      const highRiskCount = (activitiesRes.data.data || []).filter(a => a.riskScore >= 50).length;
      const uniqueUsers = new Set((activitiesRes.data.data || []).map(a => a.user?.id)).size;
      const blockedCount = (activitiesRes.data.data || []).filter(a => a.status === 'denied').length;

      setStats({
        totalActivity: activitiesRes.data.data?.length || 0,
        highRisk: highRiskCount,
        activeUsers: uniqueUsers,
        blockedAttempts: blockedCount
      });

      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const getRiskColor = (score) => {
    if (score >= 70) return theme.colors.danger;
    if (score >= 50) return theme.colors.warning;
    if (score >= 30) return '#f59e0b';
    return theme.colors.success;
  };

  if (loading) {
    return <div style={{ padding: '32px' }}>Loading live monitoring...</div>;
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1800px', margin: '0 auto' }}>
      {/* Header with Live Indicator */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '800', margin: 0 }}>
            Live Security Monitoring
          </h1>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            borderRadius: theme.borderRadius.xl,
            boxShadow: theme.shadows.lg
          }}>
            <div style={{
              width: '12px',
              height: '12px',
              background: 'white',
              borderRadius: '50%',
              animation: 'pulse 2s infinite',
              boxShadow: '0 0 10px rgba(255,255,255,0.8)'
            }} />
            <span style={{ fontSize: '15px', fontWeight: '700', color: 'white', letterSpacing: '0.5px' }}>
              LIVE
            </span>
          </div>
        </div>
        <p style={{ color: theme.colors.gray[600], fontSize: '15px' }}>
          Real-time activity monitoring and threat detection for {session?.user?.industry?.toUpperCase()}
        </p>
      </div>

      {/* Enhanced Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <Card hover style={{ border: '2px solid #3b82f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: theme.gradients.info,
              borderRadius: theme.borderRadius.xl,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)'
            }}>
              <Icon name="chart" size={32} style={{ color: 'white' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '32px', fontWeight: '800', color: theme.colors.dark, marginBottom: '4px' }}>
                {stats.totalActivity}
              </div>
              <div style={{ fontSize: '13px', color: theme.colors.gray[600], fontWeight: '600' }}>
                Total Activity
              </div>
              <div style={{ fontSize: '11px', color: theme.colors.gray[500], marginTop: '2px' }}>
                Last Hour
              </div>
            </div>
          </div>
        </Card>

        <Card hover style={{ border: '2px solid #ef4444' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: theme.gradients.danger,
              borderRadius: theme.borderRadius.xl,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(239, 68, 68, 0.3)'
            }}>
              <Icon name="alert" size={32} style={{ color: 'white' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '32px', fontWeight: '800', color: theme.colors.danger, marginBottom: '4px' }}>
                {stats.highRisk}
              </div>
              <div style={{ fontSize: '13px', color: theme.colors.gray[600], fontWeight: '600' }}>
                High Risk Events
              </div>
              <div style={{ fontSize: '11px', color: theme.colors.gray[500], marginTop: '2px' }}>
                Requires Attention
              </div>
            </div>
          </div>
        </Card>

        <Card hover style={{ border: '2px solid #10b981' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: theme.gradients.success,
              borderRadius: theme.borderRadius.xl,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)'
            }}>
              <Icon name="user" size={32} style={{ color: 'white' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '32px', fontWeight: '800', color: theme.colors.success, marginBottom: '4px' }}>
                {stats.activeUsers}
              </div>
              <div style={{ fontSize: '13px', color: theme.colors.gray[600], fontWeight: '600' }}>
                Active Users
              </div>
              <div style={{ fontSize: '11px', color: theme.colors.gray[500], marginTop: '2px' }}>
                Currently Online
              </div>
            </div>
          </div>
        </Card>

        <Card hover style={{ border: '2px solid #f59e0b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              borderRadius: theme.borderRadius.xl,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(245, 158, 11, 0.3)'
            }}>
              <Icon name="shield" size={32} style={{ color: 'white' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '32px', fontWeight: '800', color: '#d97706', marginBottom: '4px' }}>
                {stats.blockedAttempts}
              </div>
              <div style={{ fontSize: '13px', color: theme.colors.gray[600], fontWeight: '600' }}>
                Blocked Attempts
              </div>
              <div style={{ fontSize: '11px', color: theme.colors.gray[500], marginTop: '2px' }}>
                Access Denied
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Activity Feed and Alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div>
          <Card style={{ boxShadow: theme.shadows.xl }}>
            <CardHeader>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <CardTitle style={{ fontSize: '20px' }}>Live Activity Feed</CardTitle>
                <Badge variant="success" style={{ fontSize: '12px', padding: '8px 16px' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    background: 'white',
                    borderRadius: '50%',
                    marginRight: '8px',
                    animation: 'pulse 2s infinite'
                  }} />
                  Real-Time Updates
                </Badge>
              </div>
            </CardHeader>

            <div style={{ maxHeight: '600px', overflowY: 'auto', padding: '4px' }}>
              {activities.length === 0 ? (
                <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <Icon name="chart" size={48} style={{ color: theme.colors.gray[300], marginBottom: '16px' }} />
                  <div style={{ fontSize: '16px', color: theme.colors.gray[500], fontWeight: '600' }}>
                    No Recent Activity
                  </div>
                  <div style={{ fontSize: '13px', color: theme.colors.gray[400], marginTop: '8px' }}>
                    Activity will appear here as users interact with the system
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {activities.map(activity => (
                    <div
                      key={activity.id}
                      style={{
                        padding: '20px',
                        background: 'white',
                        borderRadius: theme.borderRadius.lg,
                        borderLeft: `5px solid ${getRiskColor(activity.riskScore)}`,
                        boxShadow: theme.shadows.md,
                        transition: 'all 0.3s',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateX(4px)';
                        e.currentTarget.style.boxShadow = theme.shadows.lg;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateX(0)';
                        e.currentTarget.style.boxShadow = theme.shadows.md;
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '44px',
                            height: '44px',
                            background: theme.gradients.primary,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '16px',
                            fontWeight: '700',
                            boxShadow: theme.shadows.md
                          }}>
                            {activity.user?.firstName?.[0]}{activity.user?.lastName?.[0]}
                          </div>
                          <div>
                            <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '4px' }}>
                              {activity.user?.firstName} {activity.user?.lastName}
                            </div>
                            <div style={{ fontSize: '12px', color: theme.colors.gray[600] }}>
                              {activity.user?.role} • {activity.user?.department}
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{
                            fontSize: '24px',
                            fontWeight: '800',
                            color: getRiskColor(activity.riskScore),
                            marginBottom: '2px'
                          }}>
                            {activity.riskScore}
                          </div>
                          <div style={{ fontSize: '11px', color: theme.colors.gray[600], fontWeight: '600' }}>
                            Risk Score
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                        <Badge variant={activity.status === 'success' ? 'success' : 'danger'} size="sm">
                          {activity.status.toUpperCase()}
                        </Badge>
                        <Badge variant="default" size="sm">
                          {activity.action}
                        </Badge>
                      </div>

                      <div style={{ 
                        fontSize: '14px', 
                        color: theme.colors.gray[700], 
                        marginBottom: '10px',
                        padding: '10px',
                        background: theme.colors.gray[50],
                        borderRadius: theme.borderRadius.md
                      }}>
                        <strong>Resource:</strong> {activity.resource}
                      </div>

                      <div style={{ 
                        display: 'flex', 
                        gap: '16px', 
                        fontSize: '12px', 
                        color: theme.colors.gray[600],
                        paddingTop: '10px',
                        borderTop: '1px solid ' + theme.colors.gray[200]
                      }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Icon name="dashboard" size={14} />
                          {activity.location}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Icon name="chart" size={14} />
                          {new Date(activity.createdAt).toLocaleTimeString()}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Icon name="user" size={14} />
                          {activity.device?.split('/')[0]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Security Alerts */}
        <div>
          <Card style={{ boxShadow: theme.shadows.xl }}>
            <CardHeader>
              <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon name="alert" size={20} style={{ color: theme.colors.danger }} />
                Security Alerts
              </CardTitle>
            </CardHeader>

            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {alerts.length === 0 ? (
                <Alert variant="success" title="All Clear">
                  No security alerts detected in the last 24 hours. System operating normally.
                </Alert>
              ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {alerts.map((alert, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '16px',
                        background: alert.riskScore >= 70 ? '#fee2e2' : '#fef3c7',
                        border: `2px solid ${alert.riskScore >= 70 ? theme.colors.danger : theme.colors.warning}`,
                        borderRadius: theme.borderRadius.lg,
                        boxShadow: theme.shadows.sm
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                        <Icon 
                          name="alert" 
                          size={20} 
                          style={{ color: alert.riskScore >= 70 ? theme.colors.danger : theme.colors.warning }} 
                        />
                        <span style={{ 
                          fontWeight: '700', 
                          fontSize: '14px',
                          color: alert.riskScore >= 70 ? '#991b1b' : '#92400e'
                        }}>
                          {alert.riskScore >= 70 ? 'CRITICAL ALERT' : 'WARNING'}
                        </span>
                      </div>

                      <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#1f2937' }}>
                        {alert.user?.firstName} {alert.user?.lastName}
                      </div>

                      <div style={{ fontSize: '13px', color: theme.colors.gray[700], marginBottom: '10px' }}>
                        {alert.action} • Risk Score: {alert.riskScore}
                      </div>

                      <div style={{ 
                        fontSize: '11px', 
                        color: theme.colors.gray[600],
                        paddingTop: '8px',
                        borderTop: '1px solid rgba(0,0,0,0.1)'
                      }}>
                        {new Date(alert.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}

export default LiveMonitoring;