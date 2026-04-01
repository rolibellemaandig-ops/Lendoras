import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME
});

const schema = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  profile_image_url TEXT,
  bio TEXT,
  phone_number VARCHAR(20),
  location VARCHAR(255),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  rating DECIMAL(3, 2) DEFAULT 5.0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Items table
CREATE TABLE IF NOT EXISTS items (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  image_url TEXT,
  location VARCHAR(255),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  available BOOLEAN DEFAULT true,
  daily_price DECIMAL(10, 2),
  condition VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rentals table
CREATE TABLE IF NOT EXISTS rentals (
  id SERIAL PRIMARY KEY,
  item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  lessor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  total_price DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  rental_id INTEGER NOT NULL REFERENCES rentals(id) ON DELETE CASCADE,
  reviewer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Saved Items table
CREATE TABLE IF NOT EXISTS saved_items (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, item_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_items_user_id ON items(user_id);
CREATE INDEX IF NOT EXISTS idx_items_available ON items(available);
CREATE INDEX IF NOT EXISTS idx_rentals_lessor ON rentals(lessor_id);
CREATE INDEX IF NOT EXISTS idx_rentals_tenant ON rentals(tenant_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
`;

async function initializeDatabase() {
  try {
    console.log('🔧 Initializing database schema...');
    
    const statements = schema.split(';').filter(s => s.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await pool.query(statement);
      }
    }
    
    console.log('✓ Database schema initialized successfully');
    
    // Insert sample data
    await insertSampleData();
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  }
}

async function insertSampleData() {
  try {
    console.log('📝 Inserting sample data...');
    
    // Check if users already exist
    const userCheck = await pool.query('SELECT COUNT(*) FROM users');
    if (userCheck.rows[0].count > 0) {
      console.log('✓ Sample data already exists');
      return;
    }

    // Insert sample users
    const users = [
      { username: 'john_doe', email: 'john@example.com', password_hash: 'hashed_pwd', full_name: 'John Doe' },
      { username: 'jane_smith', email: 'jane@example.com', password_hash: 'hashed_pwd', full_name: 'Jane Smith' },
      { username: 'alex_jones', email: 'alex@example.com', password_hash: 'hashed_pwd', full_name: 'Alex Jones' }
    ];

    for (const user of users) {
      await pool.query(
        'INSERT INTO users (username, email, password_hash, full_name) VALUES ($1, $2, $3, $4)',
        [user.username, user.email, user.password_hash, user.full_name]
      );
    }

    // Insert sample items
    const items = [
      { user_id: 1, title: 'Canon EOS Camera', description: 'Professional DSLR camera', category: 'Electronics', daily_price: 25.00 },
      { user_id: 2, title: 'Mountain Bike', description: 'Trek mountain bike in great condition', category: 'Sports', daily_price: 15.00 },
      { user_id: 1, title: 'Camping Tent', description: '4-person tent, barely used', category: 'Outdoors', daily_price: 10.00 },
      { user_id: 3, title: 'PlayStation 5', description: 'Latest gaming console', category: 'Electronics', daily_price: 20.00 }
    ];

    for (const item of items) {
      await pool.query(
        'INSERT INTO items (user_id, title, description, category, daily_price) VALUES ($1, $2, $3, $4, $5)',
        [item.user_id, item.title, item.description, item.category, item.daily_price]
      );
    }

    console.log('✓ Sample data inserted successfully');
  } catch (error) {
    console.error('⚠️ Error inserting sample data:', error.message);
  }
}

initializeDatabase();
