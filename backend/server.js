const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const sequelize = require('./config/database');
const { initializeSocket } = require('./services/socket/socketService');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

const io = initializeSocket(server);
require('./models');

app.use(helmet());
app.use(cors({ 
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true 
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const auditRoutes = require('./routes/audit');
const adminRoutes = require('./routes/admin');
const aiRoutes = require('./routes/ai');
const aiDetectionRoutes = require('./routes/aiDetection');
const blockchainRoutes = require('./routes/blockchain');
const accessRoutes = require('./routes/access');
const permissionRequestRoutes = require('./routes/permissionRequests');
const ceoRoutes = require('./routes/ceo');

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/ai-detection', aiDetectionRoutes);
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/access', accessRoutes);
app.use('/api/permission-requests', permissionRequestRoutes);
app.use('/api/ceo', ceoRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({
    message: 'RoleWatch India - Enterprise System v3.0',
    features: ['Real-Time AI Detection', 'Blockchain', 'Biometric', 'RBAC']
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connected');
    
    server.listen(PORT, () => {
      console.log(`
╔══════════════════════════════════════════════════════════╗
║  RoleWatch India - Enterprise System v3.0                ║
╚══════════════════════════════════════════════════════════╝

✅ Real-Time AI Detection
✅ Live Activity Monitoring
✅ Security Alerts
✅ Blockchain Logging
✅ All Industries Supported

Port: ${PORT}
      `);
    });
  })
  .catch(err => {
    console.error('❌ Database failed:', err);
    process.exit(1);
  });

module.exports = app;
