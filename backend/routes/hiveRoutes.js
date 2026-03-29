const express = require('express');
const router = express.Router();
const hiveController = require('../controllers/hiveController');
const { verifyToken } = require('../middleware/authMiddleware');

// Apply authentication middleware to all hive routes
router.use(verifyToken);

// Hive CRUD Routes
router.post('/', hiveController.createHive);
router.get('/', hiveController.getAllHives);
router.get('/:id', hiveController.getHiveById);
router.post('/:id/records', hiveController.addRecord);
router.put('/:id', hiveController.updateHive);
router.delete('/:id', hiveController.deleteHive);

module.exports = router;
