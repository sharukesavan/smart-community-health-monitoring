const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.get('/workers', requireAuth, requireAdmin, userController.getWorkers);
router.post('/workers', requireAuth, requireAdmin, userController.addWorker);
router.put('/workers/:id', requireAuth, requireAdmin, userController.editWorker);
router.delete('/workers/:id', requireAuth, requireAdmin, userController.deleteWorker);

module.exports = router;
