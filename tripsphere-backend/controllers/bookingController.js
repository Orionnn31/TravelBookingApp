const pool = require('../config/db');

// CREATE — any authenticated user
const createBooking = async (req, res) => {
  try {
    const { package_id, num_travelers, travel_date } = req.body;
    const user_id = req.user.id;

    if (!package_id || !num_travelers || !travel_date) {
      return res.status(400).json({ success: false, error: 'package_id, num_travelers, and travel_date are required' });
    }

    const [pkgRows] = await pool.query('SELECT price, max_capacity FROM travel_packages WHERE id = ?', [package_id]);
    if (pkgRows.length === 0) {
      return res.status(404).json({ success: false, error: 'Package not found' });
    }

    const pkg = pkgRows[0];
    if (num_travelers > pkg.max_capacity) {
      return res.status(400).json({ success: false, error: `Max capacity for this package is ${pkg.max_capacity}` });
    }

    const total_price = (pkg.price * num_travelers).toFixed(2);

    const [result] = await pool.query(
      `INSERT INTO bookings (user_id, package_id, num_travelers, total_price, travel_date, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [user_id, package_id, num_travelers, total_price, travel_date]
    );

    res.status(201).json({ success: true, bookingId: result.insertId, total_price });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET MY BOOKINGS — logged-in user's own
const getMyBookings = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT b.*, p.title, p.destination_city, p.destination_country
       FROM bookings b
       JOIN travel_packages p ON b.package_id = p.id
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, bookings: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET ALL — agent/admin only
const getAllBookings = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT b.*, p.title AS package_title, u.name AS customer_name, u.email AS customer_email
       FROM bookings b
       JOIN travel_packages p ON b.package_id = p.id
       JOIN users u ON b.user_id = u.id
       ORDER BY b.created_at DESC`
    );
    res.json({ success: true, bookings: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET ONE — owner or agent/admin
const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM bookings WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    const booking = rows[0];
    const isOwner = booking.user_id === req.user.id;
    const isStaff = ['agent', 'admin'].includes(req.user.role);

    if (!isOwner && !isStaff) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    res.json({ success: true, booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// UPDATE STATUS — agent/admin only (confirm/cancel)
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status value' });
    }

    const [existing] = await pool.query('SELECT id FROM bookings WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    await pool.query('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);
    res.json({ success: true, message: `Booking status updated to ${status}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// CANCEL OWN BOOKING — customer, only if pending
const cancelMyBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM bookings WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    const booking = rows[0];
    if (booking.user_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'You can only cancel your own bookings' });
    }
    if (booking.status !== 'pending') {
      return res.status(400).json({ success: false, error: `Cannot cancel a booking that is already ${booking.status}` });
    }

    await pool.query('UPDATE bookings SET status = ? WHERE id = ?', ['cancelled', id]);
    res.json({ success: true, message: 'Booking cancelled' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  createBooking, getMyBookings, getAllBookings, getBookingById, updateBookingStatus, cancelMyBooking
};