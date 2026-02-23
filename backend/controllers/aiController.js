const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { Op } = require('sequelize');

exports.getUserRiskProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's activity history
    const recentLogs = await AuditLog.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: 100
    });

    // Calculate behavioral baseline
    const baseline = calculateBehavioralBaseline(recentLogs);
    
    // Get current session
    const currentSession = recentLogs[0];
    
    // Calculate current risk score
    const riskScore = calculateRealTimeRiskScore(user, currentSession, baseline);
    
    // Detect anomalies
    const anomalies = detectAnomalies(currentSession, baseline);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
          industry: user.industry
        },
        riskScore,
        riskLevel: getRiskLevel(riskScore),
        baseline,
        currentActivity: currentSession ? {
          action: currentSession.action,
          timestamp: currentSession.createdAt,
          location: currentSession.location,
          device: currentSession.device,
          ipAddress: currentSession.ipAddress
        } : null,
        anomalies,
        recommendation: getRecommendation(riskScore)
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching risk profile'
    });
  }
};

function calculateBehavioralBaseline(logs) {
  if (logs.length === 0) {
    return {
      typicalHours: [],
      typicalLocations: [],
      typicalDevices: [],
      avgActionsPerDay: 0,
      dataPoints: 0
    };
  }

  // Extract typical login hours
  const hours = logs.map(log => new Date(log.createdAt).getHours());
  const hourCounts = {};
  hours.forEach(h => hourCounts[h] = (hourCounts[h] || 0) + 1);
  const typicalHours = Object.keys(hourCounts)
    .sort((a, b) => hourCounts[b] - hourCounts[a])
    .slice(0, 5)
    .map(h => parseInt(h));

  // Extract typical locations
  const locations = logs.map(log => log.location).filter(Boolean);
  const locationCounts = {};
  locations.forEach(l => locationCounts[l] = (locationCounts[l] || 0) + 1);
  const typicalLocations = Object.keys(locationCounts)
    .sort((a, b) => locationCounts[b] - locationCounts[a])
    .slice(0, 3);

  // Extract typical devices
  const devices = logs.map(log => log.device).filter(Boolean);
  const deviceCounts = {};
  devices.forEach(d => deviceCounts[d] = (deviceCounts[d] || 0) + 1);
  const typicalDevices = Object.keys(deviceCounts)
    .sort((a, b) => deviceCounts[b] - deviceCounts[a])
    .slice(0, 2);

  // Calculate average actions per day
  const daySpan = (new Date() - new Date(logs[logs.length - 1].createdAt)) / (1000 * 60 * 60 * 24);
  const avgActionsPerDay = Math.round(logs.length / Math.max(daySpan, 1));

  return {
    typicalHours,
    typicalLocations,
    typicalDevices,
    avgActionsPerDay,
    dataPoints: logs.length
  };
}

function calculateRealTimeRiskScore(user, currentSession, baseline) {
  if (!currentSession) return 0;

  let riskScore = 0;

  // Check time anomaly
  const currentHour = new Date(currentSession.createdAt).getHours();
  if (!baseline.typicalHours.includes(currentHour)) {
    riskScore += 30;
  }

  // Check location anomaly
  if (currentSession.location && !baseline.typicalLocations.includes(currentSession.location)) {
    riskScore += 25;
  }

  // Check device anomaly
  if (currentSession.device && !baseline.typicalDevices.includes(currentSession.device)) {
    riskScore += 20;
  }

  // Failed actions increase risk
  if (currentSession.status === 'failed' || currentSession.status === 'denied') {
    riskScore += 15;
  }

  // High privilege actions
  if (currentSession.action.includes('admin') || currentSession.action.includes('delete')) {
    riskScore += 10;
  }

  return Math.min(riskScore, 100);
}

function detectAnomalies(currentSession, baseline) {
  if (!currentSession) return [];

  const anomalies = [];
  const currentHour = new Date(currentSession.createdAt).getHours();

  if (!baseline.typicalHours.includes(currentHour)) {
    anomalies.push({
      type: 'time',
      severity: 'medium',
      message: `Access at unusual time (${currentHour}:00)`,
      timestamp: currentSession.createdAt
    });
  }

  if (currentSession.location && !baseline.typicalLocations.includes(currentSession.location)) {
    anomalies.push({
      type: 'location',
      severity: 'high',
      message: `Access from unusual location: ${currentSession.location}`,
      timestamp: currentSession.createdAt
    });
  }

  if (currentSession.device && !baseline.typicalDevices.includes(currentSession.device)) {
    anomalies.push({
      type: 'device',
      severity: 'medium',
      message: 'Access from new device',
      timestamp: currentSession.createdAt
    });
  }

  return anomalies;
}

function getRiskLevel(score) {
  if (score >= 70) return 'HIGH';
  if (score >= 40) return 'MEDIUM';
  return 'LOW';
}

function getRecommendation(score) {
  if (score >= 70) {
    return 'BLOCK ACCESS - Require additional verification (2FA, supervisor approval)';
  }
  if (score >= 40) {
    return 'MONITOR CLOSELY - Request additional authentication';
  }
  return 'ALLOW - Continue normal monitoring';
}

exports.getSystemAnomalies = async (req, res) => {
  try {
    const { threshold = 60, limit = 20 } = req.query;

    const highRiskLogs = await AuditLog.findAll({
      where: {
        riskScore: { [Op.gte]: parseInt(threshold) },
        createdAt: {
          [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email', 'role']
      }],
      order: [['riskScore', 'DESC'], ['createdAt', 'DESC']],
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: highRiskLogs,
      total: highRiskLogs.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching anomalies'
    });
  }
};
