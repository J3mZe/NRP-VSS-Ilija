const db = require('../models');
const { Op } = require('sequelize');

exports.getDashboardStats = async (req, res) => {
    try {
        const userId = req.userId;

        // 1. Active Hives Count
        const activeHivesCount = await db.Hive.count({
            where: {
                userId,
                status: 'Aktivno'
            }
        });

        // 2. Upcoming Tasks (Pending or Today)
        const upcomingTasks = await db.Task.findAll({
            where: {
                userId,
                status: { [Op.in]: ['pending', 'today'] }
            },
            include: [{ model: db.Hive, as: 'hive', attributes: ['id', 'name', 'location'] }],
            order: [['createdAt', 'DESC']],
            limit: 5
        });

        // 3. Warnings (Hives with weight < 15)
        const warnings = await db.Hive.findAll({
            where: {
                userId,
                weight: { [Op.lt]: 15 }
            },
            attributes: ['id', 'name', 'weight']
        });

        // 4. Recent Activities 
        // We will fetch the 5 most recently created/updated Tasks and HealthRecords
        const recentTasks = await db.Task.findAll({
            where: { userId, status: 'completed' },
            include: [{ model: db.Hive, as: 'hive', attributes: ['id', 'name'] }],
            order: [['updatedAt', 'DESC']],
            limit: 5
        });

        const recentRecords = await db.HealthRecord.findAll({
            include: [{ 
                model: db.Hive, 
                as: 'hive', 
                where: { userId }, // Filter through hive's userId
                attributes: ['id', 'name'] 
            }],
            order: [['createdAt', 'DESC']],
            limit: 5
        });

        // Combine and sort recent activities by date
        const mappedTasks = recentTasks.map(t => ({
            id: `task-${t.id}`,
            type: 'task',
            title: t.title,
            description: t.description,
            hiveName: t.hive ? t.hive.name : 'Splošno',
            date: t.updatedAt
        }));

        const mappedRecords = recentRecords.map(r => ({
            id: `record-${r.id}`,
            type: 'record',
            title: `Zdravstveni zapis: ${r.health_status}`,
            description: r.notes || "Dodan nov zdravstveni pregled.",
            hiveName: r.hive ? r.hive.name : 'Neznano',
            date: r.createdAt
        }));

        const combinedActivities = [...mappedTasks, ...mappedRecords]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5); // Take top 5 recent

        // Extract unique locations from all hives for weather widget
        const allHives = await db.Hive.findAll({
            where: { userId },
            attributes: ['location']
        });
        const locations = [...new Set(allHives.map(h => h.location).filter(Boolean))];

        res.status(200).json({
            activeHivesCount,
            upcomingTasks,
            warnings,
            recentActivities: combinedActivities,
            locations: locations.length > 0 ? locations : ['Ljubljana'] // Default fallback
        });

    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
