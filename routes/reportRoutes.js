const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.get('/', requireAuth, reportController.getReports);
router.get('/:id', requireAuth, reportController.getReportById);
router.post('/', requireAuth, reportController.submitReport);
router.put('/:id', requireAuth, reportController.editReport);
router.delete('/:id', requireAuth, reportController.deleteReport);

router.patch('/:id/approve', requireAuth, requireAdmin, reportController.approveReport);

module.exports = router;
