const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PermissionRequest = sequelize.define('PermissionRequest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  requestedPermission: {
    type: DataTypes.STRING,
    allowNull: false
  },
  resourceName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  reason: {
    type: DataTypes.TEXT
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  reviewedBy: {
    type: DataTypes.UUID,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  reviewedAt: {
    type: DataTypes.DATE
  },
  reviewNotes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'permission_requests',
  timestamps: true
});

module.exports = PermissionRequest;
