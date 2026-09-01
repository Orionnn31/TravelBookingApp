const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { createOrder, verifyPayment, getPaymentByBooking } = require('../controllers/paymentController');

router.post('/create-order', verifyToken, createOrder);
router.post('/verify', verifyToken, verifyPayment);
router.get('/:booking_id', verifyToken, getPaymentByBooking);

module.exports = router;