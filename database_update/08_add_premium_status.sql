-- Add premium_until column to users table
ALTER TABLE users ADD COLUMN premium_until DATETIME NULL AFTER role;
