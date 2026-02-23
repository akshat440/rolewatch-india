const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const HighSecurityRequest = require('../models/HighSecurityRequest');
const { emitToUser, emitToIndustry } = require('../services/socket/socketService');
const { Op } = require('sequelize');
const blockchain = require('../services/blockchain/blockchainService');

exports.getAllUsers = async (req, res) => {
  try {
    const adminUser = req.user;

    const users = await User.findAll({
      where: { 
        industry: adminUser.industry,
        role: { [Op.ne]: 'ceo' }
      },
      attributes: { exclude: ['password'] },
      order: [['role', 'DESC'], ['firstName', 'ASC']]
    });

    res.json({
      success: true,
      data: users,
      total: users.length
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
};

exports.updatePermissions = async (req, res) => {
  try {
    const { userId, permissions } = req.body;
    const adminUser = req.user;

    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const oldPermissions = user.permissions;
    user.permissions = permissions;
    await user.save();

    await AuditLog.create({
      userId: adminUser.id,
      action: 'update_permissions',
      resource: `user:${userId}`,
      status: 'success',
      ipAddress: req.ip,
      metadata: {
        targetUser: userId,
        targetEmail: user.email,
        oldPermissions,
        newPermissions: permissions,
        changedBy: adminUser.email
      }
    });

    blockchain.logEvent('PERMISSION_CHANGE', adminUser.id, {
      action: 'update_permissions',
      targetUser: userId,
      targetEmail: user.email,
      changedBy: adminUser.email,
      oldPermissions,
      newPermissions: permissions,
      timestamp: new Date().toISOString()
    });

    const notified = emitToUser(userId, 'permissions_updated', {
      permissions,
      updatedBy: `${adminUser.firstName} ${adminUser.lastName}`,
      timestamp: new Date().toISOString(),
      message: 'Your permissions have been updated'
    });

    console.log(`✅ Permissions updated - WebSocket: ${notified ? 'SENT' : 'User offline'}`);

    res.json({
      success: true,
      message: 'Permissions updated successfully',
      realTimeUpdate: notified,
      data: {
        userId: user.id,
        email: user.email,
        permissions: user.permissions
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating permissions'
    });
  }
};

exports.revokePermission = async (req, res) => {
  try {
    const { userId, permission } = req.body;
    const adminUser = req.user;

    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const oldPermissions = user.permissions || [];
    const newPermissions = oldPermissions.filter(p => p !== permission);

    user.permissions = newPermissions;
    await user.save();

    await AuditLog.create({
      userId: adminUser.id,
      action: 'revoke_permission',
      resource: `user:${userId}`,
      status: 'success',
      ipAddress: req.ip,
      riskScore: 30,
      metadata: {
        targetUser: userId,
        targetEmail: user.email,
        revokedPermission: permission,
        revokedBy: adminUser.email
      }
    });

    blockchain.logEvent('PERMISSION_REVOKED', adminUser.id, {
      action: 'revoke_permission',
      targetUser: userId,
      targetEmail: user.email,
      revokedBy: adminUser.email,
      permission,
      timestamp: new Date().toISOString()
    });

    emitToUser(userId, 'permission_revoked', {
      permission,
      revokedBy: `${adminUser.firstName} ${adminUser.lastName}`,
      timestamp: new Date().toISOString(),
      message: `Permission "${permission}" has been revoked`
    });

    res.json({
      success: true,
      message: 'Permission revoked successfully',
      data: {
        userId: user.id,
        revokedPermission: permission,
        remainingPermissions: newPermissions
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error revoking permission'
    });
  }
};

exports.requestHighSecurityPermission = async (req, res) => {
  try {
    const { targetUserId, permission, reason, classification } = req.body;
    const adminUser = req.user;

    if (adminUser.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can request high-security permissions'
      });
    }

    const request = await HighSecurityRequest.create({
      requestedBy: adminUser.id,
      targetUserId,
      permission,
      reason,
      classification: classification || 'confidential',
      status: 'pending_ceo'
    });

    blockchain.logEvent('HIGH_SECURITY_REQUEST', adminUser.id, {
      targetUserId,
      permission,
      classification,
      requestedBy: adminUser.email,
      timestamp: new Date().toISOString()
    });

    emitToIndustry(adminUser.industry, 'high_security_request', {
      requestId: request.id,
      requestedBy: `${adminUser.firstName} ${adminUser.lastName}`,
      permission,
      classification,
      targetUserId,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'High-security permission request sent to CEO for approval',
      data: request
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating high-security request'
    });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.body;
    const adminUser = req.user;

    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'admin' || user.role === 'ceo') {
      return res.status(403).json({
        success: false,
        message: 'Cannot deactivate admin or CEO users'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    await AuditLog.create({
      userId: adminUser.id,
      action: user.isActive ? 'activate_user' : 'deactivate_user',
      resource: `user:${userId}`,
      status: 'success',
      ipAddress: req.ip,
      metadata: {
        targetUser: userId,
        targetEmail: user.email,
        newStatus: user.isActive
      }
    });

    blockchain.logEvent('USER_STATUS_CHANGE', adminUser.id, {
      action: user.isActive ? 'activate' : 'deactivate',
      targetUser: userId,
      targetEmail: user.email,
      changedBy: adminUser.email
    });

    emitToUser(userId, 'account_status_changed', {
      isActive: user.isActive,
      message: user.isActive ? 'Account activated' : 'Account deactivated',
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'}`,
      data: {
        userId: user.id,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling status'
    });
  }
};

exports.getAdminStats = async (req, res) => {
  try {
    const adminUser = req.user;

    const totalUsers = await User.count({
      where: { industry: adminUser.industry }
    });

    const activeUsers = await User.count({
      where: { 
        industry: adminUser.industry,
        isActive: true
      }
    });

    const recentLogins = await AuditLog.count({
      where: {
        action: 'login',
        createdAt: {
          [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    });

    const highRiskActions = await AuditLog.count({
      where: {
        riskScore: { [Op.gte]: 70 },
        createdAt: {
          [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        recentLogins,
        highRiskActions
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching stats'
    });
  }
};
