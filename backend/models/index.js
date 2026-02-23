const User = require('./User');
const AuditLog = require('./AuditLog');
const PermissionRequest = require('./PermissionRequest');
const HighSecurityRequest = require('./HighSecurityRequest');

User.hasMany(AuditLog, { foreignKey: 'userId', as: 'auditLogs' });
AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(PermissionRequest, { foreignKey: 'userId', as: 'permissionRequests' });
PermissionRequest.belongsTo(User, { foreignKey: 'userId', as: 'user' });
PermissionRequest.belongsTo(User, { foreignKey: 'reviewedBy', as: 'reviewer' });

User.hasMany(HighSecurityRequest, { foreignKey: 'requestedBy', as: 'highSecurityRequests' });
HighSecurityRequest.belongsTo(User, { foreignKey: 'requestedBy', as: 'requester' });
HighSecurityRequest.belongsTo(User, { foreignKey: 'targetUserId', as: 'targetUser' });
HighSecurityRequest.belongsTo(User, { foreignKey: 'ceoApprovedBy', as: 'ceoApprover' });

module.exports = {
  User,
  AuditLog,
  PermissionRequest,
  HighSecurityRequest
};
