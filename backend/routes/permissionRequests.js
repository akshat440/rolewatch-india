const express = require('express');
const router = express.Router();
const PermissionRequest = require('../models/PermissionRequest');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { authenticate, authorize } = require('../middleware/auth');
const { emitToUser, emitToIndustry } = require('../services/socket/socketService');

// User creates a permission request
router.post('/create', authenticate, async (req, res) => {
  try {
    const { requestedPermission, resourceName, reason } = req.body;
    const user = req.user;

    // Create request
    const request = await PermissionRequest.create({
      userId: user.id,
      requestedPermission,
      resourceName,
      reason,
      status: 'pending'
    });

    // Log the request
    await AuditLog.create({
      userId: user.id,
      action: 'permission_request_created',
      resource: resourceName,
      status: 'success',
      ipAddress: req.ip,
      metadata: {
        requestId: request.id,
        requestedPermission,
        reason
      }
    });

    // Notify all admins in the same industry via WebSocket
    emitToIndustry(user.industry, 'new_permission_request', {
      requestId: request.id,
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      userEmail: user.email,
      requestedPermission,
      resourceName,
      reason,
      timestamp: new Date().toISOString()
    });

    console.log(`📩 Permission request created by ${user.email} for ${requestedPermission}`);

    res.json({
      success: true,
      message: 'Permission request sent to administrator',
      data: request
    });

  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating permission request'
    });
  }
});

// Get user's own requests
router.get('/my-requests', authenticate, async (req, res) => {
  try {
    const requests = await PermissionRequest.findAll({
      where: { userId: req.user.id },
      include: [{
        model: User,
        as: 'reviewer',
        attributes: ['firstName', 'lastName', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: requests
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching requests'
    });
  }
});

// Admin: Get all pending requests for their industry
router.get('/pending', authenticate, authorize('admin'), async (req, res) => {
  try {
    const admin = req.user;

    // Get all users in admin's industry
    const industryUsers = await User.findAll({
      where: { industry: admin.industry },
      attributes: ['id']
    });

    const userIds = industryUsers.map(u => u.id);

    const requests = await PermissionRequest.findAll({
      where: {
        userId: userIds,
        status: 'pending'
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'userId', 'firstName', 'lastName', 'email', 'role', 'department']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: requests,
      count: requests.length
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending requests'
    });
  }
});

// Admin: Approve or reject request
router.post('/review/:requestId', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action, notes } = req.body; // action: 'approve' or 'reject'
    const admin = req.user;

    const request = await PermissionRequest.findByPk(requestId, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email', 'permissions']
      }]
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Request already reviewed'
      });
    }

    // Update request
    request.status = action === 'approve' ? 'approved' : 'rejected';
    request.reviewedBy = admin.id;
    request.reviewedAt = new Date();
    request.reviewNotes = notes;
    await request.save();

    // If approved, grant the permission
    if (action === 'approve') {
      const user = request.user;
      const currentPermissions = user.permissions || [];
      
      if (!currentPermissions.includes(request.requestedPermission)) {
        user.permissions = [...currentPermissions, request.requestedPermission];
        await user.save();

        // Notify user via WebSocket
        emitToUser(user.id, 'permission_granted', {
          permission: request.requestedPermission,
          resourceName: request.resourceName,
          grantedBy: `${admin.firstName} ${admin.lastName}`,
          timestamp: new Date().toISOString(),
          message: `Your request for "${request.resourceName}" has been approved!`
        });
      }
    } else {
      // Notify user of rejection
      emitToUser(request.user.id, 'permission_rejected', {
        permission: request.requestedPermission,
        resourceName: request.resourceName,
        rejectedBy: `${admin.firstName} ${admin.lastName}`,
        reason: notes,
        timestamp: new Date().toISOString(),
        message: `Your request for "${request.resourceName}" was rejected`
      });
    }

    // Log the review
    await AuditLog.create({
      userId: admin.id,
      action: `permission_request_${action}d`,
      resource: request.resourceName,
      status: 'success',
      ipAddress: req.ip,
      metadata: {
        requestId: request.id,
        targetUser: request.userId,
        permission: request.requestedPermission,
        notes
      }
    });

    console.log(`✅ Request ${action}d by ${admin.email} for user ${request.user.email}`);

    res.json({
      success: true,
      message: `Request ${action}d successfully`,
      data: request
    });

  } catch (error) {
    console.error('Error reviewing request:', error);
    res.status(500).json({
      success: false,
      message: 'Error reviewing request'
    });
  }
});

// Admin: Get all requests (history)
router.get('/all', authenticate, authorize('admin'), async (req, res) => {
  try {
    const admin = req.user;

    const industryUsers = await User.findAll({
      where: { industry: admin.industry },
      attributes: ['id']
    });

    const userIds = industryUsers.map(u => u.id);

    const requests = await PermissionRequest.findAll({
      where: { userId: userIds },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'userId', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'reviewer',
          attributes: ['firstName', 'lastName', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 100
    });

    res.json({
      success: true,
      data: requests
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching requests'
    });
  }
});

module.exports = router;
