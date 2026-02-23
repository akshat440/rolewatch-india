const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/login', authController.login);
router.get('/users-by-industry/:industry', authController.getUsersByIndustry);
router.post('/enroll-biometric', authenticate, authController.enrollBiometric);

module.exports = router;
