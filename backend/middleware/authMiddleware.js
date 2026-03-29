const jwt = require('jsonwebtoken');
const { User } = require('../models');

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).send({ message: 'No token provided!' });
    }

    // Bearer <token>
    const bearer = token.split(' ');
    const bearerToken = bearer[1];

    jwt.verify(bearerToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: 'Unauthorized!' });
        }
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    });
};

const isAdmin = (req, res, next) => {
    User.findByPk(req.userId).then(user => {
        if (user.role === 'admin') {
            next();
            return;
        }
        res.status(403).send({ message: 'Require Admin Role!' });
    });
};

const isBeekeeper = (req, res, next) => {
    User.findByPk(req.userId).then(user => {
        if (user.role === 'beekeeper' || user.role === 'admin') {
            next();
            return;
        }
        res.status(403).send({ message: 'Require Beekeeper Role!' });
    });
};

module.exports = {
    verifyToken,
    isAdmin,
    isBeekeeper
};
