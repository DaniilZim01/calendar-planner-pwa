-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create index on email
CREATE INDEX IF NOT EXISTS email_idx ON users(email);
CREATE INDEX IF NOT EXISTS phone_idx ON users(phone);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority INTEGER DEFAULT 1,
  status VARCHAR(50) DEFAULT 'pending',
  due_date DATE,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- User Tasks (many-to-many relationship)
CREATE TABLE IF NOT EXISTS user_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, task_id)
);

-- Periods table
CREATE TABLE IF NOT EXISTS periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  type VARCHAR(50) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  location VARCHAR(255),
  is_all_day BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Wellbeing data table
CREATE TABLE IF NOT EXISTS wellbeing_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  sleep_hours DECIMAL(3,1),
  mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 10),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, date)
);

-- Add comments for documentation
COMMENT ON TABLE users IS 'User accounts and authentication data';
COMMENT ON TABLE tasks IS 'General tasks that can be assigned to users';
COMMENT ON TABLE user_tasks IS 'Many-to-many relationship between users and tasks';
COMMENT ON TABLE periods IS 'User-specific periods (menstrual cycles, etc.)';
COMMENT ON TABLE events IS 'Calendar events for users';
COMMENT ON TABLE wellbeing_data IS 'Daily wellbeing tracking data for users'; 