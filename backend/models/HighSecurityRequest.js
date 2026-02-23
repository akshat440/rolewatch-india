const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HighSecurityRequest = sequelize.define('HighSecurityRequest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  requestedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  targetUserId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  permission: {
    type: DataTypes.STRING,
    allowNull: false
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  classification: {
    type: DataTypes.ENUM('confidential', 'secret', 'top_secret'),
    defaultValue: 'confidential'
  },
  status: {
    type: DataTypes.ENUM('pending_ceo', 'approved', 'rejected'),
    defaultValue: 'pending_ceo'
  },
  ceoApprovedBy: {
    type: DataTypes.UUID,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  ceoApprovedAt: {
    type: DataTypes.DATE
  },
  ceoNotes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'high_security_requests',
  timestamps: true
});

module.exports = HighSecurityRequest;
