const db = require('../models');
const Hive = db.Hive;

// Create and Save a new Hive
exports.createHive = async (req, res) => {
    try {
        const { name, location, type, queen_age, strength, weight, status, notes } = req.body;
        const userId = req.userId; // Provided by authJwt middleware

        if (!name) {
            return res.status(400).send({ message: "Name can not be empty!" });
        }

        const hive = await Hive.create({
            name,
            location,
            type,
            queen_age,
            strength,
            weight,
            status: status || 'Aktivno',
            notes,
            userId
        });

        res.status(201).send(hive);
    } catch (err) {
        res.status(500).send({ message: err.message || "Some error occurred while creating the Hive." });
    }
};

// Retrieve all Hives for the logged-in user
exports.getAllHives = async (req, res) => {
    try {
        const userId = req.userId;
        const hives = await Hive.findAll({
            where: { userId },
            include: [{ model: db.HealthRecord, as: 'healthRecords' }],
            order: [['createdAt', 'DESC']]
        });
        
        res.status(200).send(hives);
    } catch (err) {
        res.status(500).send({ message: err.message || "Some error occurred while retrieving hives." });
    }
};

// Find a single Hive with an id
exports.getHiveById = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.userId;

        const hive = await Hive.findOne({
            where: { id: id, userId: userId },
            include: [{ model: db.HealthRecord, as: 'healthRecords' }]
        });

        if (hive) {
            res.status(200).send(hive);
        } else {
            res.status(404).send({ message: `Cannot find Hive with id=${id}.` });
        }
    } catch (err) {
        res.status(500).send({ message: "Error retrieving Hive with id=" + req.params.id });
    }
};

// Add a Health Record to a Hive
exports.addRecord = async (req, res) => {
    try {
        const hiveId = req.params.id;
        const { notes, status, disease_name } = req.body;
        const userId = req.userId;

        // Verify hive exists and belongs to user
        const hive = await Hive.findOne({ where: { id: hiveId, userId } });
        if (!hive) return res.status(404).send({ message: "Hive not found." });

        const record = await db.HealthRecord.create({
            inspection_date: new Date(),
            disease_name,
            status,
            notes,
            hiveId
        });

        res.status(201).send(record);
    } catch (err) {
        res.status(500).send({ message: "Error adding record" });
    }
};

// Update a Hive by the id in the request
exports.updateHive = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.userId;

        const [updated] = await Hive.update(req.body, {
            where: { id: id, userId: userId }
        });

        if (updated) {
            const updatedHive = await Hive.findByPk(id);
            res.status(200).send(updatedHive);
        } else {
            res.status(404).send({ message: `Cannot update Hive with id=${id}. Maybe Hive was not found or req.body is empty!` });
        }
    } catch (err) {
        res.status(500).send({ message: "Error updating Hive with id=" + req.params.id });
    }
};

// Delete a Hive with the specified id in the request
exports.deleteHive = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.userId;

        const deleted = await Hive.destroy({
            where: { id: id, userId: userId }
        });

        if (deleted) {
            res.status(200).send({ message: "Hive was deleted successfully!" });
        } else {
            res.status(404).send({ message: `Cannot delete Hive with id=${id}. Maybe Hive was not found!` });
        }
    } catch (err) {
        res.status(500).send({ message: "Could not delete Hive with id=" + req.params.id });
    }
};
