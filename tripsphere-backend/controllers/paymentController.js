const crypto = require('crypto');
const razorpayInstance = require('../config/razorpay');
const pool = require('../config/db');

// STEP 1 — Create a Razorpay order for a booking
const createOrder = async (req, res) => {
  try {
    const { booking_id } = req.body;
    if (!booking_id) {
      return res.status(400).json({ success: false, error: 'booking_id is required' });
    }

    const [rows] = await pool.query('SELECT * FROM bookings WHERE id = ?', [booking_id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    const booking = rows[0];

    if (booking.user_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'You can only pay for your own booking' });
    }
    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, error: 'Cannot pay for a cancelled booking' });
    }

    // Razorpay expects amount in paise (smallest currency unit)
    const amountInPaise = Math.round(booking.total_price * 100);

    const order = await razorpayInstance.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `booking_${booking_id}`,
    });

    res.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID, // frontend needs this to open Checkout
      booking_id: booking.id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// STEP 2 — Verify payment after Razorpay Checkout completes, then record it
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      booking_id,
      payment_method
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !booking_id) {
      return res.status(400).json({ success: false, error: 'Missing payment verification fields' });
    }

    // Verify the signature to confirm this payment is genuinely from Razorpay
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Payment verification failed — invalid signature' });
    }

    const [bookingRows] = await pool.query('SELECT * FROM bookings WHERE id = ?', [booking_id]);
    if (bookingRows.length === 0) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }
    const booking = bookingRows[0];

    // Insert payment record
    await pool.query(
      `INSERT INTO payments (booking_id, amount, payment_method, payment_status, transaction_id, paid_at)
       VALUES (?, ?, ?, 'completed', ?, NOW())`,
      [booking_id, booking.total_price, payment_method || 'card', razorpay_payment_id]
    );

    // Mark booking as confirmed
    await pool.query('UPDATE bookings SET status = ? WHERE id = ?', ['confirmed', booking_id]);

    res.json({ success: true, message: 'Payment verified and booking confirmed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Optional — get payment details for a booking
const getPaymentByBooking = async (req, res) => {
  try {
    const { booking_id } = req.params;
    const [rows] = await pool.query('SELECT * FROM payments WHERE booking_id = ?', [booking_id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'No payment found for this booking' });
    }

    res.json({ success: true, payment: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { createOrder, verifyPayment, getPaymentByBooking };