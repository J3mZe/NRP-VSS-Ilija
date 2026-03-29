const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);
router.post('/ask', aiController.askAI);

module.exports = router;
