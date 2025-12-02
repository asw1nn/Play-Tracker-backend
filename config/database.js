const { Pool } = require('pg');
require('dotenv').config();

// Create PostgreSQL connection pool
const pool = new Pool({
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
    console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('❌ Unexpected error on idle client', err);
    process.exit(-1);
});

// Initialize database schema
async function initializeDatabase() {
    const client = await pool.connect();
    try {
        const fs = require('fs');
        const path = require('path');
        const migrationsDir = path.join(__dirname, '../migrations');

        // Read all files in migrations directory
        const files = fs.readdirSync(migrationsDir)
            .filter(file => file.endsWith('.sql'))
            .sort(); // Ensure they run in order

        for (const file of files) {
            console.log(`Executing migration: ${file}`);
            const migrationSQL = fs.readFileSync(
                path.join(migrationsDir, file),
                'utf8'
            );
            await client.query(migrationSQL);
        }

        console.log('✅ All database migrations executed successfully');
    } catch (error) {
        console.error('❌ Error initializing database:', error);
        throw error;
    } finally {
        client.release();
    }
}

module.exports = { pool, initializeDatabase };
