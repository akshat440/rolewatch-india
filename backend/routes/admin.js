const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize('admin', 'ceo'));

router.get('/users', adminController.getAllUsers);
router.post('/update-permissions', adminController.updatePermissions);
router.post('/revoke-permission', adminController.revokePermission);
router.post('/request-high-security', adminController.requestHighSecurityPermission);
router.post('/toggle-user-status', adminController.toggleUserStatus);
router.get('/stats', adminController.getAdminStats);

module.exports = router;
