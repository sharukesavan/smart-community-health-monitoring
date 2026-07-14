const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.get('/', alertController.getAlerts);
router.patch('/:id/resolve', requireAuth, requireAdmin, alertController.resolveAlert);

module.exports = router;
