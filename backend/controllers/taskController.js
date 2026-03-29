const db = require('../models');
const Task = db.Task;
const Hive = db.Hive;

// Create and Save a new Task
exports.createTask = async (req, res) => {
    try {
        const { title, description, due_date, status, hiveId } = req.body;
        const userId = req.userId; // Provided by authJwt middleware

        if (!title) {
            return res.status(400).send({ message: "Content cannot be empty!" });
        }

        const task = await Task.create({
            title,
            description,
            due_date,
            status: status || 'pending',
            hiveId: hiveId || null,
            userId
        });

        // Fetch back with Hive included to return full object immediately
        const createdTask = await Task.findOne({
            where: { id: task.id },
            include: [{ model: db.Hive, as: 'hive', attributes: ['id', 'name'] }]
        });

        res.status(201).send(createdTask);
    } catch (err) {
        res.status(500).send({ message: err.message || "Some error occurred while creating the Task." });
    }
};

// Retrieve all Tasks for the logged-in user
exports.getAllTasks = async (req, res) => {
    try {
        const userId = req.userId;
        const tasks = await Task.findAll({
            where: { userId },
            include: [{ model: db.Hive, as: 'hive', attributes: ['id', 'name'] }],
            order: [['due_date', 'ASC']]
        });
        
        res.status(200).send(tasks);
    } catch (err) {
        res.status(500).send({ message: err.message || "Some error occurred while retrieving tasks." });
    }
};

// Update a Task by the id in the request
exports.updateTask = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.userId;

        const [updated] = await Task.update(req.body, {
            where: { id: id, userId: userId }
        });

        if (updated) {
            const updatedTask = await Task.findOne({ 
                where: { id: id },
                include: [{ model: db.Hive, as: 'hive', attributes: ['id', 'name'] }]
            });
            res.status(200).send(updatedTask);
        } else {
            res.status(404).send({ message: `Cannot update Task with id=${id}. Maybe Task was not found or req.body is empty!` });
        }
    } catch (err) {
        res.status(500).send({ message: "Error updating Task with id=" + req.params.id });
    }
};

// Delete a Task
exports.deleteTask = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.userId;

        const deleted = await Task.destroy({
            where: { id: id, userId: userId }
        });

        if (deleted) {
            res.status(200).send({ message: "Task was deleted successfully!" });
        } else {
            res.status(404).send({ message: `Cannot delete Task with id=${id}. Maybe Task was not found!` });
        }
    } catch (err) {
        res.status(500).send({ message: "Could not delete Task with id=" + req.params.id });
    }
};
