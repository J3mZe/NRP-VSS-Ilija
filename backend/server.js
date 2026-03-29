const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
// const db = require('./models');

process.on('exit', (code) => console.log(`Node Process gracefully exiting with code: ${code}`));
process.on('uncaughtException', (err) => console.error('FATAL UNCAUGHT EXCEPTION:', err));
process.on('unhandledRejection', (reason) => console.error('FATAL UNHANDLED REJECTION:', reason));
require('dotenv').config();

const app = express();

const corsOptions = {
    origin: ["http://localhost:5173", "http://localhost:8081"] // Added React frontend port
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan('combined'));

// parse requests of content-type - application/json
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// database sync
// In production, use migrations instead of sync()
// db.sequelize.sync(); 

// simple route
app.get("/", (req, res) => {
    res.json({ message: "Welcome to MojČebelar API application." });
});

// routes
const authRoutes = require('./routes/authRoutes');
const hiveRoutes = require('./routes/hiveRoutes');
const taskRoutes = require('./routes/taskRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const healthRoutes = require('./routes/healthRoutes');
const reportRoutes = require('./routes/reportRoutes');
const aiRoutes = require('./routes/aiRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/hives', hiveRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/users', userRoutes);

// set port, listen for requests
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}.`);
});

server.on('error', (err) => {
    console.error('FATAL SERVER ERROR:', err);
});
