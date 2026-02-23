const AuditLog = require('../../models/AuditLog');
const User = require('../../models/User');
const { Op } = require('sequelize');
const { emitToIndustry } = require('../socket/socketService');

class AIDetectionService {
  
  async monitorUserActivity(userId, action, resource, ipAddress, device) {
    try {
      const user = await User.findByPk(userId);
      if (!user) return { riskScore: 0, alerts: [] };

      const baseline = await this.calculateBehavioralBaseline(userId);
      const riskScore = await this.calculateRealTimeRisk(user, action, resource, ipAddress, device, baseline);
      const anomalies = await this.detectAnomalies(user, action, resource, baseline);
      
      const alerts = [];
      if (riskScore >= 70) {
        alerts.push({
          severity: 'HIGH',
          type: 'high_risk_activity',
          message: `High-risk activity detected for ${user.firstName} ${user.lastName}`,
          userId,
          riskScore,
          action,
          resource,
          timestamp: new Date()
        });

        emitToIndustry(user.industry, 'security_alert', {
          userId,
          userName: `${user.firstName} ${user.lastName}`,
          email: user.email,
          riskScore,
          action,
          resource,
          anomalies,
          timestamp: new Date().toISOString()
        });
      }

      return {
        riskScore,
        riskLevel: this.getRiskLevel(riskScore),
        anomalies,
        alerts,
        baseline,
        recommendation: this.getRecommendation(riskScore)
      };

    } catch (error) {
      console.error('AI Detection Error:', error);
      return { riskScore: 0, alerts: [] };
    }
  }

  async calculateBehavioralBaseline(userId) {
    const recentLogs = await AuditLog.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: 100
    });

    if (recentLogs.length === 0) {
      return {
        typicalHours: [],
        typicalLocations: [],
        typicalActions: [],
        typicalDevices: [],
        avgActionsPerDay: 0,
        dataPoints: 0
      };
    }

    const hours = recentLogs.map(log => new Date(log.createdAt).getHours());
    const hourCounts = {};
    hours.forEach(h => hourCounts[h] = (hourCounts[h] || 0) + 1);
    const typicalHours = Object.keys(hourCounts)
      .sort((a, b) => hourCounts[b] - hourCounts[a])
      .slice(0, 5)
      .map(h => parseInt(h));

    const locations = recentLogs.map(log => log.location).filter(Boolean);
    const locationCounts = {};
    locations.forEach(l => locationCounts[l] = (locationCounts[l] || 0) + 1);
    const typicalLocations = Object.keys(locationCounts)
      .sort((a, b) => locationCounts[b] - locationCounts[a])
      .slice(0, 3);

    const actions = recentLogs.map(log => log.action);
    const actionCounts = {};
    actions.forEach(a => actionCounts[a] = (actionCounts[a] || 0) + 1);
    const typicalActions = Object.keys(actionCounts)
      .sort((a, b) => actionCounts[b] - actionCounts[a])
      .slice(0, 5);

    const daySpan = (new Date() - new Date(recentLogs[recentLogs.length - 1].createdAt)) / (1000 * 60 * 60 * 24);
    const avgActionsPerDay = Math.round(recentLogs.length / Math.max(daySpan, 1));

    return {
      typicalHours,
      typicalLocations,
      typicalActions,
      avgActionsPerDay,
      dataPoints: recentLogs.length
    };
  }

  async calculateRealTimeRisk(user, action, resource, ipAddress, device, baseline) {
    let riskScore = 0;

    const currentHour = new Date().getHours();
    if (currentHour >= 22 || currentHour <= 6) {
      riskScore += 25;
    } else if (!baseline.typicalHours.includes(currentHour)) {
      riskScore += 15;
    }

    if (user.city && !baseline.typicalLocations.includes(user.city)) {
      riskScore += 20;
    }

    const sensitiveActions = ['delete', 'admin', 'permission_change', 'access_denied', 'classified'];
    if (sensitiveActions.some(sa => action.toLowerCase().includes(sa))) {
      riskScore += 20;
    }

    if (!baseline.typicalActions.includes(action)) {
      riskScore += 10;
    }

    const recentCount = await AuditLog.count({
      where: {
        userId: user.id,
        createdAt: {
          [Op.gte]: new Date(Date.now() - 60 * 60 * 1000)
        }
      }
    });

    if (recentCount > baseline.avgActionsPerDay) {
      riskScore += 10;
    }

    return Math.min(riskScore, 100);
  }

  async detectAnomalies(user, action, resource, baseline) {
    const anomalies = [];
    const currentHour = new Date().getHours();

    if (currentHour >= 22 || currentHour <= 6) {
      anomalies.push({
        type: 'time',
        severity: 'HIGH',
        message: `Access at unusual time (${currentHour}:00)`,
        timestamp: new Date()
      });
    }

    if (user.city && !baseline.typicalLocations.includes(user.city)) {
      anomalies.push({
        type: 'location',
        severity: 'MEDIUM',
        message: `Access from unusual location: ${user.city}`,
        timestamp: new Date()
      });
    }

    return anomalies;
  }

  getRiskLevel(score) {
    if (score >= 70) return 'CRITICAL';
    if (score >= 50) return 'HIGH';
    if (score >= 30) return 'MEDIUM';
    return 'LOW';
  }

  getRecommendation(score) {
    if (score >= 70) {
      return 'BLOCK ACCESS - Require additional verification';
    }
    if (score >= 50) {
      return 'CHALLENGE - Request additional authentication';
    }
    if (score >= 30) {
      return 'MONITOR - Log all activities';
    }
    return 'ALLOW - Continue normal monitoring';
  }

  async getRealtimeActivityFeed(industry, limit = 20) {
    const industryUsers = await User.findAll({
      where: { industry },
      attributes: ['id']
    });

    const userIds = industryUsers.map(u => u.id);

    const activities = await AuditLog.findAll({
      where: {
        userId: userIds,
        createdAt: {
          [Op.gte]: new Date(Date.now() - 60 * 60 * 1000)
        }
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'department']
      }],
      order: [['createdAt', 'DESC']],
      limit
    });

    return activities;
  }

  async getSecurityAlerts(industry, hours = 24) {
    const industryUsers = await User.findAll({
      where: { industry },
      attributes: ['id']
    });

    const userIds = industryUsers.map(u => u.id);

    const alerts = await AuditLog.findAll({
      where: {
        userId: userIds,
        riskScore: { [Op.gte]: 50 },
        createdAt: {
          [Op.gte]: new Date(Date.now() - hours * 60 * 60 * 1000)
        }
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email', 'role']
      }],
      order: [['riskScore', 'DESC'], ['createdAt', 'DESC']],
      limit: 50
    });

    return alerts;
  }
}

module.exports = new AIDetectionService();
