const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);
router.get('/annual', reportController.getAnnualReport);
router.get('/health', reportController.getHealthReport);
router.get('/honey-reserves', reportController.getHoneyReservesOverview);
router.get('/honey-reserves/:hiveId/trend', reportController.getHoneyReservesTrend);

module.exports = router;
