const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All workout routes require authentication
router.use(authenticateToken);

// Save a new workout
router.post('/', async (req, res) => {
    const { date, exercises } = req.body;
    const userId = req.user.userId;

    if (!date || !exercises) {
        return res.status(400).json({ error: 'Date and exercises are required' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO workouts (user_id, workout_date, exercises) 
             VALUES ($1, $2, $3) 
             RETURNING *`,
            [userId, date, JSON.stringify(exercises)]
        );

        res.status(201).json({
            message: 'Workout saved successfully',
            workout: {
                id: result.rows[0].id,
                date: result.rows[0].workout_date,
                exercises: result.rows[0].exercises,
                createdAt: result.rows[0].created_at
            }
        });
    } catch (error) {
        console.error('Save workout error:', error);
        res.status(500).json({ error: 'Failed to save workout' });
    }
});

// Get all workouts for the authenticated user
router.get('/', async (req, res) => {
    const userId = req.user.userId;

    try {
        const result = await pool.query(
            `SELECT id, workout_date as date, exercises, created_at 
             FROM workouts 
             WHERE user_id = $1 
             ORDER BY workout_date DESC`,
            [userId]
        );

        res.json({
            workouts: result.rows.map(row => ({
                id: row.id,
                date: row.date,
                exercises: row.exercises,
                createdAt: row.created_at
            }))
        });
    } catch (error) {
        console.error('Get workouts error:', error);
        res.status(500).json({ error: 'Failed to get workouts' });
    }
});

// Get a specific workout
router.get('/:id', async (req, res) => {
    const userId = req.user.userId;
    const workoutId = req.params.id;

    try {
        const result = await pool.query(
            `SELECT id, workout_date as date, exercises, created_at 
             FROM workouts 
             WHERE id = $1 AND user_id = $2`,
            [workoutId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Workout not found' });
        }

        res.json({
            workout: {
                id: result.rows[0].id,
                date: result.rows[0].date,
                exercises: result.rows[0].exercises,
                createdAt: result.rows[0].created_at
            }
        });
    } catch (error) {
        console.error('Get workout error:', error);
        res.status(500).json({ error: 'Failed to get workout' });
    }
});

// Delete a workout
router.delete('/:id', async (req, res) => {
    const userId = req.user.userId;
    const workoutId = req.params.id;

    try {
        const result = await pool.query(
            `DELETE FROM workouts 
             WHERE id = $1 AND user_id = $2 
             RETURNING id`,
            [workoutId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Workout not found' });
        }

        res.json({
            message: 'Workout deleted successfully',
            id: result.rows[0].id
        });
    } catch (error) {
        console.error('Delete workout error:', error);
        res.status(500).json({ error: 'Failed to delete workout' });
    }
});

// Migrate localStorage data to database
router.post('/migrate', async (req, res) => {
    const userId = req.user.userId;
    const { history } = req.body;

    if (!history || !Array.isArray(history)) {
        return res.status(400).json({ error: 'History array is required' });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        let migratedCount = 0;
        for (const workout of history) {
            await client.query(
                `INSERT INTO workouts (user_id, workout_date, exercises) 
                 VALUES ($1, $2, $3)`,
                [userId, workout.date, JSON.stringify(workout.exercises)]
            );
            migratedCount++;
        }

        await client.query('COMMIT');

        res.json({
            message: 'Data migrated successfully',
            migratedCount
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Migration error:', error);
        res.status(500).json({ error: 'Failed to migrate data' });
    } finally {
        client.release();
    }
});

module.exports = router;
