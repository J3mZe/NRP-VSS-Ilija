const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.use(function (req, res, next) {
    res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
    );
    next();
});

router.post("/register", controller.register);
router.post("/login", controller.login);
router.get("/verify/:token", controller.verifyEmail);

// Example protected route
router.get("/admin", [verifyToken, isAdmin], (req, res) => {
    res.status(200).send("Admin Content.");
});

module.exports = router;
