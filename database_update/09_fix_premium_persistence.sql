-- database_update/09_fix_premium_persistence.sql
-- Ensure users table has premium_until column and is correctly indexed
ALTER TABLE users MODIFY COLUMN premium_until DATETIME NULL;
CREATE INDEX idx_premium_until ON users(premium_until);
