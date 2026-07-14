const express = require('express');
const router = express.Router();
const villageController = require('../controllers/villageController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.get('/', villageController.getVillages);
router.get('/locations', requireAuth, villageController.getLocations);

router.post('/', requireAuth, requireAdmin, villageController.addVillage);
router.put('/:id', requireAuth, requireAdmin, villageController.editVillage);
router.delete('/:id', requireAuth, requireAdmin, villageController.deleteVillage);

module.exports = router;
