const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const {
  createBooking, getMyBookings, getAllBookings, getBookingById, updateBookingStatus, cancelMyBooking
} = require('../controllers/bookingController');

router.post('/', verifyToken, createBooking);
router.get('/my', verifyToken, getMyBookings);
router.get('/', verifyToken, authorizeRoles('agent', 'admin'), getAllBookings);
router.get('/:id', verifyToken, getBookingById);
router.put('/:id/status', verifyToken, authorizeRoles('agent', 'admin'), updateBookingStatus);
router.put('/:id/cancel', verifyToken, cancelMyBooking);

module.exports = router;