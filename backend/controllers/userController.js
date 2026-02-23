const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { Op } = require('sequelize');

exports.getAllUsers = async (req, res) => {
  try {
    const { industry, search, page = 1, limit = 50 } = req.query;
    
    let where = {};
    
    if (industry && industry !== 'all') {
      where.industry = industry;
    }
    
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { department: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const users = await User.findAll({
      where,
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['role', 'DESC'], ['firstName', 'ASC']]
    });

    const total = await User.count({ where });

    // Log this access
    await AuditLog.create({
      userId: req.user.id,
      action: 'view_users',
      resource: 'users',
      status: 'success',
      ipAddress: req.ip,
      metadata: { filters: { industry, search } }
    });

    res.json({
      success: true,
      data: users,
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
      message: 'Error fetching users'
    });
  }
};

exports.getUserStats = async (req, res) => {
  try {
    const total = await User.count();
    
    const byIndustry = {};
    const industries = ['bank', 'hospital', 'police', 'government', 'college'];
    
    for (const industry of industries) {
      byIndustry[industry] = await User.count({ where: { industry } });
    }

    const byRole = {};
    const roles = ['admin', 'manager', 'officer', 'staff'];
    
    for (const role of roles) {
      byRole[role] = await User.count({ where: { role } });
    }

    res.json({
      success: true,
      data: {
        total,
        byIndustry,
        byRole,
        active: await User.count({ where: { isActive: true } }),
        inactive: await User.count({ where: { isActive: false } })
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching stats'
    });
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    const recentActivity = await AuditLog.findAll({
      where: { userId: user.id },
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    res.json({
      success: true,
      data: {
        user,
        recentActivity
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching profile'
    });
  }
};
