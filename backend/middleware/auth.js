const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const blockchain = require('../services/blockchain/blockchainService');
const aiDetectionService = require('../services/ai/aiDetectionService');

exports.authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      // Log unauthorized access attempt to blockchain
      blockchain.logEvent('ACCESS_DENIED', req.user.id, {
        attemptedRole: roles,
        userRole: req.user.role,
        email: req.user.email,
        resource: req.path,
        timestamp: new Date().toISOString()
      });

      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    next();
  };
};

exports.checkPermission = (permission) => {
  return async (req, res, next) => {
    const user = req.user;
    
    if (user.role === 'admin') {
      return next();
    }

    if (!user.permissions || !user.permissions.includes(permission)) {
      // Log permission denial to blockchain
      blockchain.logEvent('PERMISSION_DENIED', user.id, {
        requiredPermission: permission,
        userPermissions: user.permissions,
        email: user.email,
        resource: req.path,
        timestamp: new Date().toISOString()
      });

      // Log to audit
      await AuditLog.create({
        userId: user.id,
        action: 'access_denied',
        resource: req.path,
        status: 'denied',
        ipAddress: req.ip,
        riskScore: 50,
        metadata: {
          requiredPermission: permission,
          reason: 'insufficient_permissions'
        }
      });

      // Monitor with AI
      await aiDetectionService.monitorUserActivity(
        user.id,
        'access_denied',
        req.path,
        req.ip,
        req.get('user-agent')
      );

      return res.status(403).json({
        success: false,
        message: `Permission required: ${permission}`
      });
    }

    next();
  };
};
