const db = require('../models');

exports.getProfile = async (req, res) => {
    try {
        const user = await db.User.findByPk(req.userId, {
            attributes: { exclude: ['password_hash'] } // Secure stripping out of encrypted credentials
        });
        if (!user) return res.status(404).json({ error: "User profile not found." });
        res.status(200).json(user);
    } catch (e) {
        console.error("Profile GET Error:", e);
        res.status(500).json({ error: e.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const user = await db.User.findByPk(req.userId);
        if (!user) return res.status(404).json({ error: "User profile not found." });

        const {
            first_name,
            last_name,
            email,
            phone,
            hive_type,
            ai_alarms,
            disease_detection,
            email_notifications,
            sms_alerts,
            ai_language,
            avatar_url
        } = req.body;

        // Perform safe update mapping
        await user.update({
            first_name: first_name !== undefined ? first_name : user.first_name,
            last_name: last_name !== undefined ? last_name : user.last_name,
            email: email !== undefined ? email : user.email,
            phone: phone !== undefined ? phone : user.phone,
            hive_type: hive_type !== undefined ? hive_type : user.hive_type,
            ai_alarms: ai_alarms !== undefined ? ai_alarms : user.ai_alarms,
            disease_detection: disease_detection !== undefined ? disease_detection : user.disease_detection,
            email_notifications: email_notifications !== undefined ? email_notifications : user.email_notifications,
            sms_alerts: sms_alerts !== undefined ? sms_alerts : user.sms_alerts,
            ai_language: ai_language !== undefined ? ai_language : user.ai_language,
            avatar_url: avatar_url !== undefined ? avatar_url : user.avatar_url
        });

        res.status(200).json({ message: "Profile updated successfully!", user });
    } catch (e) {
        console.error("Profile PUT Error:", e);
        res.status(500).json({ error: e.message });
    }
};
