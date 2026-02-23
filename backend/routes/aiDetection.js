const express = require('express');
const router = express.Router();
const aiDetectionService = require('../services/ai/aiDetectionService');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/activity-feed', authorize('admin'), async (req, res) => {
  try {
    const { industry } = req.user;
    const activities = await aiDetectionService.getRealtimeActivityFeed(industry);

    res.json({
      success: true,
      data: activities,
      count: activities.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching activity feed'
    });
  }
});

router.get('/security-alerts', authorize('admin'), async (req, res) => {
  try {
    const { industry } = req.user;
    const { hours = 24 } = req.query;
    
    const alerts = await aiDetectionService.getSecurityAlerts(industry, parseInt(hours));

    res.json({
      success: true,
      data: alerts,
      count: alerts.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching alerts'
    });
  }
});

router.get('/user/:userId/risk-profile', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const baseline = await aiDetectionService.calculateBehavioralBaseline(userId);
    
    res.json({
      success: true,
      data: baseline
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching risk profile'
    });
  }
});

module.exports = router;
