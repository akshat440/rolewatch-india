const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const { Op } = require('sequelize');

router.use(authenticate);

// Get audit logs
router.get('/logs', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      location, 
      riskMin, 
      riskMax
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

    const logs = await AuditLog.findAll({
      where,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'userId', 'firstName', 'lastName', 'email', 'role'],
        required: false
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    const total = await AuditLog.count({ where });

    console.log(`✅ Returned ${logs.length} audit logs`);

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
    console.error('Error fetching logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching audit logs',
      error: error.message
    });
  }
});

// Get analytics
router.get('/analytics', async (req, res) => {
  try {
    const totalLogs = await AuditLog.count();

    const highRisk = await AuditLog.count({
      where: { riskScore: { [Op.gte]: 70 } }
    });

    const mediumRisk = await AuditLog.count({
      where: { riskScore: { [Op.gte]: 40, [Op.lt]: 70 } }
    });

    const lowRisk = await AuditLog.count({
      where: { riskScore: { [Op.lt]: 40 } }
    });

    const todayCount = await AuditLog.count({
      where: {
        createdAt: {
          [Op.gte]: new Date(new Date().setHours(0,0,0,0))
        }
      }
    });

    // Get location counts
    const locationCounts = await AuditLog.findAll({
      attributes: [
        'location',
        [require('sequelize').fn('COUNT', '*'), 'count']
      ],
      group: ['location'],
      order: [[require('sequelize').literal('count'), 'DESC']],
      limit: 10,
      raw: true
    });

    const byLocation = {};
    locationCounts.forEach(loc => {
      if (loc.location) {
        byLocation[loc.location] = parseInt(loc.count);
      }
    });

    res.json({
      success: true,
      data: {
        totalLogs,
        highRiskCount: highRisk,
        mediumRiskCount: mediumRisk,
        lowRiskCount: lowRisk,
        todayCount,
        byLocation
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message
    });
  }
});

module.exports = router;
