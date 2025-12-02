-- Add name column to workouts table
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS name VARCHAR(255) DEFAULT 'Workout Session';
