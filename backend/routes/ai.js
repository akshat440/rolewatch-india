const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticate, checkPermission } = require('../middleware/auth');

router.use(authenticate);

router.get('/user/:userId/risk-profile', aiController.getUserRiskProfile);
router.get('/anomalies', checkPermission('view_all'), aiController.getSystemAnomalies);

module.exports = router;
