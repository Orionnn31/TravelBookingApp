const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const { verifyToken } = require('./middleware/authMiddleware');
const { authorizeRoles } = require('./middleware/roleMiddleware');

const packageRoutes = require('./routes/packageRoutes');
app.use('/api/packages', packageRoutes);

const bookingRoutes = require('./routes/bookingRoutes');
app.use('/api/bookings', bookingRoutes);

const paymentRoutes = require('./routes/paymentRoutes');
app.use('/api/payments', paymentRoutes);

// Test: any logged-in user can access
app.get('/api/protected', verifyToken, (req, res) => {
  res.json({ success: true, message: `Hello user ${req.user.id}, your role is ${req.user.role}` });
});

// Test: only admin/agent can access
app.get('/api/admin-only', verifyToken, authorizeRoles('admin', 'agent'), (req, res) => {
  res.json({ success: true, message: 'Welcome, admin/agent!' });
});

// Health check + DB test route
app.get('/', (req, res) => {
  res.send('TripSphere API is running');
});

app.get('/api/db-test', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    res.json({ success: true, result: rows[0].result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});