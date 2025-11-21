const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
    const { name, age, gender, email, mobile, password } = req.body;

    // Validation
    if (!name || !password) {
        return res.status(400).json({ error: 'Name and password are required' });
    }

    if (!email && !mobile) {
        return res.status(400).json({ error: 'Email or mobile is required' });
    }

    try {
        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Insert user
        const result = await pool.query(
            `INSERT INTO users (name, age, gender, email, mobile, password_hash) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             RETURNING id, name, age, gender, email, mobile, created_at`,
            [name, age || null, gender || null, email || null, mobile || null, passwordHash]
        );

        const user = result.rows[0];

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email, mobile: user.mobile },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user.id,
                name: user.name,
                age: user.age,
                gender: user.gender,
                email: user.email,
                mobile: user.mobile,
                createdAt: user.created_at
            }
        });
    } catch (error) {
        console.error('Registration error:', error);

        if (error.code === '23505') { // Unique violation
            return res.status(409).json({ error: 'Email or mobile already registered' });
        }

        res.status(500).json({ error: 'Failed to register user' });
    }
});

// Login user
router.post('/login', async (req, res) => {
    const { emailOrMobile, password } = req.body;

    if (!emailOrMobile || !password) {
        return res.status(400).json({ error: 'Email/mobile and password are required' });
    }

    try {
        // Find user by email or mobile
        const result = await pool.query(
            `SELECT * FROM users WHERE email = $1 OR mobile = $1`,
            [emailOrMobile]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];

        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email, mobile: user.mobile },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                age: user.age,
                gender: user.gender,
                email: user.email,
                mobile: user.mobile,
                createdAt: user.created_at
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
});

// Get current user info (protected)
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name, age, gender, email, mobile, created_at 
             FROM users WHERE id = $1`,
            [req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user: result.rows[0] });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user info' });
    }
});

module.exports = router;
