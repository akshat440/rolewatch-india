const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const PROTECTED_RESOURCES = require('../config/protectedResources');
const AuditLog = require('../models/AuditLog');
const blockchain = require('../services/blockchain/blockchainService');
const aiDetectionService = require('../services/ai/aiDetectionService');

router.use(authenticate);

router.post('/check', async (req, res) => {
  try {
    const { resource } = req.body;
    const user = req.user;

    const industryResources = PROTECTED_RESOURCES[user.industry];
    
    if (!industryResources || !industryResources[resource]) {
      return res.json({
        success: false,
        canAccess: false,
        reason: 'Resource not found'
      });
    }

    const resourceConfig = industryResources[resource];
    const hasPermission = user.permissions && 
      user.permissions.includes(resourceConfig.requiredPermission);

    // Determine event type for blockchain
    const eventType = hasPermission ? 'RESOURCE_ACCESSED' : 'ACCESS_DENIED';
    
    // Log to blockchain
    blockchain.logEvent(eventType, user.id, {
      email: user.email,
      role: user.role,
      resource: `${user.industry}:${resource}`,
      resourceName: resourceConfig.name,
      requiredPermission: resourceConfig.requiredPermission,
      hasPermission,
      timestamp: new Date().toISOString()
    });

    // Log to audit
    await AuditLog.create({
      userId: user.id,
      action: hasPermission ? 'resource_access' : 'access_denied',
      resource: `${user.industry}:${resource}`,
      status: hasPermission ? 'success' : 'denied',
      ipAddress: req.ip,
      location: user.city,
      device: req.get('user-agent'),
      riskScore: hasPermission ? 0 : 50,
      metadata: {
        requiredPermission: resourceConfig.requiredPermission,
        userPermissions: user.permissions,
        resourceName: resourceConfig.name
      }
    });

    // AI monitoring
    await aiDetectionService.monitorUserActivity(
      user.id,
      hasPermission ? 'resource_access' : 'access_denied',
      `${user.industry}:${resource}`,
      req.ip,
      req.get('user-agent')
    );

    res.json({
      success: true,
      canAccess: hasPermission,
      resource: resourceConfig,
      reason: hasPermission ? 'Access granted' : `Missing permission: ${resourceConfig.requiredPermission}`
    });

  } catch (error) {
    console.error('Access check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking access'
    });
  }
});

router.get('/resources', async (req, res) => {
  try {
    const user = req.user;
    const industryResources = PROTECTED_RESOURCES[user.industry];

    if (!industryResources) {
      return res.json({
        success: true,
        resources: []
      });
    }

    const resourcesWithAccess = Object.keys(industryResources).map(key => {
      const resource = industryResources[key];
      const hasPermission = user.permissions && 
        user.permissions.includes(resource.requiredPermission);

      return {
        key,
        ...resource,
        canAccess: hasPermission,
        hasPermission: hasPermission,
        userHasPermissions: user.permissions || []
      };
    });

    res.json({
      success: true,
      resources: resourcesWithAccess,
      userRole: user.role,
      industry: user.industry
    });

  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching resources'
    });
  }
});

module.exports = router;
