-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS eventsphere;

-- Create the user if it doesn't exist
CREATE USER IF NOT EXISTS 'eventsphere'@'%' IDENTIFIED BY 'eventspherepass';

-- Grant all privileges on the eventsphere database to the user
GRANT ALL PRIVILEGES ON eventsphere.* TO 'eventsphere'@'%';

-- Flush privileges to ensure they take effect
FLUSH PRIVILEGES;

-- Use the eventsphere database
USE eventsphere;

-- Log successful initialization
SELECT 'Database and user setup completed successfully!' AS status;
