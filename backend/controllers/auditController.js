const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const { Op } = require('sequelize');

exports.getAuditLogs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      location, 
      riskMin, 
      riskMax,
      action,
      userId,
      dateFrom,
      dateTo
    } = req.query;

    let where = {};

    if (location && location !== 'all') {
      where.location = location;
    }

    if (riskMin) {
      where.riskScore = { [Op.gte]: parseInt(riskMin) };
    }

    if (riskMax) {
      where.riskScore = { 
        ...where.riskScore,
        [Op.lte]: parseInt(riskMax) 
      };
    }

    if (action) {
      where.action = action;
    }

    if (userId) {
      where.userId = userId;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt[Op.gte] = new Date(dateFrom);
      if (dateTo) where.createdAt[Op.lte] = new Date(dateTo);
    }

    const logs = await AuditLog.findAll({
      where,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'userId', 'firstName', 'lastName', 'email', 'role']
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    const total = await AuditLog.count({ where });

    // Log this audit access
    await AuditLog.create({
      userId: req.user.id,
      action: 'view_audit_logs',
      resource: 'audit',
      status: 'success',
      ipAddress: req.ip,
      riskScore: 0
    });

    res.json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching audit logs'
    });
  }
};

exports.getAuditAnalytics = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const dateFrom = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Total logs
    const totalLogs = await AuditLog.count({
      where: { createdAt: { [Op.gte]: dateFrom } }
    });

    // By status
    const byStatus = {};
    const statuses = ['success', 'denied', 'failed'];
    for (const status of statuses) {
      byStatus[status] = await AuditLog.count({
        where: { 
          status,
          createdAt: { [Op.gte]: dateFrom }
        }
      });
    }

    // By risk level
    const highRisk = await AuditLog.count({
      where: { 
        riskScore: { [Op.gte]: 70 },
        createdAt: { [Op.gte]: dateFrom }
      }
    });

    const mediumRisk = await AuditLog.count({
      where: { 
        riskScore: { [Op.gte]: 40, [Op.lt]: 70 },
        createdAt: { [Op.gte]: dateFrom }
      }
    });

    const lowRisk = await AuditLog.count({
      where: { 
        riskScore: { [Op.lt]: 40 },
        createdAt: { [Op.gte]: dateFrom }
      }
    });

    // Top locations
    const locationCounts = await AuditLog.findAll({
      where: { createdAt: { [Op.gte]: dateFrom } },
      attributes: [
        'location',
        [require('sequelize').fn('COUNT', '*'), 'count']
      ],
      group: ['location'],
      order: [[require('sequelize').literal('count'), 'DESC']],
      limit: 10
    });

    // Top actions
    const actionCounts = await AuditLog.findAll({
      where: { createdAt: { [Op.gte]: dateFrom } },
      attributes: [
        'action',
        [require('sequelize').fn('COUNT', '*'), 'count']
      ],
      group: ['action'],
      order: [[require('sequelize').literal('count'), 'DESC']],
      limit: 10
    });

    // Activity by hour
    const hourlyActivity = await AuditLog.findAll({
      where: { createdAt: { [Op.gte]: dateFrom } },
      attributes: [
        [require('sequelize').fn('DATE_TRUNC', 'hour', require('sequelize').col('createdAt')), 'hour'],
        [require('sequelize').fn('COUNT', '*'), 'count']
      ],
      group: [require('sequelize').literal('1')],
      order: [[require('sequelize').literal('hour'), 'ASC']]
    });

    res.json({
      success: true,
      data: {
        totalLogs,
        byStatus,
        riskLevels: {
          high: highRisk,
          medium: mediumRisk,
          low: lowRisk
        },
        topLocations: locationCounts.map(l => ({
          location: l.location,
          count: parseInt(l.dataValues.count)
        })),
        topActions: actionCounts.map(a => ({
          action: a.action,
          count: parseInt(a.dataValues.count)
        })),
        hourlyActivity: hourlyActivity.map(h => ({
          hour: h.dataValues.hour,
          count: parseInt(h.dataValues.count)
        }))
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics'
    });
  }
};

exports.getUserActivityTimeline = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50 } = req.query;

    const logs = await AuditLog.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching timeline'
    });
  }
};
