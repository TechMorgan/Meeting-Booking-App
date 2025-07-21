const express = require('express');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cookieParser());

const corsOptions = {
  origin: ['https://meetingbookapp.vercel.app', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('/{*any}', cors(corsOptions));

// DB
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

db.connect(err => {
  if (err) throw err;
  console.log('✅ Connected to MySQL');
});

// TOKEN UTILS
function generateAccessToken(user) {
  return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '15m' });
}

function generateRefreshToken(user) {
  return jwt.sign(user, process.env.REFRESH_SECRET, { expiresIn: '7d' });
}

// Middleware
function verifyToken(req, res, next) {
  let token = req.headers['authorization'];

  // Handle "Bearer <token>" format
  if (token && token.startsWith('Bearer ')) {
    token = token.slice(7); // remove "Bearer "
  }

  if (!token) return res.status(401).send('Token required');

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).send('Invalid or expired token');
    req.user = decoded;
    next();
  });
}


// REGISTER
app.post('/api/register', async (req, res) => {
  const { username, password, email, role } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    db.query(
      'INSERT INTO Users (username, password, email, role) VALUES (?, ?, ?, ?)',
      [username, hash, email, role],
      (err) => {
        if (err) return res.status(500).send(err);
        res.send('User registered');
      }
    );
  } catch {
    res.status(500).send('Registration failed');
  }
});

// LOGIN (shared for employee)
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.query('SELECT * FROM Users WHERE username = ?', [username], async (err, results) => {
    if (err || results.length === 0) return res.status(401).send('Invalid credentials');
    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).send('Invalid credentials');

    const userPayload = {
      id: user.id,
      username: user.username,
      role: user.role,
      email: user.email
    };

    const accessToken = generateAccessToken(userPayload);
    const refreshToken = generateRefreshToken(userPayload);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({ accessToken, user: userPayload });
  });
});

// ADMIN LOGIN (strictly check role)
app.post('/api/admin-login', (req, res) => {
  const { username, password } = req.body;
  db.query('SELECT * FROM Users WHERE username = ?', [username], async (err, results) => {
    if (err || results.length === 0) return res.status(401).send('Invalid credentials');
    const user = results[0];

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).send('Invalid credentials');

    if (user.role !== 'Admin') return res.status(403).send('Not an admin');

    const userPayload = {
      id: user.id,
      username: user.username,
      role: user.role,
      email: user.email
    };

    const accessToken = generateAccessToken(userPayload);
    const refreshToken = generateRefreshToken(userPayload);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
     secure: true,
      sameSite: 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ accessToken, user: userPayload });
  });
});

// Refresh Token
app.post('/api/refresh-token', (req, res) => {
  console.log('🍪 Raw cookies:', req.headers.cookie);
  console.log('🍪 Parsed cookies:', req.cookies);
  console.log('🔑 Refresh token:', req.cookies.refreshToken);
  
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).send('Refresh token missing');

  jwt.verify(token, process.env.REFRESH_SECRET, (err, user) => {
    if (err) return res.status(403).send('Invalid refresh token');

    const accessToken = generateAccessToken({
      id: user.id,
      username: user.username,
      role: user.role,
      email: user.email
    });

    res.json({ accessToken });
  });
});


// Get all rooms
app.get('/api/rooms', verifyToken, (req, res) => {
  db.query('SELECT * FROM Rooms', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// Admin: Add a room
app.post('/api/rooms', verifyToken, (req, res) => {
  if (req.user.role !== 'Admin') return res.status(403).send('Access denied');
  const { name, location, capacity, amenities } = req.body;
  db.query(
    'INSERT INTO Rooms (name, location, capacity, amenities) VALUES (?, ?, ?, ?)',
    [name, location, capacity, amenities],
    (err) => {
      if (err) return res.status(500).send(err);
      res.send('Room added');
    }
  );
});

// Admin: Get all users (for booking table)
app.get('/api/users', verifyToken, (req, res) => {
  if (req.user.role !== 'Admin') return res.status(403).send('Access denied');
  db.query('SELECT id, username FROM Users', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// get current user
app.get('/api/me', verifyToken, (req, res) => {
  const userId = req.user.id;
  db.query('SELECT id, username, role FROM Users WHERE id = ?', [userId], (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length === 0) return res.status(404).send('User not found');
    res.json(results[0]);
  });
});


// Employee: Book a room
app.post('/api/bookings', verifyToken, (req, res) => {
  const { room_id, start_time, end_time } = req.body;
  const checkQuery = `SELECT * FROM Bookings WHERE room_id = ? AND NOT (end_time <= ? OR start_time >= ?)`;
  db.query(checkQuery, [room_id, start_time, end_time], (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length > 0) return res.status(409).send('Room already booked for that time');

    db.query(
      'INSERT INTO Bookings (user_id, room_id, start_time, end_time) VALUES (?, ?, ?, ?)',
      [req.user.id, room_id, start_time, end_time],
      (err) => {
        if (err) return res.status(500).send(err);
        res.send('Booking successful');
      }
    );
  });
});

// Get employee bookings
// Get bookings — Admin gets all, Employee gets their own
app.get('/api/bookings', verifyToken, (req, res) => {
  const isAdmin = req.user.role === 'Admin';

  const query = isAdmin
    ? `SELECT 
         b.*, 
         u.username AS user_username, 
         r.name AS room_name 
       FROM Bookings b
       JOIN Users u ON b.user_id = u.id
       JOIN Rooms r ON b.room_id = r.id`
    : `SELECT 
         b.*, 
         u.username AS user_username, 
         r.name AS room_name 
       FROM Bookings b
       JOIN Users u ON b.user_id = u.id
       JOIN Rooms r ON b.room_id = r.id
       WHERE b.user_id = ?`;

  const params = isAdmin ? [] : [req.user.id];

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).send(err);

    // Format results into nested objects
    const formatted = results.map(b => ({
      ...b,
      user: { id: b.user_id, username: b.user_username },
      room: { id: b.room_id, name: b.room_name },
    }));

    res.json(formatted);
  });
});


// Cancel a booking (only by the user who made it)
app.delete('/api/bookings/:id', verifyToken, (req, res) => {
  const userId = req.user.id;
  const isAdmin = req.user.role === 'Admin';
  const bookingId = req.params.id;

  const query = isAdmin
    ? 'DELETE FROM Bookings WHERE id = ?'
    : 'DELETE FROM Bookings WHERE id = ? AND user_id = ?';

  const params = isAdmin ? [bookingId] : [bookingId, userId];

  db.query(query, params, (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.affectedRows === 0)
      return res.status(403).send('Unauthorized or booking not found');
    res.send('Booking cancelled');
  });
});



app.put('/api/rooms/:id', verifyToken, (req, res) => {
  if (req.user.role !== 'Admin') return res.status(403).send('Access denied');

  const { name, location, capacity, amenities } = req.body;
  db.query(
    'UPDATE Rooms SET name = ?, location = ?, capacity = ?, amenities = ? WHERE id = ?',
    [name, location, capacity, amenities, req.params.id],
    (err) => {
      if (err) return res.status(500).send(err);
      res.send('Room updated');
    }
  );
});

app.delete('/api/rooms/:id', verifyToken, (req, res) => {
  if (req.user.role !== 'Admin') return res.status(403).send('Access denied');

  db.query('DELETE FROM Rooms WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).send(err);
    res.send('Room deleted');
  });
});

app.post('/api/logout', (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    sameSite: 'None',
    secure: true,
  });
  res.sendStatus(200);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
