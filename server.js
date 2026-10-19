const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initializeDatabase } = require('./config/database');
const authRoutes = require('./routes/auth');
const workoutRoutes = require('./routes/workouts');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const configuredOrigins = (process.env.FRONTEND_URL || process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
const allowedOrigins = process.env.NODE_ENV === 'production'
    ? configuredOrigins
    : [...configuredOrigins, 'http://localhost:3000', 'http://localhost:3001'];

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(express.json({ limit: '1mb' }));

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Routes
app.get('/', (req, res) => {
    res.json({
        message: 'Play Tracker API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            workouts: '/api/workouts'
        }
    });
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Initialize database and start server
async function startServer() {
    try {
        if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
            throw new Error('JWT_SECRET must be configured with at least 32 characters');
        }
        if (process.env.NODE_ENV === 'production' && allowedOrigins.length === 0) {
            throw new Error('FRONTEND_URL must be configured in production');
        }

        await initializeDatabase();
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📍 Environment: ${process.env.NODE_ENV}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
