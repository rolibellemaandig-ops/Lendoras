import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_change_in_production';

// Database connection with connection pooling
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'lendora',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Security headers
app.use((req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logIcon = res.statusCode >= 400 ? '⚠️' : '✓';
    console.log(`${logIcon} ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Async handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Validation error handler
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// JWT verification middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token && req.path.includes('protected')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  }
  next();
};

app.use(verifyToken);

// Health check
app.get('/api/health', asyncHandler(async (req, res) => {
  const dbCheck = await pool.query('SELECT NOW()');
  res.json({
    status: 'ok',
    timestamp: new Date(),
    database: dbCheck.rowCount === 1 ? 'connected' : 'error'
  });
}));

// ============= AUTH ROUTES =============

app.post('/api/auth/register',
  body('username').trim().isLength({ min: 3, max: 50 }).alphanumeric(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('fullName').trim().optional().escape(),
  validateRequest,
  asyncHandler(async (req, res) => {
    const { username, email, password, fullName } = req.body;

    // Check if user exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1 OR username = $2', [email, username]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash, full_name) VALUES ($1, $2, $3, $4) RETURNING id, username, email, full_name',
      [username, email, hashedPassword, fullName]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({
      user,
      token,
      expiresIn: '30d'
    });
  })
);

app.post('/api/auth/login',
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  validateRequest,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        rating: user.rating
      },
      token,
      expiresIn: '30d'
    });
  })
);

// ============= ITEMS ROUTES =============

app.get('/api/items', asyncHandler(async (req, res) => {
  const { category, location, search } = req.query;

  let query = 'SELECT * FROM items WHERE available = true';
  const params = [];

  if (category) {
    query += ' AND category = $' + (params.length + 1);
    params.push(category);
  }

  if (location) {
    query += ' AND location ILIKE $' + (params.length + 1);
    params.push(`%${location}%`);
  }

  if (search) {
    query += ' AND (title ILIKE $' + (params.length + 1) + ' OR description ILIKE $' + (params.length + 2) + ')';
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY created_at DESC LIMIT 50';

  const result = await pool.query(query, params);
  res.json(result.rows);
}));

app.post('/api/items',
  body('title').trim().isLength({ min: 3, max: 255 }),
  body('description').trim().optional().escape(),
  body('category').trim().escape(),
  body('dailyPrice').isFloat({ min: 0.01 }),
  validateRequest,
  asyncHandler(async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { title, description, category, imageUrl, location, dailyPrice, condition } = req.body;

    const result = await pool.query(
      'INSERT INTO items (user_id, title, description, category, image_url, location, daily_price, condition, available) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true) RETURNING *',
      [req.user.id, title, description, category, imageUrl, location, dailyPrice, condition]
    );

    res.status(201).json(result.rows[0]);
  })
);

app.get('/api/items/:id', asyncHandler(async (req, res) => {
  const result = await pool.query(
    `SELECT i.*, u.username, u.rating, u.total_reviews, u.profile_image_url
     FROM items i 
     JOIN users u ON i.user_id = u.id 
     WHERE i.id = $1`,
    [req.params.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Item not found' });
  }

  res.json(result.rows[0]);
}));

// ============= RENTALS ROUTES =============

app.post('/api/rentals',
  body('itemId').isInt({ min: 1 }),
  body('lessorId').isInt({ min: 1 }),
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  validateRequest,
  asyncHandler(async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { itemId, lessorId, startDate, endDate, totalPrice } = req.body;

    // Verify item exists and is available
    const itemCheck = await pool.query('SELECT * FROM items WHERE id = $1 AND available = true', [itemId]);
    if (itemCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Item not available' });
    }

    const result = await pool.query(
      'INSERT INTO rentals (item_id, lessor_id, tenant_id, start_date, end_date, total_price, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [itemId, lessorId, req.user.id, startDate, endDate, totalPrice, 'Pending']
    );

    res.status(201).json(result.rows[0]);
  })
);

app.get('/api/rentals/user/:userId', asyncHandler(async (req, res) => {
  const result = await pool.query(
    `SELECT r.*, i.title, i.image_url, u.username, u.profile_image_url
     FROM rentals r 
     JOIN items i ON r.item_id = i.id 
     JOIN users u ON r.lessor_id = u.id 
     WHERE r.lessor_id = $1 OR r.tenant_id = $1 
     ORDER BY r.created_at DESC`,
    [req.params.userId]
  );

  res.json(result.rows);
}));

app.patch('/api/rentals/:id',
  body('status').isIn(['Pending', 'Authorized', 'Active', 'Completed', 'Cancelled']),
  validateRequest,
  asyncHandler(async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { status } = req.body;

    const result = await pool.query(
      'UPDATE rentals SET status = $1, updated_at = NOW() WHERE id = $2 AND (lessor_id = $3 OR tenant_id = $3) RETURNING *',
      [status, req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rental not found or unauthorized' });
    }

    res.json(result.rows[0]);
  })
);

// ============= MESSAGES ROUTES =============

app.post('/api/messages',
  body('recipientId').isInt({ min: 1 }),
  body('content').trim().isLength({ min: 1, max: 5000 }),
  validateRequest,
  asyncHandler(async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { recipientId, content } = req.body;

    // Check recipient exists
    const recipientCheck = await pool.query('SELECT id FROM users WHERE id = $1', [recipientId]);
    if (recipientCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    const result = await pool.query(
      'INSERT INTO messages (sender_id, recipient_id, content) VALUES ($1, $2, $3) RETURNING *',
      [req.user.id, recipientId, content]
    );

    res.status(201).json(result.rows[0]);
  })
);

app.get('/api/messages/:userId', asyncHandler(async (req, res) => {
  const result = await pool.query(
    `SELECT m.*, 
     sender.username as sender_name, 
     sender.profile_image_url as sender_avatar,
     recipient.username as recipient_name, 
     recipient.profile_image_url as recipient_avatar
     FROM messages m 
     JOIN users sender ON m.sender_id = sender.id 
     JOIN users recipient ON m.recipient_id = recipient.id 
     WHERE m.sender_id = $1 OR m.recipient_id = $1 
     ORDER BY m.created_at DESC
     LIMIT 100`,
    [req.params.userId]
  );

  res.json(result.rows);
}));

// ============= REVIEWS ROUTES =============

app.post('/api/reviews',
  body('rentalId').isInt({ min: 1 }),
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').trim().optional().escape(),
  validateRequest,
  asyncHandler(async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { rentalId, rating, comment } = req.body;

    // Get rental to find reviewee
    const rental = await pool.query('SELECT * FROM rentals WHERE id = $1', [rentalId]);
    if (rental.rows.length === 0) {
      return res.status(404).json({ error: 'Rental not found' });
    }

    const revieweeId = req.user.id === rental.rows[0].lessor_id ? rental.rows[0].tenant_id : rental.rows[0].lessor_id;

    const result = await pool.query(
      'INSERT INTO reviews (rental_id, reviewer_id, reviewee_id, rating, comment) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [rentalId, req.user.id, revieweeId, rating, comment]
    );

    // Update user rating
    await pool.query(
      'UPDATE users SET rating = (SELECT AVG(rating) FROM reviews WHERE reviewee_id = $1), total_reviews = (SELECT COUNT(*) FROM reviews WHERE reviewee_id = $1) WHERE id = $1',
      [revieweeId]
    );

    res.status(201).json(result.rows[0]);
  })
);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  if (err.code === 'ECONNREFUSED') {
    return res.status(503).json({ error: 'Database connection failed' });
  }

  res.status(500).json({
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Lendora API Server v2.0`);
  console.log(`📡 Running on http://localhost:${PORT}`);
  console.log(`🔐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Database: ${process.env.DB_NAME} @ ${process.env.DB_HOST}:${process.env.DB_PORT}\n`);

  // Database connection test
  pool.query('SELECT NOW()', (err, result) => {
    if (err) {
      console.error('❌ Database connection failed:', err.message);
      process.exit(1);
    } else {
      console.log('✓ Database connected successfully\n');
    }
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down...');
  server.close(() => {
    pool.end();
    process.exit(0);
  });
});

export default app;
