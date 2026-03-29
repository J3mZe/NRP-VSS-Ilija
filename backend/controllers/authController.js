const db = require('../models');
const User = db.User;
const config = require('../config/config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

let transporter;
async function initTransporter() {
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_PORT == 465,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
        console.log("Using real SMTP transport for emails.");
    } else {
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: testAccount.smtp.host,
            port: testAccount.smtp.port,
            secure: testAccount.smtp.secure,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        });
        console.log("SMTP variables not set. Using Ethereal Email simulator for testing.");
    }
}
initTransporter();

exports.register = async (req, res) => {
    try {
        const { username, email, password, role, first_name, last_name } = req.body;

        if (!username || !email || !password) {
            return res.status(400).send({ message: "Content can not be empty!" });
        }

        const existingUser = await User.findOne({
            where: {
                [db.Sequelize.Op.or]: [{ username: username }, { email: email }]
            }
        });

        if (existingUser) {
            return res.status(400).send({ message: "Username ali Email že obstaja!" });
        }

        const password_hash = bcrypt.hashSync(password, 8);
        const verificationToken = crypto.randomBytes(32).toString('hex');

        const user = await User.create({
            username,
            email,
            password_hash,
            role: role || 'beekeeper',
            first_name: first_name || null,
            last_name: last_name || null,
            is_verified: true, // TEMPORARILY SET TO TRUE: User requested to bypass email verification
            verification_token: verificationToken
        });

        /* === EMAIL VERIFICATION TEMPORARILY DISABLED ===
        const verificationLink = `http://localhost:3000/api/auth/verify/${verificationToken}`;
        
        try {
            const info = await transporter.sendMail({
                from: '"MojČebelar Ekipa" <noreply@mojcebelar.si>',
                to: user.email,
                subject: "Dobrodošli! Potrdite svoj e-poštni naslov",
                ...
            });
        } catch (mailError) {
            console.error(mailError);
        }
        */

        res.send({ message: "Registracija uspešna. Uporabnik je avtomatično preverjen (email izklopljen)." });

    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        
        const user = await User.findOne({ where: { verification_token: token } });
        if (!user) {
            return res.status(400).send("Neveljaven ali potekel žeton za potrditev.");
        }
        
        await user.update({
            is_verified: true,
            verification_token: null
        });
        
        res.redirect("http://localhost:5173/login?verified=true");
    } catch (err) {
        res.status(500).send("Prišlo je do napake pri potrditvi emaila.");
    }
};

exports.login = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        const loginIdentifier = email || username;

        if (!loginIdentifier || !password) {
            return res.status(400).send({ message: "Content can not be empty!" });
        }

        const user = await User.findOne({
            where: {
                [db.Sequelize.Op.or]: [{ username: loginIdentifier }, { email: loginIdentifier }]
            }
        });

        if (!user) {
            return res.status(404).send({ message: "Uporabnik ne obstaja." });
        }

        if (!user.is_verified) {
            return res.status(403).send({
                accessToken: null,
                message: "Prosimo, potrdite svoj e-poštni naslov preko poslane povezave preden se prijavite."
            });
        }

        const passwordIsValid = bcrypt.compareSync(password, user.password_hash);

        if (!passwordIsValid) {
            return res.status(401).send({
                accessToken: null,
                message: "Napačno geslo!"
            });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: 86400
        });

        res.status(200).send({
            id: user.id,
            username: user.username,
            email: user.email,
            roles: user.role,
            accessToken: token
        });

    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};
