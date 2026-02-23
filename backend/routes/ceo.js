const express = require('express');
const router = express.Router();
const HighSecurityRequest = require('../models/HighSecurityRequest');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');
const { emitToUser } = require('../services/socket/socketService');
const blockchain = require('../services/blockchain/blockchainService');

router.use(authenticate);
router.use(authorize('ceo'));

router.get('/high-security-requests', async (req, res) => {
  try {
    const ceoUser = req.user;

    const requests = await HighSecurityRequest.findAll({
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'firstName', 'lastName', 'email', 'role']
        },
        {
          model: User,
          as: 'targetUser',
          attributes: ['id', 'firstName', 'lastName', 'email', 'role']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    const industryRequests = requests.filter(r => 
      r.requester.industry === ceoUser.industry || 
      r.targetUser.industry === ceoUser.industry
    );

    res.json({
      success: true,
      data: industryRequests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching requests'
    });
  }
});

router.post('/approve-high-security/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action, notes } = req.body;
    const ceoUser = req.user;

    const request = await HighSecurityRequest.findByPk(requestId, {
      include: [
        { model: User, as: 'requester' },
        { model: User, as: 'targetUser' }
      ]
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    if (action === 'approve') {
      request.status = 'approved';
      request.ceoApprovedBy = ceoUser.id;
      request.ceoApprovedAt = new Date();
      request.ceoNotes = notes;
      await request.save();

      const targetUser = await User.findByPk(request.targetUserId);
      const currentPermissions = targetUser.permissions || [];
      
      if (!currentPermissions.includes(request.permission)) {
        targetUser.permissions = [...currentPermissions, request.permission];
        await targetUser.save();

        emitToUser(targetUser.id, 'high_security_granted', {
          permission: request.permission,
          grantedBy: `CEO ${ceoUser.firstName} ${ceoUser.lastName}`,
          timestamp: new Date().toISOString()
        });
      }

      emitToUser(request.requestedBy, 'high_security_approved', {
        permission: request.permission,
        targetUser: `${targetUser.firstName} ${targetUser.lastName}`,
        timestamp: new Date().toISOString()
      });

      blockchain.logEvent('HIGH_SECURITY_APPROVED', ceoUser.id, {
        requestId,
        permission: request.permission,
        targetUserId: request.targetUserId,
        requestedBy: request.requester.email,
        approvedBy: ceoUser.email,
        classification: request.classification
      });

    } else {
      request.status = 'rejected';
      request.ceoApprovedBy = ceoUser.id;
      request.ceoApprovedAt = new Date();
      request.ceoNotes = notes;
      await request.save();

      emitToUser(request.requestedBy, 'high_security_rejected', {
        permission: request.permission,
        reason: notes,
        timestamp: new Date().toISOString()
      });

      blockchain.logEvent('HIGH_SECURITY_REJECTED', ceoUser.id, {
        requestId,
        permission: request.permission,
        rejectedBy: ceoUser.email,
        reason: notes
      });
    }

    res.json({
      success: true,
      message: `High-security request ${action}d successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing request'
    });
  }
});

module.exports = router;
