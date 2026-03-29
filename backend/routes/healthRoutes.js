const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/overview', healthController.getOverview);
router.get('/trend', healthController.getTrend);
router.get('/hives/:id', healthController.getHiveHealth);
router.get('/varroa/:hiveId', healthController.getVarroaRisk);

module.exports = router;
