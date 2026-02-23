const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false
  },
  resource: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.ENUM('success', 'denied', 'failed'),
    defaultValue: 'success'
  },
  ipAddress: {
    type: DataTypes.STRING
  },
  location: {
    type: DataTypes.STRING
  },
  device: {
    type: DataTypes.STRING
  },
  riskScore: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'audit_logs',
  timestamps: true
});

// Define association
AuditLog.associate = (models) => {
  AuditLog.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });
};

module.exports = AuditLog;
